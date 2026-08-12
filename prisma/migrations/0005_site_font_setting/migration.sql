-- Preserve the current typography until an administrator selects another pair.
INSERT INTO "SiteSetting" (
  "id",
  "key",
  "value",
  "description",
  "isPublic",
  "createdAt",
  "updatedAt"
)
VALUES (
  '76446002-b16a-4c77-900e-3a32a3fa38df',
  'appearance.fontFamily',
  '"current"'::jsonb,
  'Controls the body and heading fonts used across public and admin pages.',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;
