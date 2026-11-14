# Sistema de Gestión de Restaurante - El Buen Sabor S.A.C.

Proyecto desarrollado para el curso **Soluciones Web y Aplicaciones Distribuidas (SIST1402A - UPN)**.

[![Abrir en GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/angelonavarroxd23-lab/restaurante-el-buen-sabor?quickstart=1)

## Tecnologías

| Capa | Tecnología |
|---|---|
| Base de datos | MySQL 8.0 (`restaurante_db`) |
| Backend | Java 17, Spring Boot 3.3.4, Spring Data JPA, Spring Security (JWT), Actuator |
| Frontend | Angular 18, TypeScript, Tailwind CSS (CDN) |
| Orquestación | Docker Compose, Dev Container (GitHub Codespaces) |

## Arquitectura

```
Navegador ──► frontend (nginx :4200) ──/api/*──► backend (Spring Boot :8080) ──► db (MySQL :3306)
                  │ sirve la SPA Angular             │ /actuator/health              │ volumen mysql_data
```

El frontend llama a la API con rutas relativas (`/api/...`) y nginx las reenvía al backend. Así hay **un solo origen**
(sin CORS) y basta con reenviar el puerto 4200 en Codespaces.

```
database/   Script SQL (esquema + datos semilla), se carga solo al crear el volumen de MySQL
backend/    API REST (Dockerfile multi-etapa)
frontend/   SPA Angular (Dockerfile multi-etapa + nginx.conf)
.devcontainer/devcontainer.json   Configuración de Codespaces
docker-compose.yml                MySQL + backend + frontend
scripts/    init-env.sh, smoke-test.sh, app-url.sh
```

## Opción A: GitHub Codespaces (recomendada)

1. En la página del repositorio: **Code → Codespaces → Create codespace on main**
   (o use el botón "Abrir en GitHub Codespaces" de arriba).
2. Espere a que termine la creación. Al crearse, el Dev Container ejecuta `scripts/init-env.sh`
   (genera `.env` con contraseñas aleatorias) y `docker compose up -d --build`.
   **La primera vez tarda varios minutos** (descarga de imágenes y compilación de Maven/Angular).
3. Abra el puerto **4200** desde la pestaña **Ports** (o ejecute `bash scripts/app-url.sh` para ver la URL).
   La URL tiene la forma `https://<nombre-del-codespace>-4200.app.github.dev`.
4. Inicie sesión: el formulario trae precargado el usuario demo `admin@elbuensabor.pe`
   (también `cmendoza@`, `jramirez@`, `lparedes@elbuensabor.pe`; use el selector de rol).

> Los puertos de Codespaces son **privados** por defecto (requieren iniciar sesión en GitHub). No los marque como
> públicos: el API actual no valida el JWT en los endpoints (ver "Notas de seguridad").

### Iniciar, detener y revisar

```bash
docker compose up -d --build   # construir e iniciar los 3 servicios
docker compose ps              # estado y salud (healthy)
docker compose logs -f backend # logs (también: db, frontend)
docker compose stop            # detener (conserva contenedores y datos)
docker compose down            # detener y eliminar contenedores (los datos SE CONSERVAN)
docker compose down -v         # ⚠ además borra el volumen: se pierden todos los datos
bash scripts/smoke-test.sh     # comprobación rápida de los tres servicios
```

Al detener o reanudar el codespace, los servicios vuelven a iniciarse solos (`postStartCommand`).

## Opción B: Docker en su máquina

Requiere Docker con Compose v2.

```bash
git clone https://github.com/angelonavarroxd23-lab/restaurante-el-buen-sabor.git && cd restaurante-el-buen-sabor
bash scripts/init-env.sh        # crea .env con secretos aleatorios (o copie .env.example y edítelo)
docker compose up -d --build
# Abrir http://localhost:4200
```

## Opción C: Desarrollo sin Docker (VS Code)

1. **MySQL 8**: ejecute `database/restaurante_db.sql` (MySQL Workbench o CLI).
2. **Backend** (Java 17 + Maven). Las credenciales ya no están en el código; defínalas como variables de entorno:
   ```bash
   cd backend
   export DB_USER=root DB_PASSWORD='su_clave' JWT_SECRET="$(openssl rand -hex 32)"
   mvn spring-boot:run
   ```
3. **Frontend** (Node 20):
   ```bash
   cd frontend
   npm ci
   npm start        # ng serve en :4200; proxy.conf.json reenvía /api a localhost:8080
   ```

## Variables de entorno

Definidas en `.env` (plantilla: `.env.example`). **`.env` está en `.gitignore` y no debe subirse nunca.**

| Variable | Uso |
|---|---|
| `MYSQL_ROOT_PASSWORD`, `DB_PASSWORD` | Contraseñas de MySQL (root y usuario de la aplicación) |
| `DB_NAME`, `DB_USER` | Base y usuario de la aplicación (`restaurante_db`, `restaurante_app`) |
| `JWT_SECRET` | Clave de firma de JWT (≥ 32 caracteres) |
| `DEMO_LOGIN_ENABLED` | `true` conserva el acceso demo original; póngalo en `false` fuera de prácticas |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos si el frontend se sirve desde otro origen |
| `FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT` | Puertos publicados |

Si prefiere no usar archivo `.env`, en Codespaces puede definir **Codespaces secrets** con esos mismos nombres.

## Salud y persistencia

- **MySQL**: `mysqladmin ping`. **Backend**: `GET /actuator/health` (incluye conexión a la BD). **Frontend**: `GET /healthz`.
  `docker compose ps` muestra `healthy` cuando cada servicio responde; el backend espera a MySQL y el frontend al backend.
- **Persistencia**: los datos viven en el volumen Docker `mysql_data`. Sobreviven a `stop`, `down`, reinicios y
  reconstrucciones. El script SQL solo se ejecuta cuando el volumen está vacío. En Codespaces persisten mientras
  exista el codespace (si lo elimina, se pierden).
- Prueba manual: cree un dato, ejecute `docker compose down && docker compose up -d` y compruebe que sigue ahí.

## Notas de seguridad (estado heredado del proyecto)

- El backend emite JWT pero **no lo valida**: `SecurityConfig` permite `/api/**` sin autenticación.
- `UsuarioController` devuelve el hash de contraseña de los usuarios.
- El login acepta contraseñas de demostración fijas además de la real (se controla con `DEMO_LOGIN_ENABLED`).
- Tailwind y las fuentes se cargan desde CDN, por lo que el navegador necesita Internet.

Son decisiones del proyecto original; no se modificaron para no alterar su funcionamiento, pero conviene corregirlas
antes de cualquier uso real.
