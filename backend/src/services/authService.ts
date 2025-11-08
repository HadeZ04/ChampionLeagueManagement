import bcrypt from "bcryptjs";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { query } from "../db/sqlServer";
import { appConfig } from "../config";
import { HttpError, UnauthorizedError } from "../utils/httpError";
import { logEvent } from "./auditService";

interface UserRecord {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  status: string;
  last_login_at: Date | null;
  must_reset_password: boolean;
  mfa_enabled: boolean;
}

interface RoleRecord {
  code: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const result = await query<UserRecord>(
    `SELECT TOP 1 *
     FROM user_accounts
     WHERE username = @username`,
    { username }
  );
  return result.recordset[0] ?? null;
}

async function getUserRoles(userId: number): Promise<string[]> {
  const result = await query<RoleRecord>(
    `SELECT r.code
     FROM user_role_assignments ura
     JOIN roles r ON ura.role_id = r.role_id
     WHERE ura.user_id = @userId`,
    { userId }
  );
  return result.recordset.map((row) => row.code);
}

async function getUserPermissions(userId: number): Promise<string[]> {
  const result = await query<{ code: string }>(
    `SELECT DISTINCT p.code
     FROM user_role_assignments ura
     JOIN role_permissions rp ON ura.role_id = rp.role_id
     JOIN permissions p ON rp.permission_id = p.permission_id
     WHERE ura.user_id = @userId`,
    { userId }
  );
  return result.recordset.map((row) => row.code);
}

async function getLockout(userId: number) {
  const result = await query<{ user_id: number; locked_until: Date; failed_attempts: number }>(
    `SELECT user_id, locked_until, failed_attempts
     FROM user_session_lockouts
     WHERE user_id = @userId`,
    { userId }
  );
  return result.recordset[0] ?? null;
}

async function setLockout(userId: number, failedAttempts: number, lockMinutes?: number) {
  await query(
    `MERGE user_session_lockouts AS target
    USING (SELECT @userId AS user_id) AS src
    ON target.user_id = src.user_id
    WHEN MATCHED THEN
      UPDATE SET failed_attempts = @failedAttempts,
                 locked_until = @lockedUntil
    WHEN NOT MATCHED THEN
      INSERT (user_id, failed_attempts, locked_until)
      VALUES (@userId, @failedAttempts, @lockedUntil);`,
    {
      userId,
      failedAttempts,
      lockedUntil: lockMinutes
        ? new Date(Date.now() + lockMinutes * 60 * 1000)
        : failedAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null,
    }
  );
}

async function clearLockout(userId: number) {
  await query(`DELETE FROM user_session_lockouts WHERE user_id = @userId`, { userId });
}

export async function login(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    throw UnauthorizedError("Invalid credentials");
  }

  if (user.status !== "active") {
    throw UnauthorizedError("Account is not active");
  }

  const lockout = await getLockout(user.user_id);
  if (lockout?.locked_until && lockout.locked_until > new Date()) {
    throw new HttpError(423, "Account is locked. Please try again later.");
  }

  const storedHash = Buffer.isBuffer(user.password_hash)
    ? user.password_hash.toString()
    : user.password_hash;

  const passwordMatches = await bcrypt.compare(password, storedHash);
  if (!passwordMatches) {
    const attempts = (lockout?.failed_attempts ?? 0) + 1;
    await setLockout(user.user_id, attempts);
    await logEvent({
      eventType: "USER_LOGIN_FAILED",
      severity: "warning",
      actorId: user.user_id,
      actorUsername: user.username,
      entityType: "USER",
      entityId: String(user.user_id),
      metadata: {
        failedAttempts: attempts,
      },
    });
    throw UnauthorizedError("Invalid credentials");
  }

  await clearLockout(user.user_id);

  await query(
    `UPDATE user_accounts
     SET last_login_at = SYSUTCDATETIME()
     WHERE user_id = @userId`,
    { userId: user.user_id }
  );

  const roles = await getUserRoles(user.user_id);
  const permissions = await getUserPermissions(user.user_id);
  const payload = {
    sub: user.user_id,
    username: user.username,
    roles,
    permissions,
    type: "access" as const,
  };
  const secret: Secret = appConfig.jwt.secret;
  const options: SignOptions = {
    expiresIn: appConfig.jwt.expiresIn as SignOptions["expiresIn"],
  };
  const token = jwt.sign(payload, secret, options);

  await logEvent({
    eventType: "USER_LOGIN_SUCCESS",
    severity: "info",
    actorId: user.user_id,
    actorUsername: user.username,
    actorRole: roles[0] ?? null,
    entityType: "USER",
    entityId: String(user.user_id),
  });

  return {
    token,
    user: {
      id: user.user_id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roles,
      permissions,
      lastLoginAt: new Date(),
    },
  };
}

export async function getProfile(userId: number) {
  const result = await query<UserRecord>(
    `SELECT user_id,
            username,
            email,
            first_name,
            last_name,
            status,
            last_login_at,
            must_reset_password,
            mfa_enabled
     FROM user_accounts
     WHERE user_id = @userId`,
    { userId }
  );

  const user = result.recordset[0];
  if (!user) {
    throw UnauthorizedError("User not found");
  }

  const roles = await getUserRoles(user.user_id);
  return {
    id: user.user_id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    status: user.status,
    lastLoginAt: user.last_login_at,
    mustResetPassword: user.must_reset_password,
    mfaEnabled: user.mfa_enabled,
    roles,
  };
}
