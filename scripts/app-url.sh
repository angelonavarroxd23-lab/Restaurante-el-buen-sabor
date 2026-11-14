#!/usr/bin/env bash
# Muestra la URL de la aplicación (Codespaces o local).
PORT="${FRONTEND_PORT:-4200}"
if [ -n "${CODESPACE_NAME:-}" ]; then
  echo "https://${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
else
  echo "http://localhost:${PORT}"
fi
