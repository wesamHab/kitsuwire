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

The database supports articles, categories, tags, authors, structured sections, FAQs, sources, article revisions, media references, users/roles, publishing status and newsletter subscribers.

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
