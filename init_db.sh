#!/bin/bash
set -e
export PGPASSWORD=$POSTGRES_PASSWORD;

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASS';
EOSQL

export IFS=";"
for APP_DB_NAME in $APP_DB_NAMES; do
  echo "INIT $APP_DB_NAME";
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE $APP_DB_NAME
      WITH
        OWNER = $APP_DB_USER
        ENCODING = 'UTF8'
        LC_COLLATE = 'en_US.utf8'
        LC_CTYPE = 'en_US.utf8'
        TABLESPACE = pg_default
        CONNECTION LIMIT = -1;
    \connect $APP_DB_NAME
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $APP_DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $APP_DB_USER;
EOSQL
  for APP_DB_SCHEMA in $APP_DB_SCHEMAS; do
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    \connect $APP_DB_NAME
    CREATE SCHEMA $APP_DB_SCHEMA;
    ALTER DEFAULT PRIVILEGES IN SCHEMA $APP_DB_SCHEMA GRANT ALL ON TABLES TO $APP_DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA $APP_DB_SCHEMA GRANT ALL ON SEQUENCES TO $APP_DB_USER;
    GRANT ALL ON SCHEMA $APP_DB_SCHEMA to $APP_DB_USER;
EOSQL
  done
done
