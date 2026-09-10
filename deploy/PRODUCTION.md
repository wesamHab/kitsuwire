# KitsuWire production rollout (IONOS VPS)

This runbook deploys KitsuWire next to existing services without exposing PostgreSQL or the Next.js container directly to the internet.

## Target architecture

`Internet -> Nginx :443 -> 127.0.0.1:3001 -> KitsuWire web -> private Docker network -> PostgreSQL`

The PostgreSQL service has no host port in `compose.prod.yaml`. Existing virtual hosts such as `zitounaps.de` are not modified by the KitsuWire Compose stack.

## 1. Inspect the server before changing anything

```bash
sudo nginx -T > ~/nginx-before-kitsuwire.txt
sudo ss -lntup
sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
df -h
free -h
```

Confirm that TCP port `3001` is unused. Do not remove or rename existing Docker containers, Nginx files or certificates.

## 2. DNS

At IONOS, point the apex `kitsuwire.com` A/AAAA records to the VPS. Configure `www.kitsuwire.com` to the same server if the www redirect is desired. Keep unrelated DNS records intact.

Wait until both names resolve to the VPS before requesting TLS certificates.

## 3. Application directory

Recommended location:

```bash
sudo mkdir -p /opt/kitsuwire
sudo chown "$USER":"$USER" /opt/kitsuwire
git clone https://github.com/wesamHab/kitsuwire.git /opt/kitsuwire
cd /opt/kitsuwire
```

For an existing checkout, use `git pull --ff-only` instead of recloning.

## 4. Production secrets

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Generate independent random secrets, for example:

```bash
openssl rand -hex 32
openssl rand -hex 48
```

Never paste the real `.env.production` into GitHub. The old Brevo/SMTP key that was exposed in chat must not be reused.

Required before public launch:

- `POSTGRES_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `NEWSLETTER_TOKEN_SECRET`
- legal operator fields used by `/imprint`

Brevo and AdSense values can remain empty until those integrations are approved and verified.

## 5. Start KitsuWire privately

```bash
chmod +x scripts/*.sh
./scripts/deploy-production.sh
curl -fsS http://127.0.0.1:3001/api/health
```

Do not continue to Nginx until the local health endpoint returns HTTP 200.

## 6. Create the initial admin account

Run the bootstrap tool through the dbtool image so credentials do not need to be placed in the image:

```bash
set -a
. ./.env.production
set +a
export ADMIN_EMAIL='your-admin-email'
export ADMIN_NAME='KitsuWire Admin'
export ADMIN_PASSWORD='use-a-long-unique-password'
docker compose --env-file .env.production -f compose.prod.yaml run --rm migrate node scripts/create-admin.mjs
unset ADMIN_PASSWORD ADMIN_EMAIL ADMIN_NAME
```

Do not store `ADMIN_PASSWORD` in `.env.production` after bootstrap.

## 7. Nginx and TLS

First ensure Nginx and Certbot are installed. Create an HTTP-only temporary virtual host if required for the ACME challenge, then request the certificate:

```bash
sudo certbot --nginx -d kitsuwire.com -d www.kitsuwire.com
```

After a certificate exists, copy `deploy/nginx/kitsuwire.conf` to the server's Nginx site configuration. On Debian/Ubuntu layouts:

```bash
sudo cp deploy/nginx/kitsuwire.conf /etc/nginx/sites-available/kitsuwire.com
sudo ln -s /etc/nginx/sites-available/kitsuwire.com /etc/nginx/sites-enabled/kitsuwire.com
sudo nginx -t
sudo systemctl reload nginx
```

If the symlink already exists, do not recreate it. Always run `nginx -t` before reload.

## 8. Firewall

Public inbound access should normally be limited to SSH, HTTP and HTTPS. Port 3001 is bound to loopback only and PostgreSQL has no host binding in production.

Before changing firewall rules, confirm the currently used SSH port and keep the active SSH session open until a second connection has been tested.

## 9. Backups

A local backup can be tested with:

```bash
sudo mkdir -p /var/backups/kitsuwire
sudo chown "$USER":"$USER" /var/backups/kitsuwire
BACKUP_RETENTION_DAYS=14 ./scripts/backup-production.sh
```

The script creates a PostgreSQL custom-format dump, a media archive and SHA-256 checksums. Configure `OFFSITE_BACKUP_DIR` to a separately mounted/off-server destination when available. A backup on the same VPS is not sufficient disaster recovery.

Test the restore process before relying on backups. `restore-production.sh` requires the explicit `CONFIRM_RESTORE=YES` guard.

## 10. Scheduled maintenance

Example cron entry (daily at 03:20 server local time):

```cron
20 3 * * * cd /opt/kitsuwire && /usr/bin/env BACKUP_RETENTION_DAYS=14 ./scripts/maintenance-production.sh >> /var/log/kitsuwire-maintenance.log 2>&1
```

This prunes expired application analytics, creates DB/media backups and verifies the local health endpoint.

Verify cron paths on the VPS rather than blindly copying the example.

## 11. Brevo

Before adding `BREVO_API_KEY`:

1. Verify/authenticate `kitsuwire.com` in Brevo.
2. Add the Brevo-provided DNS records at IONOS.
3. Verify `newsletter@kitsuwire.com` as the sender.
4. Revoke the previously exposed key and generate a fresh API key.
5. Store the fresh key only in `.env.production`.
6. Redeploy and test double opt-in end-to-end.

## 12. AdSense

Leave `ADSENSE_CLIENT` empty until the KitsuWire site is approved. When configured, the application still does not load the AdSense script until the visitor has enabled the Advertising category in the KitsuWire privacy controls.

Before enabling ads, review the final privacy text and Google consent requirements applicable to the traffic regions being served.

## 13. Deployment updates

For later releases:

```bash
cd /opt/kitsuwire
git pull --ff-only
./scripts/backup-production.sh
./scripts/deploy-production.sh
curl -fsS https://kitsuwire.com/api/health
```

Take a backup before migrations. If the health check fails, inspect `docker compose ... ps`, the web logs and Nginx logs before attempting unrelated changes.

## 14. Launch verification

Check at minimum:

- homepage and all four categories on desktop and mobile
- an article with generated artwork and one with an uploaded featured image
- `/search`, `/guides`, `/about`, `/contact`, `/privacy`, `/terms`, `/imprint`
- privacy choices and reopening Privacy settings
- admin login/logout and a draft preview
- newsletter subscribe -> email -> confirm -> unsubscribe (after Brevo activation)
- `robots.txt`, `sitemap.xml`, OpenGraph previews
- `/api/health`
- backup creation and checksum verification
- Certbot renewal test: `sudo certbot renew --dry-run`
