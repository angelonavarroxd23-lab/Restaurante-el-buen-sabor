#!/usr/bin/env bash
# Crea .env con contraseñas y secreto JWT aleatorios si todavía no existe.
# Nunca sobrescribe un .env existente y nunca imprime los secretos.
set -euo pipefail
cd "$(dirname "$0")/.."

# En GitHub Codespaces el navegador accede por https://<codespace>-4200.<dominio>.
# El backend rechaza (403) los POST/PUT/DELETE si ese origen no está permitido en CORS.
codespaces_origin() {
  if [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
    echo "https://${CODESPACE_NAME}-4200.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  fi
}

if [ -f .env ]; then
  # Solo se toca la línea CORS_ALLOWED_ORIGINS; no se modifica ningún secreto.
  origin="$(codespaces_origin)"
  if [ -n "$origin" ] && ! grep -qF "$origin" .env; then
    if grep -q '^CORS_ALLOWED_ORIGINS=' .env; then
      sed -i "s|^CORS_ALLOWED_ORIGINS=.*|&,${origin}|" .env
    else
      echo "CORS_ALLOWED_ORIGINS=http://localhost:4200,${origin}" >> .env
    fi
    echo "[init-env] Origen de Codespaces añadido a CORS_ALLOWED_ORIGINS."
  fi
  echo "[init-env] .env ya existe: no se sobrescribe."
  exit 0
fi

rand() { openssl rand -hex "$1"; }

sed \
  -e "s|^MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=$(rand 16)|" \
  -e "s|^DB_PASSWORD=.*|DB_PASSWORD=$(rand 16)|" \
  -e "s|^JWT_SECRET=.*|JWT_SECRET=$(rand 32)|" \
  .env.example > .env
origin="$(codespaces_origin)"
if [ -n "$origin" ]; then
  sed -i "s|^CORS_ALLOWED_ORIGINS=.*|&,${origin}|" .env
fi
chmod 600 .env
echo "[init-env] .env creado con secretos aleatorios (no se sube a git)."
