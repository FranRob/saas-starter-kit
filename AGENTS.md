# Code Review Rules — saas-starter-kit

## Review Scope
- Only flag violations **introduced or modified by the diff being reviewed**
- Do not flag pre-existing code that was not touched by the current changes
- If a violation exists in unchanged lines of a staged file, treat it as known technical debt and skip it

## General
- TypeScript strict mode — no `any` types; use unknown + type guards when needed
- Functional style — no classes in service or repository layers
- No commented-out code in final commits
- No console.log left in production paths

## Backend (Express + Prisma)

### Module structure
- Each feature module has 4 files: `.routes.ts`, `.service.ts`, `.repository.ts`, `.validator.ts`
- HTTP logic lives only in routes; business logic in service; Prisma queries in repository
- Validators use Zod schemas and are parsed in routes via `.parse()`

### Responses
- All responses use `res.json({ data: ... })` wrapper — never naked objects
- camelCase fields in all API responses — no snake_case in response bodies
- Errors handled via `next(err)` — never swallow errors silently in route handlers

### Multi-tenancy
- Every repository query MUST include `tenantId` in the `where` clause
- Never query across tenants — always scope by `req.tenantId!`

### Auth & security
- Protected routes use middleware composition: `authenticated`, `authenticatedAdmin`, or `authenticatedOwner`
- Never hardcode secrets; always read from `env.*`

### Error handling
- Throw typed errors: `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`, `BadRequestError`
- Route handlers wrap in try/catch and call `next(err)`
- Audit logging via `logAudit()` is fire-and-forget with `.catch(() => {})` — this is intentional

## Frontend (Next.js + React)

### Components
- Functional components only, named exports preferred
- Use shadcn/ui primitives — do not reinvent buttons, inputs, dialogs
- Loading states with `<Skeleton>` on all async data
- Accessibility: `aria-label`, `aria-invalid`, `role="alert"` on error messages, `aria-hidden` on decorative icons

### Data fetching
- Server state via TanStack Query (`useQuery` / `useMutation`)
- Always call `queryClient.invalidateQueries` after mutations that change list data
- API client is the axios instance from `@/lib/api` — never use raw fetch

### i18n
- New user-visible strings added to pages must use `useTranslations("namespace.key")`
- New translation keys must be added to both `messages/en.json` and `messages/es.json`
- Pre-existing hardcoded strings are known technical debt and are out of scope for this rule

### Forms
- `react-hook-form` + `zodResolver` for all forms
- Field-level errors must use `role="alert"` and `aria-invalid`

### Auth
- Auth state via `@/lib/auth` helpers (localStorage keys `ssk_token`, `ssk_tenant`)
- Unauthenticated state redirects to `/login`
