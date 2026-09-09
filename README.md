# KitsuWire

Modern editorial platform for clear intelligence across AI, technology, software and markets.

## Stack
- Next.js 15
- React 19
- TypeScript
- PostgreSQL 17
- Prisma ORM
- Docker Compose
- Responsive custom CSS

## Local development
KitsuWire now uses PostgreSQL as the application content store.

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Start PostgreSQL:
```bash
docker compose up -d db
```

3. Install dependencies and apply the schema:
```bash
npm install
npm run db:deploy
```

4. Import the legacy JSON articles once:
```bash
npm run db:import
```

5. Start Next.js:
```bash
npm run dev
```

Open http://localhost:3000.

PostgreSQL is exposed only on `127.0.0.1:5432` for local development. The web container communicates with the database through the internal Docker network.

## Admin setup
Set these values in `.env` before creating the first admin account:

```text
ADMIN_EMAIL="your-admin-email@example.com"
ADMIN_NAME="KitsuWire Admin"
ADMIN_PASSWORD="use-a-strong-password-with-at-least-12-characters"
ADMIN_SESSION_SECRET="use-a-long-random-secret-with-at-least-32-characters"
```

Create or reset the admin account:

```bash
npm run admin:create
```

Then open:

```text
http://localhost:3000/admin/login
```

Admin sessions are stored in an HttpOnly, SameSite cookie and signed with `ADMIN_SESSION_SECRET`. The public fox cursor can be enabled or disabled from the Admin Dashboard or `/admin/settings`; that preference is stored in PostgreSQL and applies globally to site visitors.

For Docker production, `ADMIN_SESSION_SECRET` is passed into the web container through Compose. Keep the production value outside Git and use a strong random secret.

## Newsletter double opt-in
The public newsletter form stores signup requests in PostgreSQL as inactive records. An address becomes active only after the confirmation link is used. Confirmation links expire after 48 hours.

Brevo is the preferred confirmation-email provider:

```text
NEWSLETTER_PUBLIC_URL="https://kitsuwire.com"
NEWSLETTER_TOKEN_SECRET="use-a-long-random-secret-at-least-32-characters"
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="newsletter@kitsuwire.com"
BREVO_SENDER_NAME="KitsuWire"
BREVO_REPLY_TO_EMAIL=""
```

KitsuWire sends confirmation messages directly through Brevo's transactional email API when both `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are configured. The sender/domain must be authenticated in Brevo before production sending.

A provider-neutral webhook is retained as a fallback and is used only when Brevo is not configured:

```text
NEWSLETTER_DELIVERY_WEBHOOK_URL="https://your-delivery-service.example/webhook"
NEWSLETTER_DELIVERY_WEBHOOK_SECRET="use-a-random-signing-secret"
```

If neither Brevo nor the webhook is configured, signup requests remain `Pending`, no confirmation mail is sent, and those addresses are never exported as active recipients.

Newsletter management is available at `/admin/newsletter`, including Pending/Active/Unsubscribed status, resend confirmation, unsubscribe, permanent deletion and protected CSV export of confirmed active recipients with individual unsubscribe URLs.

## Full Docker stack
```bash
docker compose up --build
```

Compose starts PostgreSQL, waits for it to become healthy, applies all Prisma migrations through the dedicated `migrate` service, and then starts the KitsuWire web container.

For the initial migration of the existing repository content, run once after the database is ready:
```bash
docker compose run --rm migrate npm run db:import
```

Do not run the legacy import repeatedly after content is being edited through the database/admin CMS because the import intentionally upserts the repository JSON into PostgreSQL.

## Content architecture
PostgreSQL is the source of truth for published content. The current `content/articles` JSON files are retained temporarily as migration/backup input while Phase 2 is completed.

The database supports articles, categories, tags, authors, structured sections, FAQs, sources, article revisions, media references, users/roles, publishing status, site settings, first-party page views and newsletter subscribers.

Publishing states are:
`IDEA -> DRAFT -> REVIEW -> APPROVED -> SCHEDULED -> PUBLISHED -> ARCHIVED`

## CI
GitHub Actions starts a temporary PostgreSQL 17 service on every build, applies Prisma migrations, imports the legacy article set, runs TypeScript checks and builds the application. This validates the content migration path continuously.

## Deployment direction
The intended production deployment is the existing IONOS VPS:

```text
Nginx
  -> KitsuWire Next.js container
       -> PostgreSQL container
            -> persistent Docker volume
```

PostgreSQL must not be exposed publicly. Database backups will be added before public production launch.
