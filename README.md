# SaaS Starter Kit

Boilerplate SaaS listo para producción con autenticación, multi-tenancy, RBAC, 2FA, gestión de equipo e i18n — construido para deployar rápido.

**[🚀 Ver Demo en vivo](#)** · [Reportar un bug](https://github.com/FranRob/saas-starter-kit/issues)

> Credenciales demo: `demo@example.com` / `demo1234` — los datos se resetean cada hora.

---

## Funcionalidades

- **Multi-tenancy** — cada organización tiene su propio espacio de datos aislado
- **Autenticación JWT** — tokens de acceso de corta vida con refresh tokens rotativos
- **2FA con TOTP** — autenticación de dos factores compatible con Google Authenticator y Authy
- **Gestión de equipo** — invitá usuarios por email, asigná roles OWNER / ADMIN / MEMBER
- **Reset de contraseña** — flujo completo por email con token de un solo uso
- **Verificación de email** — verificación de cuentas al registrarse
- **Registro de auditoría** — acciones clave registradas con usuario y timestamp
- **Modo demo** — reset automático de datos por hora; cuentas de prueba se eliminan a las 2h
- **i18n** — español (por defecto) e inglés con detección automática del idioma del navegador
- **Docker Compose** — un comando para levantar el stack completo localmente

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 5, TypeScript |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Caché / Tokens | Redis 7 |
| Auth | JWT, bcryptjs, speakeasy (TOTP) |
| Validación | Zod |
| Email | Nodemailer |
| i18n | next-intl |
| Infraestructura | Docker, Nginx |

---

## Inicio rápido

### Requisitos

- [Docker](https://www.docker.com/) y Docker Compose

### Levantar localmente

```bash
git clone https://github.com/FranRob/saas-starter-kit.git
cd saas-starter-kit
docker compose up --build
```

La app estará disponible en `http://localhost`.

Al primer arranque, la base de datos se inicializa automáticamente y el tenant demo se carga con:
- Usuario: `demo@example.com` / `demo1234`
- 10 contactos, 6 productos, 5 notificaciones (datos de Acme Corp)

---

## Variables de entorno

El backend lee desde `backend/.env`. Copiá `backend/.env.example` para empezar.

| Variable | Descripción | Default |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | Seteado por Docker Compose |
| `REDIS_URL` | Cadena de conexión Redis | Seteado por Docker Compose |
| `JWT_SECRET` | Secreto para firmar access tokens | — |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens | — |
| `PORT` | Puerto del backend | `3000` |
| `NODE_ENV` | Entorno | `development` |
| `FRONTEND_URL` | URL base del frontend (para links en emails) | `http://localhost` |
| `ALLOWED_ORIGINS` | Orígenes permitidos por CORS | `http://localhost` |
| `DEMO_TENANT_ID` | UUID fijo del tenant demo | `00000000-0000-0000-0000-000000000001` |
| `SMTP_HOST` | Host del servidor SMTP | — |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | — |
| `SMTP_PASS` | Contraseña SMTP | — |
| `SMTP_FROM` | Dirección remitente de emails | — |

---

## Estructura del proyecto

```
saas-starter-kit/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Schema de la base de datos
│   │   └── seed.ts             # Seed de datos demo
│   └── src/
│       ├── modules/            # Módulos por feature (auth, contacts, products, team...)
│       │   └── {name}/
│       │       ├── *.repository.ts
│       │       ├── *.service.ts
│       │       ├── *.routes.ts
│       │       └── *.validator.ts
│       ├── middleware/         # Auth, RBAC, rate limiting
│       ├── lib/                # JWT, Redis, mailer, validación de env
│       └── cron/               # Reset demo, limpieza de cuentas trial
├── frontend/
│   ├── messages/               # Archivos de traducción i18n (es.json, en.json)
│   └── src/
│       ├── app/[locale]/       # Páginas con Next.js App Router
│       ├── components/         # Componentes UI (shadcn/ui + custom)
│       └── lib/                # Cliente API, helpers de auth
└── nginx/
    └── nginx.conf              # Configuración del reverse proxy
```

---

## API

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar nuevo tenant + owner |
| POST | `/api/auth/login` | Login (devuelve tokens o challenge 2FA) |
| POST | `/api/auth/refresh` | Renovar access token |
| POST | `/api/auth/logout` | Logout (blacklist del token) |
| POST | `/api/auth/forgot-password` | Enviar email de reset de contraseña |
| POST | `/api/auth/reset-password` | Resetear contraseña con token |
| POST | `/api/auth/2fa/enable` | Habilitar 2FA (devuelve QR) |
| POST | `/api/auth/2fa/verify` | Verificar y activar 2FA |
| POST | `/api/auth/2fa/challenge` | Completar login con 2FA |
| POST | `/api/auth/2fa/disable` | Deshabilitar 2FA |
| GET | `/api/dashboard/stats` | Stats del dashboard |
| GET/POST/PUT/DELETE | `/api/contacts` | CRUD de contactos |
| GET/POST/PUT/DELETE | `/api/products` | CRUD de productos |
| GET/PUT | `/api/notifications` | Notificaciones |
| GET/POST/PUT/DELETE | `/api/team` | Gestión de equipo |
| GET/PUT | `/api/account` | Perfil de cuenta |
| GET/PUT | `/api/org` | Configuración de organización |

---

## Licencia

MIT — construido por [divMalCentrado](https://divmalcentrado.vercel.app/)
