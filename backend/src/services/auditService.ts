import { query } from "../db/sqlServer";

export interface AuditEventInput {
  eventType: string;
  severity: "info" | "warning" | "critical";
  actorId?: number;
  actorUsername?: string;
  actorRole?: string;
  entityType: string;
  entityId: string;
  payload?: unknown;
  metadata?: unknown;
}

export async function logEvent(input: AuditEventInput): Promise<void> {
  if ((process.env.NODE_ENV ?? "development") === "test") {
    return;
  }

  await query(
    `INSERT INTO audit_events (
      event_type,
      severity,
      actor_id,
      actor_username,
      actor_role,
      entity_type,
      entity_id,
      payload,
      metadata
    ) VALUES (
      @eventType,
      @severity,
      @actorId,
      @actorUsername,
      @actorRole,
      @entityType,
      @entityId,
      @payload,
      @metadata
    )`,
    {
      eventType: input.eventType,
      severity: input.severity,
      actorId: input.actorId ?? null,
      actorUsername: input.actorUsername ?? null,
      actorRole: input.actorRole ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      payload: input.payload ? JSON.stringify(input.payload) : null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    }
  );
}
