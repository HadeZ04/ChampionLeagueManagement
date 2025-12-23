import sql from "mssql";
import { transaction } from "../db/sqlServer";
import { logEvent } from "./auditService";
import { BadRequestError } from "../utils/httpError";
import { query } from "../db/sqlServer";
/**
 * DTO đăng ký cầu thủ theo mùa
 */
export interface SeasonPlayerRegistrationData {
    season_id: number;
    player_id: number;
    season_team_id: number;

    position_code: string;
    shirt_number?: number;

    player_type: 'foreign' | 'domestic';


    file_path: string;

    // audit
    user_id?: number | null;
    username?: string | null;
}

/**
 * Đăng ký cầu thủ theo mùa giải
 */
export async function registerPlayerForSeason(
    data: SeasonPlayerRegistrationData,
    existingTx?: sql.Transaction
): Promise<void> {

    const {
        season_id,
        player_id,
        season_team_id,
        position_code,
        shirt_number,
        player_type,
        file_path,
        user_id,
        username
    } = data;

    // =========================
    // 1. IN-TRANSACTION VALIDATION
    // =========================
    try {
        const registerTx = async (tx: sql.Transaction) => {
            // --- VALIDATION: Age & Foreign Limit ---
            const valReq = new sql.Request(tx);
            valReq.input("v_season_id", sql.Int, season_id);
            valReq.input("v_player_id", sql.Int, player_id);
            valReq.input("v_season_team_id", sql.Int, season_team_id);

            // --- VALIDATION: Check Team Participation ---
            const teamCheck = await valReq.query(`
                SELECT 1
                FROM season_team_participants
                WHERE season_id = @v_season_id
                  AND season_team_id = @v_season_team_id
            `);
            if (!teamCheck.recordset[0]) {
                throw BadRequestError("TEAM_NOT_IN_SEASON");
            }

            // Fetch info for Age Check
            const infoResult = await valReq.query(`
                SELECT date_of_birth 
                FROM players
                WHERE player_id = @v_player_id
            `);

            if (infoResult.recordset[0]) {
                const { date_of_birth } = infoResult.recordset[0];
                const currentYear = new Date().getFullYear();

                // Calculate age based on current year
                const birthYear = new Date(date_of_birth).getFullYear();
                const age = currentYear - birthYear;

                if (age < 16) {
                    throw BadRequestError("Cầu thủ phải từ 16 tuổi trở lên");
                }
            }

            // VALIDATION: Max squad size (22 players)
            const totalCountResult = await valReq.query(`
                SELECT COUNT(*) AS total
                FROM season_player_registrations
                WHERE season_id = @v_season_id
                  AND season_team_id = @v_season_team_id
                  AND registration_status IN ('pending', 'approved')
                  `);

            const totalPlayers = totalCountResult.recordset[0]?.total || 0;

            if (totalPlayers >= 22) {
                throw BadRequestError(
                    "Đội bóng đã đủ số lượng cầu thủ cho mùa giải (tối đa 22)");
            }


            // Check Foreign Limit
            if (player_type.toLowerCase() === 'foreign') {
                const limitResult = await valReq.query(`
                    SELECT COUNT(*) AS count 
                    FROM season_player_registrations
                    WHERE season_id = @v_season_id 
                      AND season_team_id = @v_season_team_id
                      AND player_type = 'foreign'
                `);

                const foreignCount = limitResult.recordset[0]?.count || 0;
                if (foreignCount >= 5) {
                    throw BadRequestError("Đội bóng đã đủ 5 cầu thủ nước ngoài. Không thể đăng ký thêm.");
                }
            }

            // =========================
            // 2. Insert DB
            // =========================
            const request = new sql.Request(tx);

            request.input("season_id", sql.Int, season_id);
            request.input("player_id", sql.Int, player_id);
            request.input("season_team_id", sql.Int, season_team_id)

            request.input("position_code", sql.NVarChar(50), position_code);
            request.input("player_type", sql.NVarChar(50), player_type);

            const isForeignVal = player_type.toLowerCase() === 'foreign' ? 1 : 0;
            request.input("is_foreign", sql.Bit, isForeignVal);

            request.input("shirt_number", sql.Int, shirt_number ?? null);

            request.input("file_path", sql.NVarChar(255), file_path);
            request.input("created_by", sql.Int, user_id ?? null);

            try {
                await request.query(`
                    INSERT INTO season_player_registrations (
                        season_id,
                        player_id,
                        season_team_id,
                        position_code,
                        shirt_number,
                        player_type,
                        is_foreign,
                        file_path,
                        registration_status,
                        created_by
                    )
                    VALUES (
                        @season_id,
                        @player_id,
                        @season_team_id,
                        @position_code,
                        @shirt_number,
                        @player_type,
                        @is_foreign,
                        @file_path,
                        'pending',
                        @created_by
                    )
                `);
            } catch (err: any) {
                // Allow older schemas that don't yet have created_by.
                if (err?.number === 207 || /created_by/i.test(String(err?.message ?? ""))) {
                    await request.query(`
                        INSERT INTO season_player_registrations (
                            season_id,
                            player_id,
                            season_team_id,
                            position_code,
                            shirt_number,
                            player_type,
                            is_foreign,
                            file_path,
                            registration_status
                        )
                        VALUES (
                            @season_id,
                            @player_id,
                            @season_team_id,
                            @position_code,
                            @shirt_number,
                            @player_type,
                            @is_foreign,
                            @file_path,
                            'pending'
                        )
                    `);
                    return;
                }
                throw err;
            }
        };

        if (existingTx) {
            await registerTx(existingTx);
        } else {
            await transaction(registerTx);
        }
    } catch (err: any) {
        /**
         * =========================
         * 2. MAP LỖI SQL → NGHIỆP VỤ
         * =========================
         */
        if (err?.number === 2601 || err?.number === 2627) {
            const message: string = err.message || "";

            // Trùng cầu thủ trong cùng mùa
            if (
                message.includes("UQ_season_player") ||
                message.includes("UX_season_player")
            ) {
                throw BadRequestError("PLAYER_ALREADY_REGISTERED");
            }

            // Trùng số áo trong cùng đội (mùa)
            if (
                message.includes("UX_season_team_shirt_number") ||
                message.includes("UQ_season_team_shirt_number")

            ) {
                throw BadRequestError("SHIRT_NUMBER_TAKEN");
            }
        }

        // FK error
        if (err?.number === 547) {
            const message = (err.message || "").toLowerCase();

            // Check explicit constraint name for team participation
            if (message.includes("fk_season_player_team_season")) {
                throw BadRequestError("TEAM_NOT_IN_SEASON");
            }

            if (message.includes("player_id")) {
                throw BadRequestError("PLAYER_NOT_FOUND");
            }
            if (message.includes("season_id") && !message.includes("fk_season_player_team_season")) {
                throw BadRequestError("SEASON_NOT_FOUND");
            }
            throw BadRequestError("FOREIGN_KEY_VIOLATION");
        }

        // Lỗi khác
        throw err;
    }

    // =========================
    // 3. Audit log (sau khi insert OK)
    // =========================
    await logEvent({
        eventType: "REGISTER_SEASON_PLAYER",
        severity: "info",
        actorId: user_id ?? undefined,
        actorUsername: username ?? "system",
        entityType: "season_player_registration",
        entityId: `${season_id}-${player_id}`,
        payload: {
            season_id,
            player_id,
            season_team_id,
            position_code,
            shirt_number,
            player_type,
            file_path
        }
    });
}


/**
 * Get all pending registrations
 */
export async function getPendingRegistrations(): Promise<any[]> {
    const sqlQuery = `
        SELECT 
            spr.season_player_id AS id,
            spr.season_id,
            spr.player_id,
            spr.season_team_id,
            spr.registered_at,
            spr.file_path,
            p.full_name AS player_name,
            t.name AS team_name,
            s.name AS season_name
        FROM season_player_registrations spr
        JOIN players p ON spr.player_id = p.player_id
        JOIN season_team_participants stp 
            ON spr.season_team_id = stp.season_team_id
        JOIN teams t 
            ON stp.team_id = t.team_id
        JOIN seasons s 
            ON spr.season_id = s.season_id
        WHERE spr.registration_status = 'pending'
        ORDER BY spr.registered_at ASC
    `;

    const result = await query(sqlQuery);
    return result.recordset;
}

/**
 * Approve registration
 */
export async function approveRegistration(
    id: number,
    userId?: number
): Promise<void> {

    await transaction(async (tx) => {
        const checkReq = new sql.Request(tx);
        checkReq.input("id", sql.Int, id);

        const check = await checkReq.query(`
            SELECT registration_status
            FROM season_player_registrations
            WHERE season_player_id = @id
        `);

        if (!check.recordset[0]) {
            throw BadRequestError("Registration not found");
        }

        if (check.recordset[0].registration_status !== 'pending') {
            throw BadRequestError("Registration is not pending");
        }

        const updateReq = new sql.Request(tx);
        updateReq.input("id", sql.Int, id);
        updateReq.input("approved_by", sql.Int, userId ?? null);

        try {
            await updateReq.query(`
                UPDATE season_player_registrations
                SET
                    registration_status = 'approved',
                    approved_at = GETDATE(),
                    approved_by = @approved_by,
                    reject_reason = NULL
                WHERE season_player_id = @id
            `);
        } catch (err: any) {
            if (err?.number === 207 || /reject_reason/i.test(String(err?.message ?? ""))) {
                await updateReq.query(`
                    UPDATE season_player_registrations
                    SET
                        registration_status = 'approved',
                        approved_at = GETDATE(),
                        approved_by = @approved_by
                    WHERE season_player_id = @id
                `);
                return;
            }
            throw err;
        }
    });
}

/**
 * Reject registration
 */
export async function rejectRegistration(
    id: number,
    reason: string,
    userId?: number
): Promise<void> {

    if (!reason) {
        throw BadRequestError("Reason is required");
    }

    await transaction(async (tx) => {
        // 1. Check tồn tại & pending
        const checkReq = new sql.Request(tx);
        checkReq.input("id", sql.Int, id);

        const check = await checkReq.query(`
            SELECT registration_status
            FROM season_player_registrations
            WHERE season_player_id = @id
        `);

        if (!check.recordset[0]) {
            throw BadRequestError("Registration not found");
        }

        if (check.recordset[0].registration_status !== 'pending') {
            throw BadRequestError("Registration is not pending");
        }

        // 2. Update status -> rejected (KHÔNG dùng cột không tồn tại)
        const updateReq = new sql.Request(tx);
        updateReq.input("id", sql.Int, id);
        updateReq.input("reason", sql.NVarChar(255), reason);

        try {
            await updateReq.query(`
                UPDATE season_player_registrations
                SET
                    registration_status = 'rejected',
                    reject_reason = @reason
                WHERE season_player_id = @id
            `);
        } catch (err: any) {
            if (err?.number === 207 || /reject_reason/i.test(String(err?.message ?? ""))) {
                await updateReq.query(`
                    UPDATE season_player_registrations
                    SET registration_status = 'rejected'
                    WHERE season_player_id = @id
                `);
                return;
            }
            throw err;
        }
    });
}
/**
 * Approve all pending registrations
 */
export async function approveAllPendingRegistrations(userId?: number): Promise<void> {
    await transaction(async (tx) => {
        const request = new sql.Request(tx)

        if (userId) {
            request.input('approved_by', sql.Int, userId)
        }

        await request.query(`
      UPDATE season_player_registrations
      SET
        registration_status = 'approved',
        approved_at = GETDATE(),
        approved_by = ${userId ? '@approved_by' : 'NULL'}
      WHERE registration_status = 'pending'
    `)
    })
}

/**
 * Interface for Import Data
 */
export interface ImportSeasonPlayerData {
    season_id: number;
    season_team_id: number;
    file_buffer: Buffer;
    file_path: string;
    user_id?: number;
    username?: string;
}

/**
 * Import Season Players from CSV (Batch)
 */
export async function importSeasonPlayersFromCSV(
    data: ImportSeasonPlayerData
): Promise<{ success: boolean, message: string }> {
    const { season_id, season_team_id, file_buffer, user_id, username, file_path } = data;

    // 1. Manual CSV Parse
    const fileContent = file_buffer.toString('utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
        throw BadRequestError("CSV file is empty or missing header");
    }

    const headerLine = lines[0].toLowerCase();
    if (!headerLine.includes("full_name") || !headerLine.includes("date_of_birth")) {
        throw BadRequestError("Invalid CSV Header. Required: full_name, date_of_birth, ...");
    }

    const dataRows = lines.slice(1);
    const parsedRows: any[] = [];

    for (let i = 0; i < dataRows.length; i++) {
        const rowStr = dataRows[i];
        const cols = rowStr.split(',').map(c => c.trim());
        if (cols.length < 8) continue;

        parsedRows.push({
            rowUserIndex: i + 2,
            full_name: cols[0],
            date_of_birth: cols[1],
            nationality: cols[2],
            position_code: cols[3],
            shirt_number: cols[4] ? Number(cols[4]) : null,
            height_cm: cols[5] ? Number(cols[5]) : null,
            weight_kg: cols[6] ? Number(cols[6]) : null,
            is_foreign: cols[7] === '1' || cols[7]?.toLowerCase() === 'true'
        });
    }

    if (parsedRows.length === 0) {
        throw BadRequestError("No valid data rows found in CSV");
    }

    // 2. Pre-fetch Context
    const seasonRes = await query(`SELECT start_date FROM seasons WHERE season_id = ${season_id}`);
    if (!seasonRes.recordset[0]) throw BadRequestError("Season not found");
    const seasonStartDate = new Date(seasonRes.recordset[0].start_date);

    // Current Stats
    const statsRes = await query(`
        SELECT
            COUNT(*) as total_count,
            SUM(CASE WHEN is_foreign = 1 THEN 1 ELSE 0 END) as foreign_count
        FROM season_player_registrations
        WHERE season_id = ${season_id}
          AND season_team_id = ${season_team_id}
          AND registration_status IN ('pending', 'approved')
    `);
    let currentTotal = statsRes.recordset[0]?.total_count || 0;
    let currentForeign = statsRes.recordset[0]?.foreign_count || 0;

    // Existing Shirt Numbers
    const shirtsRes = await query(`
        SELECT shirt_number
        FROM season_player_registrations
        WHERE season_id = ${season_id}
          AND season_team_id = ${season_team_id}
          AND registration_status IN ('pending', 'approved')
          AND shirt_number IS NOT NULL
    `);
    const existingShirtsDb = new Set<number>(shirtsRes.recordset.map((r: any) => r.shirt_number));

    // Player Identity Map (Name+DOB -> ID)
    const allPlayersRes = await query(`SELECT player_id, full_name, date_of_birth FROM players`);
    const playerMap = new Map<string, number>();
    allPlayersRes.recordset.forEach((p: any) => {
        const key = `${p.full_name.toLowerCase().trim()}|${new Date(p.date_of_birth).toISOString().split('T')[0]}`;
        playerMap.set(key, p.player_id);
    });

    // Existing Registrations (Global Season Check)
    const registeredPlayersRes = await query(`SELECT player_id FROM season_player_registrations WHERE season_id = ${season_id}`);
    const registeredPlayerIds = new Set<number>(registeredPlayersRes.recordset.map((r: any) => r.player_id));

    // 3. Batch Validation (Accumulate Errors)
    const errors: any[] = [];
    const csvShirts = new Set<number>();

    // Tentative counters
    let newTotal = currentTotal;
    let newForeign = currentForeign;

    for (const row of parsedRows) {
        const rowErrorBase = { row: row.rowUserIndex };

        // A. Format
        if (!row.date_of_birth || isNaN(new Date(row.date_of_birth).getTime())) {
            errors.push({ ...rowErrorBase, field: 'date_of_birth', message: "Ngày sinh không hợp lệ (yyyy-mm-dd)" });
            continue;
        }
        const dob = new Date(row.date_of_birth);

        // B. Identity Check (Pre-check for explicit duplicate error)
        const key = `${row.full_name.toLowerCase().trim()}|${dob.toISOString().split('T')[0]}`;
        const existingId = playerMap.get(key);
        if (existingId && registeredPlayerIds.has(existingId)) {
            errors.push({
                ...rowErrorBase,
                player_id: existingId,
                reason: "PLAYER_ALREADY_REGISTERED_IN_SEASON",
                message: "Cầu thủ đã được đăng ký trong mùa giải này"
            });
        }

        // C. Age Check
        let age = seasonStartDate.getFullYear() - dob.getFullYear();
        const m = seasonStartDate.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && seasonStartDate.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 16) {
            errors.push({ ...rowErrorBase, field: 'date_of_birth', message: "Cầu thủ chưa đủ 16 tuổi tại thời điểm bắt đầu mùa giải" });
        }

        // D. Shirt Number Check
        if (row.shirt_number) {
            if (existingShirtsDb.has(row.shirt_number)) {
                errors.push({ ...rowErrorBase, field: 'shirt_number', message: "Trùng số áo trong đội (đã có trong DB)" });
            }
            if (csvShirts.has(row.shirt_number)) {
                errors.push({ ...rowErrorBase, field: 'shirt_number', message: "Trùng số áo trong chính file CSV" });
            }
            csvShirts.add(row.shirt_number);
        }

        // Update counters
        newTotal++;
        if (row.is_foreign) newForeign++;
    }

    // E. Global Limits Check
    if (newTotal < 16) {
        errors.push({ row: 0, field: 'total', message: `Tổng số cầu thủ chưa đủ 16 (Hiện tại: ${newTotal})` });
    }
    if (newTotal > 22) {
        errors.push({ row: 0, field: 'total', message: `Tổng số cầu thủ vượt quá 22 (Hiện tại: ${newTotal})` });
    }
    if (newForeign > 5) {
        errors.push({ row: 0, field: 'foreign', message: `Tổng cầu thủ nước ngoài vượt quá 5 (Hiện tại: ${newForeign})` });
    }

    // F. Throw if ANY errors
    if (errors.length > 0) {
        throw BadRequestError(
            "CSV_VALIDATION_FAILED",
            {
                success: false,
                errors
            }
        );
    }

    // 4. Transaction Insert (All-or-Nothing)
    try {
        await transaction(async (tx) => {
            for (const row of parsedRows) {
                const dob = new Date(row.date_of_birth);
                const key = `${row.full_name.toLowerCase().trim()}|${dob.toISOString().split('T')[0]}`;
                let playerId: number | undefined = playerMap.get(key);

                // Create Player if new
                if (!playerId) {
                    const pReq = new sql.Request(tx);
                    pReq.input('full_name', sql.NVarChar, row.full_name);
                    pReq.input('date_of_birth', sql.Date, dob);
                    pReq.input('nationality', sql.NVarChar, row.nationality);
                    pReq.input('height', sql.Int, row.height_cm);
                    pReq.input('weight', sql.Int, row.weight_kg);

                    const pRes = await pReq.query(`
                        INSERT INTO players (full_name, date_of_birth, nationality, height_cm, weight_kg, created_at)
                        OUTPUT INSERTED.player_id
                        VALUES (@full_name, @date_of_birth, @nationality, @height, @weight, GETDATE())
                    `);

                    const insertedId = pRes.recordset?.[0]?.player_id;
                    if (!insertedId) throw new Error("Failed to create player");
                    playerId = Number(insertedId);

                    // Update map locally for next rows in same transaction
                    playerMap.set(key, playerId);
                }

                // Insert Registration
                const rReq = new sql.Request(tx);
                rReq.input('season_id', sql.Int, season_id);
                rReq.input('player_id', sql.Int, playerId);
                rReq.input('season_team_id', sql.Int, season_team_id);
                rReq.input('position_code', sql.NVarChar, row.position_code);
                rReq.input('shirt_number', sql.Int, row.shirt_number);
                rReq.input('is_foreign', sql.Bit, row.is_foreign);
                rReq.input('player_type', sql.NVarChar, row.is_foreign ? 'foreign' : 'domestic');
                rReq.input('file_path', sql.NVarChar, file_path);

                await rReq.query(`
                    INSERT INTO season_player_registrations (
                        season_id, player_id, season_team_id,
                        position_code, shirt_number, is_foreign, player_type,
                        file_path, registration_status, registered_at
                    ) VALUES (
                        @season_id, @player_id, @season_team_id,
                        @position_code, @shirt_number, @is_foreign, @player_type,
                        @file_path, 'pending', GETDATE()
                    )
                `);
            }
        });
    } catch (err: any) {
        // Map SQL Error 2627 to Validation Error
        if (err?.number === 2627 || err?.number === 2601) {
            // If we are here, it means the race condition happened or identity check missed something.
            // We cannot easily know WHICH row failed in batch insert unless we parse the error message deeply or use row-by-row inside transaction.
            // However, strictly "All-or-Nothing" with "Graceful 2627".
            // We can return a generic validation error in details.
            throw BadRequestError(
                "CSV_VALIDATION_FAILED",
                {
                    success: false,
                    errors: [{
                        row: 0,
                        reason: "PLAYER_ALREADY_REGISTERED_IN_SEASON",
                        message: "Một hoặc nhiều cầu thủ đã được đăng ký trong mùa giải (Lỗi trùng lặp dữ liệu)"
                    }]
                }
            );
        }
        throw err;
    }

    // 5. Audit
    await logEvent({
        eventType: "IMPORT_PLAYER_LIST",
        severity: "info",
        actorId: user_id ?? undefined,
        actorUsername: username ?? "system",
        entityType: "season_team",
        entityId: `${season_id}-${season_team_id}`,
        payload: { count: parsedRows.length, file_path }
    });

    return {
        success: true,
        message: "Import danh sách cầu thủ thành công"
    };
}
