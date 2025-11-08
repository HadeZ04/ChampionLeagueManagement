import { query } from "../db/sqlServer";

export async function listPermissions() {
  const result = await query(
    `SELECT permission_id, code, name, description
     FROM permissions
     ORDER BY name`
  );
  return result.recordset;
}
