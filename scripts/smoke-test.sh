#!/usr/bin/env bash
# Verifica que los tres servicios responden y que los datos están en MySQL.
# Uso: bash scripts/smoke-test.sh [URL_BASE]   (por defecto http://localhost:4200)
set -uo pipefail
BASE="${1:-http://localhost:${FRONTEND_PORT:-4200}}"
fail=0
check() { # nombre, comando
  if eval "$2" >/dev/null 2>&1; then echo "OK    $1"; else echo "FALLA $1"; fail=1; fi
}

check "Frontend sirve index.html"            "curl -fsS $BASE/ | grep -qi '<app-root'"
check "Frontend /healthz"                    "curl -fsS $BASE/healthz | grep -q ok"
check "Backend /actuator/health = UP (vía nginx no expuesto; directo)" \
      "curl -fsS http://localhost:${BACKEND_PORT:-8080}/actuator/health | grep -q '\"status\":\"UP\"'"
check "API /api/platos devuelve datos (MySQL)" "curl -fsS $BASE/api/platos | grep -q 'Lomo Saltado'"
check "API /api/mesas devuelve datos"          "curl -fsS $BASE/api/mesas | grep -q 'Terraza'"
check "Login emite JWT" \
      "curl -fsS -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@elbuensabor.pe\",\"password\":\"admin123\"}' | grep -q '\"token\"'"

[ $fail -eq 0 ] && echo "== Todo correcto ==" || echo "== Hay fallos =="
exit $fail
