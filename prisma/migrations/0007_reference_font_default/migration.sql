WITH previous AS MATERIALIZED (
  SELECT "id", "value"
  FROM "SiteSetting"
  WHERE "key" = 'appearance.fontFamily'
), changed AS (
  UPDATE "SiteSetting" AS setting
  SET "value" = '"current"'::jsonb,
      "updatedAt" = CURRENT_TIMESTAMP
  FROM previous
  WHERE setting."id" = previous."id"
    AND previous."value" IS DISTINCT FROM '"current"'::jsonb
  RETURNING setting."id"
), actor AS (
  SELECT "id"
  FROM "Profile"
  WHERE "role" = 'SUPER_ADMIN'
    AND "status" = 'ACTIVE'
  ORDER BY "createdAt" ASC
  LIMIT 1
)
INSERT INTO "AuditLog" (
  "id",
  "actorId",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  gen_random_uuid(),
  actor."id",
  'SITE_SETTING_UPDATED',
  'SiteSetting',
  changed."id",
  'Changed the site font to the reference-matched default',
  jsonb_build_object(
    'key', 'appearance.fontFamily',
    'previousValue', previous."value",
    'nextValue', 'current',
    'source', 'migration'
  ),
  CURRENT_TIMESTAMP
FROM changed
JOIN previous ON previous."id" = changed."id"
LEFT JOIN actor ON TRUE;
