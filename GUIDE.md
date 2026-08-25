# Deployment Guide — Peppermint (Grandway) Frontend

Audience: DevOps / whoever puts this on a server.
Scope: building the two Next.js apps in this repo and running them under **PM2**.

---

## 1. What is in this repo

This is a **Turborepo monorepo** managed with **pnpm workspaces**. It contains two
deployable Next.js applications and a set of internal shared libraries.

```
ppm/
├── apps/
│   ├── grandway/           → admin portal   (private, staff-only, talks to the API)
│   └── grandway-website/   → public website (marketing site, no API)
├── packages/               → shared libraries, NOT deployed on their own
│   ├── ui/                 → Mantine component wrapper
│   ├── admin/              → admin shells, forms, table primitives
│   ├── api-client/         → configured Axios client
│   ├── utils/              → shared helpers
│   └── config, docs, kanban → reserved / empty placeholders
├── turbo.json              → task graph (build / lint / check-types)
├── pnpm-workspace.yaml
└── package.json            → root scripts
```

### 1.1 The two apps

|                       | `grandway`                                                                                                                                                                                                                                  | `grandway-website`                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Path                  | `apps/grandway`                                                                                                                                                                                                                             | `apps/grandway-website`                                                                                                     |
| What it is            | Internal **admin portal** — staff sign-in (password + device binding + optional TOTP MFA), user & session administration, audit log, lead management, applicants & applicant journeys, checklists, documents, institutions, offers, clients | **Public marketing website** — home, about, services, destinations (+ per-country pages), contact, partnership certificates |
| Who uses it           | Grandway staff only                                                                                                                                                                                                                         | The general public                                                                                                          |
| Needs the backend API | **Yes** — hard dependency                                                                                                                                                                                                                   | **No**                                                                                                                      |
| Runtime               | Node (Next.js server, mixed static + dynamic routes)                                                                                                                                                                                        | Node (Next.js server, almost entirely static/SSG)                                                                           |
| Suggested port        | `3001`                                                                                                                                                                                                                                      | `3000`                                                                                                                      |
| Suggested hostname    | `admin.<yourdomain>`                                                                                                                                                                                                                        | `<yourdomain>` / `www.<yourdomain>`                                                                                         |

### 1.2 Important: the shared packages have no build step

`@peppermint/ui`, `@peppermint/admin`, `@peppermint/api-client` and `@peppermint/utils`
are consumed as **TypeScript source** and compiled by each app's Next.js build.

Consequence: **you cannot copy just `apps/grandway` to the server.** The whole repo
(plus a full workspace `pnpm install`) must be present when you run the build.

### 1.3 The backend is NOT in this repo

The admin portal talks to a separate **Django REST API**. It is deployed and operated
independently — nothing in this repo builds or runs it. All this repo needs is a
reachable base URL for that API (see §3).

---

## 2. Server prerequisites

| Requirement | Version                                                                 | Notes                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js     | **≥ 20**, 22 LTS or 24 recommended                                      | repo `engines` says `>=18`; it is developed on Node 24                                                                                                                                                                            |
| pnpm        | **9.0.0** (pinned by `packageManager` in the root `package.json`)       | **this is what installs and builds the repo** — do not use npm or yarn for it, the lockfile is pnpm's                                                                                                                             |
| npm         | **whatever ships with your Node** — 10.x on Node 20/22, 11.x on Node 24 | used for exactly two things: `npm install -g pm2`, and `corepack` if you install it that way. Never run `npm install` inside this repo — it ignores `pnpm-lock.yaml`, flattens the workspace and breaks the `@peppermint/*` links |
| PM2         | latest                                                                  | process manager                                                                                                                                                                                                                   |
| git         | any                                                                     | to pull the repo                                                                                                                                                                                                                  |
| RAM         | 2 GB minimum, 4 GB recommended                                          | the Next.js build is the memory-hungry part                                                                                                                                                                                       |

```bash
# Node via nvm (example)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22 && nvm use 22

# pnpm — use corepack, it honours the version pinned in package.json
corepack enable
corepack prepare pnpm@9.0.0 --activate

# PM2
npm install -g pm2

node -v && npm -v && pnpm -v && pm2 -v
# expected, roughly: v22.x or v24.x / 10.x or 11.x / 9.0.0 / 5.x
```

> If you use nvm, PM2 must be started with the same Node version you built with.
> Prefer a system-wide Node (`/usr/bin/node`) on servers, or run
> `pm2 startup` from inside the correct nvm shell so the boot script keeps that path.

---

## 3. Environment variables

Only the admin app needs configuration.

| App                | Variable              | Required                                  | Production value                    | Notes                                                                                                                                                               |
| ------------------ | --------------------- | ----------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grandway`         | `NEXT_PUBLIC_API_URL` | Optional — defaults to the production URL | `https://api.grandwayeducation.com` | Base URL of the Django API. No trailing slash. The app appends `/api/v1/...` itself. Set it only to point a build at a different backend (a local Django, staging). |
| `grandway-website` | —                     | —                                         | —                                   | No environment variables.                                                                                                                                           |

### ⚠️ Read this before you build

`NEXT_PUBLIC_*` variables are **inlined into the JavaScript bundle at build time**, not
read at runtime. That means:

- The value must be set **before** `pnpm build`, not before `pm2 start`.
- Changing the API URL requires a **full rebuild and restart** — editing the file and
  restarting PM2 does nothing.
- Never put a secret in a `NEXT_PUBLIC_*` variable — it ships to the browser.

### Where to put it

Env files are **git-ignored** and are not in the repo. Create it on the server:

```bash
cd /srv/ppm/apps/grandway
cat > .env.production <<'EOF'
NEXT_PUBLIC_API_URL=https://api.grandwayeducation.com
EOF
```

`https://api.grandwayeducation.com` is also compiled in as the **default** (see
`apps/grandway/lib/api.ts`), so a production build with no env file at all still talks to
the right backend. Create the file anyway — it makes the deployed target explicit, and it
is the only way to point a build somewhere else.

Development machines override it with a `.env.local` (e.g. `http://10.22.22.2:8000`, a
LAN address). `.env.local` wins over `.env.production`, so **make sure no stale
`.env.local` exists on the server** — one pointing at a LAN backend silently breaks the
production build.

### Backend-side requirements

The API must, for the admin portal to work:

- serve HTTPS on the URL above,
- allow CORS from the admin origin (`https://admin.yourdomain.com`) — echoing the
  **specific** origin, not `*`, and sending `Access-Control-Allow-Credentials: true`
  if refresh cookies are enabled,
- issue the refresh credential (either `data.refresh` in the login body or a
  `Secure; HttpOnly; SameSite` cookie). Without it, staff sessions silently drop to the
  sign-in page when the access token expires. See `apps/grandway/lib/api.ts` for the
  full explanation of this constraint.

---

## 4. Getting the code and building

```bash
# 1. Clone (first deploy)
sudo mkdir -p /srv && cd /srv
git clone <repo-url> ppm
cd /srv/ppm

# 2. Install workspace dependencies (exact lockfile — never resolve fresh on a server)
pnpm install --frozen-lockfile

# 3. Create the env file (see §3)
printf 'NEXT_PUBLIC_API_URL=https://api.grandwayeducation.com\n' > apps/grandway/.env.production

# 4. Build both apps
pnpm build
```

`pnpm build` runs `turbo run build`, which builds every app in the workspace.
To build one app only:

```bash
pnpm turbo run build --filter=grandway
pnpm turbo run build --filter=grandway-website
```

Build output lands in `apps/<app>/.next/`. A successful run ends with:

```
Tasks:    2 successful, 2 total
```

Turbo caches results — if nothing changed, a build is a no-op. Force a clean rebuild
with `pnpm build --force`.

### Optional pre-flight checks

```bash
pnpm check-types    # TypeScript across the workspace
pnpm lint           # ESLint
pnpm format:check   # Prettier
```

### Known harmless build warning

```
Failed to find font override values for font `Stack Sans Text`
Skipping generating a fallback font.
```

This is a cosmetic Next.js font-metrics warning on the website. It is **not** an error
and does not affect the deployment.

---

## 5. Running with PM2

### 5.1 Ecosystem file

Create `/srv/ppm/ecosystem.config.js` (repo root):

```js
// PM2 process definitions for the Grandway frontend apps.
// Start:  pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "grandway-website",
      cwd: "/srv/ppm/apps/grandway-website",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      interpreter: "node",
      exec_mode: "cluster",
      instances: 2,
      max_memory_restart: "512M",
      env: { NODE_ENV: "production" },
      out_file: "/var/log/pm2/grandway-website.out.log",
      error_file: "/var/log/pm2/grandway-website.err.log",
      time: true,
    },
    {
      name: "grandway-admin",
      cwd: "/srv/ppm/apps/grandway",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3001 -H 127.0.0.1",
      interpreter: "node",
      exec_mode: "cluster",
      instances: 2,
      max_memory_restart: "768M",
      env: { NODE_ENV: "production" },
      out_file: "/var/log/pm2/grandway-admin.out.log",
      error_file: "/var/log/pm2/grandway-admin.err.log",
      time: true,
    },
  ],
};
```

Notes on the choices above:

- **`script` points at the real Next binary**, not `pnpm`. Running `pm2 start pnpm -- start`
  works but PM2 then supervises a shell wrapper, so restarts and memory limits apply to
  the wrong process.
- **`-H 127.0.0.1`** binds to localhost only; the reverse proxy (§7) is the public entry
  point. Drop this flag only if you are exposing the Node port directly.
- **`cluster` mode with `instances: 2`** gives you rolling reloads and uses more than one
  core. Set `instances: "max"` on a bigger box, or `1` on a small VPS.
- Adjust every `cwd` if the repo does not live at `/srv/ppm`.

```bash
sudo mkdir -p /var/log/pm2 && sudo chown "$USER" /var/log/pm2
```

### 5.2 First start

```bash
cd /srv/ppm
pm2 start ecosystem.config.js
pm2 save                 # persist the process list
pm2 startup              # prints a command — run it (with sudo) to start PM2 on boot
pm2 status
```

Verify locally before touching DNS:

```bash
curl -I http://127.0.0.1:3000        # website
curl -I http://127.0.0.1:3001        # admin
```

Both should return `200` (the admin root may redirect to the sign-in page).

### 5.3 Everyday PM2 commands

```bash
pm2 status                       # process table
pm2 logs grandway-admin          # tail logs for one app
pm2 logs --lines 200             # recent logs for everything
pm2 reload grandway-admin        # zero-downtime reload (cluster mode)
pm2 restart grandway-admin       # hard restart
pm2 stop grandway-website
pm2 delete grandway-website
pm2 monit                        # live CPU/memory dashboard
pm2 flush                        # clear log files
```

Use **`reload`**, not `restart`, for routine deploys — in cluster mode it swaps workers
one at a time and no request is dropped.

---

## 6. Redeploying a new version

```bash
cd /srv/ppm

git pull                              # 1. fetch the new code
pnpm install --frozen-lockfile        # 2. sync dependencies (no-op if unchanged)
pnpm build                            # 3. rebuild (turbo skips unchanged apps)
pm2 reload ecosystem.config.js        # 4. zero-downtime swap
pm2 save
```

As a script — `/srv/ppm/deploy.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

cd /srv/ppm
echo "→ pulling"       && git pull --ff-only
echo "→ installing"    && pnpm install --frozen-lockfile
echo "→ building"      && pnpm build
echo "→ reloading pm2" && pm2 reload ecosystem.config.js
pm2 save
echo "✓ deployed"
```

```bash
chmod +x /srv/ppm/deploy.sh
```

**Build safety:** `pnpm build` overwrites `.next/` in place, so the app is briefly serving
from a directory that is being rewritten. On a busy production box, build first and reload
after — that is what the order above does — or, for a stricter setup, build in a separate
checkout and switch a symlink before `pm2 reload`.

**Rollback:**

```bash
cd /srv/ppm
git log --oneline -10
git checkout <previous-commit>
pnpm install --frozen-lockfile && pnpm build && pm2 reload ecosystem.config.js
```

---

## 7. Reverse proxy (nginx)

PM2 runs the apps on localhost; nginx terminates TLS and routes by hostname.

```nginx
# /etc/nginx/sites-available/grandway
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name admin.yourdomain.com;
    client_max_body_size 25M;          # document uploads in the admin portal
    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/grandway /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com
```

The admin portal is staff-only — consider additionally restricting `admin.yourdomain.com`
by IP allow-list or VPN at the nginx level.

---

## 8. Troubleshooting

| Symptom                                                       | Cause                                                       | Fix                                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `next: not found` / PM2 process errors instantly              | dependencies not installed, or wrong `cwd`                  | `pnpm install --frozen-lockfile` at the repo root; check each `cwd` in the ecosystem file |
| `Could not find a production build in the .next directory`    | app never built, or build failed                            | run `pnpm build` and read the output                                                      |
| Admin loads but every request fails with a network/CORS error | `NEXT_PUBLIC_API_URL` wrong, or API CORS rejects the origin | fix the value, **rebuild**, reload; fix CORS on the Django side                           |
| Admin still calls the old API URL after an env change         | `NEXT_PUBLIC_*` is baked in at build time                   | `pnpm build --force` then `pm2 reload`                                                    |
| Staff get bounced to the sign-in page after a while           | no refresh credential issued by the backend                 | backend fix — see §3 and `apps/grandway/lib/api.ts`                                       |
| `EADDRINUSE`                                                  | port already taken                                          | `ss -ltnp \| grep 300` , change the port in the ecosystem file                            |
| Build killed / out of memory                                  | not enough RAM                                              | add swap, or build one app at a time with `--filter`                                      |
| Apps do not come back after reboot                            | `pm2 startup` never run/registered                          | `pm2 save && pm2 startup`, then run the printed command                                   |
| Stale/odd build output                                        | corrupt turbo or Next cache                                 | `rm -rf apps/*/.next .turbo && pnpm build`                                                |
| `ERR_PNPM_OUTDATED_LOCKFILE` on install                       | `package.json` changed without the lockfile                 | commit an updated `pnpm-lock.yaml` from a dev machine                                     |

### Health checks

```bash
pm2 status
curl -sI http://127.0.0.1:3000 | head -1
curl -sI http://127.0.0.1:3001 | head -1
curl -sI https://api.grandwayeducation.com/api/v1/auth/ | head -1   # backend reachable?
```

### Log rotation

PM2 logs grow forever by default:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

---

## 9. Deployment checklist

- [ ] Node ≥ 20 and pnpm 9 installed (via corepack), PM2 installed globally
- [ ] Repo cloned to `/srv/ppm`
- [ ] `pnpm install --frozen-lockfile` completed with no errors
- [ ] `apps/grandway/.env.production` created with the **production** `NEXT_PUBLIC_API_URL`
- [ ] `pnpm build` → `2 successful, 2 total`
- [ ] `ecosystem.config.js` created, paths and ports match the server
- [ ] `pm2 start ecosystem.config.js` → both processes `online`
- [ ] `curl` on `127.0.0.1:3000` and `:3001` returns 200
- [ ] nginx vhosts configured, `nginx -t` passes, TLS certificates issued
- [ ] Backend API reachable over HTTPS and CORS allows the admin origin
- [ ] `pm2 save` + `pm2 startup` done — survives a reboot (test it)
- [ ] `pm2-logrotate` installed
- [ ] `deploy.sh` in place and tested once end-to-end
