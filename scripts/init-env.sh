#!/usr/bin/env bash
# Crea .env con contraseñas y secreto JWT aleatorios si todavía no existe.
# Nunca sobrescribe un .env existente y nunca imprime los secretos.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  echo "[init-env] .env ya existe: no se modifica."
  exit 0
fi

rand() { openssl rand -hex "$1"; }

sed \
  -e "s|^MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=$(rand 16)|" \
  -e "s|^DB_PASSWORD=.*|DB_PASSWORD=$(rand 16)|" \
  -e "s|^JWT_SECRET=.*|JWT_SECRET=$(rand 32)|" \
  .env.example > .env
chmod 600 .env
echo "[init-env] .env creado con secretos aleatorios (no se sube a git)."
