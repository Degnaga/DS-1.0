# SQL commands

[check existing tables]:
psql postgres://neondb_owner:npg_uDo6HEMxkt5O@ep-square-feather-a2frq7rg-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require -c "\dt"

[create tables]:
psql postgres://neondb_owner:npg_uDo6HEMxkt5O@ep-square-feather-a2frq7rg-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require -f schema.sql

[drop all tables]:
psql "postgres://neondb_owner:npg_uDo6HEMxkt5O@ep-square-feather-a2frq7rg-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require" -c '
DO $$
DECLARE
r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = '"'"'public'"'"')
LOOP
EXECUTE '"'"'DROP TABLE IF EXISTS '"'"' || quote_ident(r.tablename) || '"'"' CASCADE'"'"';
END LOOP;
END $$;'

[drop a single table, ! replace the table_name]
psql postgres://neondb_owner:npg_uDo6HEMxkt5O@ep-square-feather-a2frq7rg-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require -c "DROP TABLE table_name CASCADE;"

[modify field (title in notices table)]
psql postgres://neondb_owner:npg_uDo6HEMxkt5O@ep-square-feather-a2frq7rg-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require -c ALTER TABLE notices
"ALTER COLUMN title TYPE VARCHAR(70),
ADD CONSTRAINT notices_title_length
CHECK (char_length(title) >= 50 AND char_length(title) <= 70);"

# Insert categories into the categories table

psql postgres://neondb_owner:npg_...-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require -f seed.sql

# seeding by api:

➡️ http://localhost:3000/api/seed
