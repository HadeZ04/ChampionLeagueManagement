import bcrypt from "bcryptjs";
import { query, transaction } from "../db/sqlServer";
import { BadRequestError, NotFoundError } from "../utils/httpError";
import { logEvent } from "./auditService";

const SALT_ROUNDS = 10;

interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  status?: string;
  createdBy?: number | null;
  metadata?: Record<string, unknown>;
}

interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  password?: string;
  updatedBy: number;
}

interface PublicRegistrationInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UserListRow {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  last_login_at: Date | null;
  created_at: Date;
  mfa_enabled: boolean;
  roles_json: string | null;
}

function parseRolesJson(value?: string | null) {
  if (!value) {
    return [];
  }
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

async function ensureUniqueEmail(email: string, excludeUserId?: number) {
  const result = await query(
    `SELECT user_id
     FROM user_accounts
     WHERE email = @email
       AND (@excludeUserId IS NULL OR user_id <> @excludeUserId)`,
    { email, excludeUserId: excludeUserId ?? null }
  );
  if (result.recordset.length > 0) {
    throw BadRequestError("Email already exists");
  }
}

export async function listUsers(page = 1, pageSize = 25) {
  const offset = (page - 1) * pageSize;
  const result = await query(
    `SELECT ua.user_id,
            ua.username,
            ua.email,
            ua.first_name,
            ua.last_name,
            ua.status,
            ua.last_login_at,
            ua.created_at,
            ua.mfa_enabled,
            ISNULL(roles.roles_json, '[]') AS roles_json
     FROM user_accounts AS ua
     OUTER APPLY (
        SELECT r.role_id AS roleId,
               r.code,
               r.name,
               ura.assigned_at AS assignedAt
        FROM user_role_assignments AS ura
        JOIN roles AS r ON ura.role_id = r.role_id
        WHERE ura.user_id = ua.user_id
        ORDER BY ura.assigned_at DESC
        FOR JSON PATH
     ) AS roles(roles_json)
     ORDER BY ua.created_at DESC
     OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
     SELECT COUNT(*) AS total FROM user_accounts;`,
    { offset, pageSize }
  );

  const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
  const rows = (recordsets[0] ?? result.recordset ?? []) as UserListRow[];
  const users = rows.map((row) => ({
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    status: row.status,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    mfa_enabled: row.mfa_enabled,
    roles: parseRolesJson(row.roles_json),
  }));

  return {
    data: users,
    total: Number((recordsets[1]?.[0] as { total?: number } | undefined)?.total ?? 0),
    page,
    pageSize,
  };
}

export async function getUserById(userId: number) {
  const result = await query(
    `SELECT ua.user_id,
            ua.username,
            ua.email,
            ua.first_name,
            ua.last_name,
            ua.status,
            ua.last_login_at,
            ua.created_at,
            ua.mfa_enabled,
            ISNULL(roles.roles_json, '[]') AS roles_json
     FROM user_accounts AS ua
     OUTER APPLY (
        SELECT r.role_id AS roleId,
               r.code,
               r.name,
               ura.assigned_at AS assignedAt
        FROM user_role_assignments AS ura
        JOIN roles AS r ON ura.role_id = r.role_id
        WHERE ura.user_id = ua.user_id
        ORDER BY ura.assigned_at DESC
        FOR JSON PATH
     ) AS roles(roles_json)
     WHERE ua.user_id = @userId`,
    { userId }
  );
  const user = result.recordset[0];
  if (!user) {
    throw NotFoundError("User not found");
  }
  return {
    ...user,
    roles: parseRolesJson(user.roles_json),
  };
}

export async function getUserRolesList(userId: number) {
  const result = await query(
    `SELECT r.role_id, r.code, r.name
     FROM user_role_assignments ura
     JOIN roles r ON ura.role_id = r.role_id
     WHERE ura.user_id = @userId`,
    { userId }
  );
  return result.recordset;
}

export async function createUser(input: CreateUserInput) {
  const existing = await query(
    `SELECT user_id FROM user_accounts WHERE username = @username OR email = @email`,
    { username: input.username, email: input.email }
  );
  if (existing.recordset.length > 0) {
    throw BadRequestError("Username or email already exists");
  }

  await ensureUniqueEmail(input.email);

  const passwordHashString = await bcrypt.hash(input.password, SALT_ROUNDS);
  const passwordHash = Buffer.from(passwordHashString, "utf8");
  const result = await query(
    `INSERT INTO user_accounts (
      username,
      email,
      password_hash,
      first_name,
      last_name,
      status,
      created_at,
      created_by
    ) OUTPUT INSERTED.user_id
    VALUES (
      @username,
      @email,
      @passwordHash,
      @firstName,
      @lastName,
      @status,
      SYSUTCDATETIME(),
      @createdBy
    )`,
    {
      username: input.username,
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      status: input.status ?? "active",
      createdBy: input.createdBy ?? null,
    }
  );

  const userId = result.recordset[0]?.user_id;

  await logEvent({
    eventType: "USER_CREATED",
    severity: "info",
    actorId: input.createdBy ?? undefined,
    entityType: "USER",
    entityId: String(userId),
    payload: {
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    },
    metadata: input.metadata ?? {
      email: input.email,
    },
  });

  return userId;
}

export async function registerPublicUser(
  input: PublicRegistrationInput,
  metadata?: Record<string, unknown>
) {
  const userId = await createUser({
    username: input.username,
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    status: "active",
    createdBy: null,
    metadata,
  });

  const roleResult = await query(
    `SELECT role_id FROM roles WHERE code = @code`,
    { code: "viewer" }
  );
  const roleId = roleResult.recordset[0]?.role_id;
  if (!roleId) {
    throw BadRequestError("Viewer role is not configured");
  }

  await assignRole(userId, roleId, userId);
  return { userId };
}

export async function updateUser(userId: number, input: UpdateUserInput) {
  const user = await getUserById(userId);

  const updates: string[] = [];
  const params: Record<string, unknown> = {
    userId,
    updatedBy: input.updatedBy,
  };

  if (input.email) {
    await ensureUniqueEmail(input.email, userId);
    updates.push("email = @email");
    params.email = input.email;
  }
  if (input.firstName) {
    updates.push("first_name = @firstName");
    params.firstName = input.firstName;
  }
  if (input.lastName) {
    updates.push("last_name = @lastName");
    params.lastName = input.lastName;
  }
  if (input.status) {
    updates.push("status = @status");
    params.status = input.status;
  }
  if (input.password) {
    updates.push("password_hash = @passwordHash");
    const newHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    params.passwordHash = Buffer.from(newHash, "utf8");
  }

  if (updates.length === 0) {
    return user;
  }

  await query(
    `UPDATE user_accounts
     SET ${updates.join(", ")},
         updated_at = SYSUTCDATETIME(),
         updated_by = @updatedBy
     WHERE user_id = @userId`,
    params
  );

  await logEvent({
    eventType: "USER_UPDATED",
    severity: "info",
    actorId: input.updatedBy,
    entityType: "USER",
    entityId: String(userId),
    payload: { changes: updates },
  });

  return getUserById(userId);
}

export async function deleteUser(userId: number, actorId: number) {
  await transaction(async (tx) => {
    const request = tx.request();
    request.input("userId", userId);
    await request.query(`
      DELETE FROM user_role_assignments WHERE user_id = @userId;
      DELETE FROM user_session_lockouts WHERE user_id = @userId;
      DELETE FROM user_accounts WHERE user_id = @userId;
    `);
  });

  await logEvent({
    eventType: "USER_DEACTIVATED",
    severity: "warning",
    actorId,
    entityType: "USER",
    entityId: String(userId),
  });
}

export async function assignRole(userId: number, roleId: number, actorId: number) {
  await query(
    `INSERT INTO user_role_assignments (user_id, role_id, assigned_at, assigned_by)
     VALUES (@userId, @roleId, SYSUTCDATETIME(), @actorId)`,
    { userId, roleId, actorId }
  );

  await logEvent({
    eventType: "USER_ROLE_ASSIGNED",
    severity: "info",
    actorId,
    entityType: "USER",
    entityId: String(userId),
    payload: { roleId },
  });
}

export async function removeRole(userId: number, roleId: number, actorId: number) {
  await query(
    `DELETE FROM user_role_assignments
     WHERE user_id = @userId AND role_id = @roleId`,
    { userId, roleId }
  );

  await logEvent({
    eventType: "USER_ROLE_REMOVED",
    severity: "info",
    actorId,
    entityType: "USER",
    entityId: String(userId),
    payload: { roleId },
  });
}
