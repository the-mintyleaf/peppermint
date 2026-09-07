# Deployment Guide — Peppermint (Grandway) Frontend

Audience: DevOps / whoever puts this on a server.
Scope: building the two Next.js apps in this repo and running them under **PM2**.

> **Start with `ssh-guide.md`.** This repository is private. Before anything here works
> you need the deploy SSH key installed and the repo cloned from the `release` branch —
> that is what `ssh-guide.md` covers, step by step. Come back here once
> `git clone` succeeds.
>
> **Deployments always track the `release` branch, never `main`.** `main` is the
> day-to-day development branch; `release` is what is signed off for production.

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

### 2.1 Version matrix — what must be installed

| Requirement | Version to install                                          | Where it comes from            | What it is used for                                   |
| ----------- | ----------------------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| **Node.js** | **22.x LTS** (recommended) — 24.x also fine, **20.x** floor | nvm or NodeSource (see below)  | runs the Next.js build and the two production servers |
| **npm**     | **whatever ships with that Node** — do not install manually | bundled with Node              | one job only: `npm install -g pm2`                    |
| **pnpm**    | **9.0.0** — exact, pinned                                   | `corepack` (bundled with Node) | **installs and builds this repo**                     |
| **PM2**     | latest 5.x                                                  | `npm install -g pm2`           | process manager / boot persistence                    |
| **git**     | any 2.x                                                     | system package manager         | pulling the repo (over SSH — see `ssh-guide.md`)      |
| **RAM**     | 2 GB minimum, 4 GB recommended                              | —                              | the Next.js build is the memory-hungry step           |
| **Disk**    | ~3 GB free                                                  | —                              | `node_modules` (~1.5 GB) + two `.next` build outputs  |

**Which npm you end up with is decided by your Node version — you never choose it:**

| Node version installed | npm version you get | Notes                                         |
| ---------------------- | ------------------- | --------------------------------------------- |
| Node 20.x              | npm 10.8.x          | oldest version this repo is known to build on |
| **Node 22.x (LTS)**    | **npm 10.9.x**      | **recommended for the server**                |
| Node 24.x              | npm 11.x            | what the app is developed on                  |

> **Never run `npm install` inside this repo.** npm ignores `pnpm-lock.yaml`, flattens
> the workspace, and breaks every `@peppermint/*` link — the build then fails with
> module-resolution errors that look like missing packages. npm is used for exactly one
> command on this server: `npm install -g pm2`.

### 2.2 Installing Node

Pick **one** of the two options below. On a server, option A (system-wide) is the
better default — PM2's boot script then finds Node at a stable path without any nvm
shell setup.

#### Option A — system-wide via NodeSource (Ubuntu / Debian) — recommended for servers

```bash
# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Node lands at /usr/bin/node, npm at /usr/bin/npm
which node && node -v      # → /usr/bin/node   v22.x.x
npm -v                     # → 10.9.x
```

For **Node 24** instead, use `setup_24.x` in the first line.

RHEL / Rocky / Alma:

```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

#### Option B — per-user via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# reopen the shell, or:  source ~/.nvm/nvm.sh

nvm install 22          # installs the latest 22.x LTS + its bundled npm
nvm use 22
nvm alias default 22    # so new shells and cron get the same version
```

> **nvm + PM2 caveat.** nvm puts Node under `~/.nvm/versions/node/<version>/bin`, a path
> that does not exist for the boot-time init system. If you use nvm you **must** run
> `pm2 startup` from inside the nvm shell so the generated systemd unit hard-codes that
> path, and you must re-run `pm2 unstartup && pm2 startup && pm2 save` every time you
> change Node version. Option A avoids this entirely.

### 2.3 Installing pnpm — via corepack, at the pinned version

The root `package.json` pins `"packageManager": "pnpm@9.0.0"`. Corepack (which ships
with Node) reads that field and uses the right version automatically — this is why
corepack is preferred over `npm install -g pnpm`.

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate

pnpm -v        # → 9.0.0
```

If `corepack: command not found` (some distro packages strip it):

```bash
sudo npm install -g corepack@latest
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

If corepack is unavailable entirely, pin the version explicitly — do **not** install
"latest" pnpm:

```bash
sudo npm install -g pnpm@9.0.0
```

### 2.4 Installing PM2

```bash
sudo npm install -g pm2
pm2 -v         # → 5.x
```

### 2.5 Verify the whole toolchain before going further

```bash
node -v && npm -v && pnpm -v && pm2 -v && git --version
```

Expected, roughly:

```
v22.22.0        ← Node   (20.x / 22.x / 24.x all acceptable; 22 recommended)
10.9.4          ← npm    (comes with Node — whatever it printed is correct)
9.0.0           ← pnpm   (must be exactly this)
5.4.3           ← PM2
git version 2.43.0
```

If `pnpm -v` prints anything other than `9.0.0`, stop and fix it before installing
dependencies — a different pnpm may rewrite `pnpm-lock.yaml` and produce a different
dependency tree than the one this app was tested against.

---

## 3. Environment variables — `.env.production`

Only the **admin app** (`apps/grandway`) is configurable. `grandway-website` reads no
environment variables at all — it needs no env file, ever.

### 3.1 The complete variable list

There is exactly **one** variable in the entire repo:

| Variable              | App        | Required                            | Production value                    | Type         |
| --------------------- | ---------- | ----------------------------------- | ----------------------------------- | ------------ |
| `NEXT_PUBLIC_API_URL` | `grandway` | Optional — has a production default | `https://api.grandwayeducation.com` | Public (URL) |

Base URL of the Django REST API. **No trailing slash** — the app appends `/api/v1/...`
itself. There are no secrets, no database URLs, no API keys: this is a browser frontend,
and the backend is a separate deployment (§1.3).

### 3.2 Exactly which file to create, and what to write in it

Create **one file**, at this exact path:

```
/srv/ppm/apps/grandway/.env.production
```

Note it lives in the **app folder**, not the repo root. A file at `/srv/ppm/.env.production`
is ignored by Next.js and will do nothing.

Its complete contents — this is the whole file, two lines including the comment:

```dotenv
# Base URL of the Grandway Django API. No trailing slash.
NEXT_PUBLIC_API_URL=https://api.grandwayeducation.com
```

Create it like this:

```bash
cd /srv/ppm/apps/grandway

cat > .env.production <<'EOF'
# Base URL of the Grandway Django API. No trailing slash.
NEXT_PUBLIC_API_URL=https://api.grandwayeducation.com
EOF

cat .env.production          # confirm it wrote
```

**Format rules for this file:**

- `KEY=value` — no spaces around `=`, no `export`, one per line.
- **No quotes** around the URL. `NEXT_PUBLIC_API_URL="https://..."` bakes the quote
  characters into the value and every request 404s.
- **No trailing slash.** `https://api.grandwayeducation.com/` produces double-slash
  paths like `https://api.grandwayeducation.com//api/v1/auth/`.
- Include the scheme. `api.grandwayeducation.com` without `https://` is treated as a
  relative path against the admin's own origin.
- Lines starting with `#` are comments.

**Correct vs incorrect:**

| Value                                   | Verdict                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| `https://api.grandwayeducation.com`     | ✅ correct                                                 |
| `https://api.grandwayeducation.com/`    | ❌ trailing slash → `//api/v1/` paths                      |
| `https://api.grandwayeducation.com/api` | ❌ the app adds `/api/v1` itself → `/api/api/v1/`          |
| `"https://api.grandwayeducation.com"`   | ❌ quotes become part of the value                         |
| `api.grandwayeducation.com`             | ❌ no scheme → resolved against the admin origin           |
| `http://api.grandwayeducation.com`      | ❌ plain HTTP → blocked as mixed content on an HTTPS admin |

### 3.3 ⚠️ It is baked in at BUILD time, not read at runtime

`NEXT_PUBLIC_*` variables are **inlined into the JavaScript bundle by `pnpm build`**.
They are not read when the server starts. This is the single most common deployment
mistake on this repo:

- The file must exist **before** you run `pnpm build` — not before `pm2 start`.
- Changing the URL means **rebuild, then reload**. Editing `.env.production` and running
  `pm2 restart` changes nothing at all — the old URL is still compiled into the bundle.
- Never put a secret in a `NEXT_PUBLIC_*` variable. It is shipped to every browser and
  is readable in devtools.

The correct order, always:

```
create/edit .env.production  →  pnpm build  →  pm2 reload
```

### 3.4 File precedence — and the stale `.env.local` trap

Next.js reads env files in this priority order for a production build (**highest wins**):

1. Real shell environment variables (`NEXT_PUBLIC_API_URL=... pnpm build`)
2. `.env.production.local`
3. **`.env.local`** ← wins over `.env.production`
4. **`.env.production`** ← the file you create on the server
5. `.env`
6. The compiled-in default in `apps/grandway/lib/api.ts`

**The trap:** `.env.local` beats `.env.production`. A developer's `.env.local` pointing
at a LAN backend (e.g. `http://10.22.22.2:8000`) that somehow reaches the server will
silently override production and break every request — with no error at build time.

Check for one before your first build:

```bash
ls -la /srv/ppm/apps/grandway/.env* 2>/dev/null
```

The only file that should be listed is `.env.production`. Delete anything else:

```bash
rm -f /srv/ppm/apps/grandway/.env.local /srv/ppm/apps/grandway/.env.production.local
```

All `.env*` files are git-ignored, so `git pull` never delivers one — but a manual
`scp` or a copied directory can.

### 3.5 Is the env file strictly required?

**No — but create it anyway.** `https://api.grandwayeducation.com` is also compiled in
as the fallback default (see `apps/grandway/lib/api.ts`), so a build with no env file
still talks to the right backend.

Create it regardless, because it:

- makes the deployed target explicit and auditable on the server,
- is the only supported way to point a build at a different backend (staging, a local
  Django), and
- means a future change to the compiled-in default cannot silently move production.

### 3.6 Verifying the value actually landed in the build

After `pnpm build`, confirm the URL is really in the bundle:

```bash
cd /srv/ppm
grep -ro "https://api\.grandwayeducation\.com" apps/grandway/.next/static | head -3
```

Any hits means the correct URL is compiled in. To be sure no wrong host slipped in:

```bash
grep -rEo "https?://[a-zA-Z0-9._-]+:?[0-9]*" apps/grandway/.next/static | \
  grep -v grandwayeducation | sort -u | head
```

That should show no LAN address (`10.x`, `192.168.x`, `localhost`, `:8000`).

### 3.7 Pointing a build at a different backend

For staging or a test backend, change the file and **rebuild**:

```bash
cd /srv/ppm/apps/grandway
printf 'NEXT_PUBLIC_API_URL=https://staging-api.grandwayeducation.com\n' > .env.production

cd /srv/ppm
pnpm build --force            # --force: skip the turbo cache, the env changed
pm2 reload ecosystem.config.js
```

`--force` matters — turbo may otherwise consider the app unchanged and reuse the cached
build with the old URL baked in.

### 3.8 Backend-side requirements

The API must, for the admin portal to work:

- serve **HTTPS** on the URL above (an HTTP backend is blocked as mixed content),
- allow **CORS** from the admin origin (`https://admin.yourdomain.com`) — echoing the
  **specific** origin, not `*`, and sending `Access-Control-Allow-Credentials: true`
  if refresh cookies are enabled,
- issue the refresh credential (either `data.refresh` in the login body or a
  `Secure; HttpOnly; SameSite` cookie). Without it, staff sessions silently drop to the
  sign-in page when the access token expires. See `apps/grandway/lib/api.ts` for the
  full explanation of this constraint.

None of these are fixable from this repo — they are Django-side changes.

---

## 4. Getting the code and building

> The clone step below needs the deploy SSH key already installed — see `ssh-guide.md`
> if `git clone` asks for a password or fails with `Permission denied (publickey)`.

```bash
# 1. Clone the release branch (first deploy)
sudo mkdir -p /srv && sudo chown "$USER" /srv && cd /srv
git clone --branch release git@github.com:the-mintyleaf/peppermint.git ppm
cd /srv/ppm
git branch --show-current        # must print: release

# 2. Install workspace dependencies (exact lockfile — never resolve fresh on a server)
pnpm install --frozen-lockfile

# 3. Create the env file (see §3 for the full explanation)
cat > apps/grandway/.env.production <<'EOF'
# Base URL of the Grandway Django API. No trailing slash.
NEXT_PUBLIC_API_URL=https://api.grandwayeducation.com
EOF

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

git pull --ff-only origin release     # 1. fetch the new release code
pnpm install --frozen-lockfile        # 2. sync dependencies (no-op if unchanged)
pnpm build                            # 3. rebuild (turbo skips unchanged apps)
pm2 reload ecosystem.config.js        # 4. zero-downtime swap
pm2 save
```

`--ff-only` is deliberate: if it refuses, the server checkout has diverged from
`release` (someone edited a tracked file in place) and that must be resolved before
deploying, not merged over. See `ssh-guide.md` for how to reset it.

As a script — `/srv/ppm/deploy.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

cd /srv/ppm
echo "→ pulling"       && git pull --ff-only origin release
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
| `Permission denied (publickey)` on `git pull`                 | deploy SSH key missing, wrong permissions, or not loaded    | see `ssh-guide.md` §5 — troubleshooting                                                   |
| `git pull --ff-only` refuses: "Not possible to fast-forward"  | the server checkout diverged from `release`                 | `git fetch origin && git reset --hard origin/release` — see `ssh-guide.md` §4.3           |
| `pnpm -v` prints something other than `9.0.0`                 | pnpm installed via npm "latest" instead of corepack         | `corepack prepare pnpm@9.0.0 --activate` — see §2.3                                       |
| Build succeeds but admin hits a LAN/localhost API             | a stale `.env.local` overrode `.env.production`             | `rm apps/grandway/.env.local`, then `pnpm build --force` — see §3.4                       |

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

- [ ] Deploy SSH key installed and `ssh -T git@github.com` authenticates (`ssh-guide.md`)
- [ ] Node 22 LTS (or 20/24) installed — `node -v`; npm is whatever came with it
- [ ] pnpm **exactly 9.0.0** via corepack — `pnpm -v`
- [ ] PM2 installed globally — `pm2 -v`
- [ ] Repo cloned to `/srv/ppm` **on the `release` branch** — `git branch --show-current`
- [ ] `pnpm install --frozen-lockfile` completed with no errors
- [ ] `apps/grandway/.env.production` created with the **production** `NEXT_PUBLIC_API_URL`
- [ ] No stray `.env.local` in `apps/grandway/` — `ls -la apps/grandway/.env*`
- [ ] `pnpm build` → `2 successful, 2 total`
- [ ] `ecosystem.config.js` created, paths and ports match the server
- [ ] `pm2 start ecosystem.config.js` → both processes `online`
- [ ] `curl` on `127.0.0.1:3000` and `:3001` returns 200
- [ ] nginx vhosts configured, `nginx -t` passes, TLS certificates issued
- [ ] Backend API reachable over HTTPS and CORS allows the admin origin
- [ ] `pm2 save` + `pm2 startup` done — survives a reboot (test it)
- [ ] `pm2-logrotate` installed
- [ ] `deploy.sh` in place and tested once end-to-end
