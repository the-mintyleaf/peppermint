# SSH & Repository Access Guide — Grandway Frontend

Audience: the **deployer** setting up the Grandway frontend on a server, and the
**repository owner** issuing them access.

Purpose: get `git clone` / `git pull` working against the private repository
`the-mintyleaf/peppermint` over SSH, on the **`release`** branch, using a dedicated
read-only deploy key.

> Once `git clone` succeeds, continue with **`deploy-guide.md`** — that is the actual
> build-and-run guide. This document only covers repository access.

---

## 0. How access works here

|                  |                                                                             |
| ---------------- | --------------------------------------------------------------------------- |
| Repository       | `the-mintyleaf/peppermint` — **private**                                    |
| SSH remote       | `git@github.com:the-mintyleaf/peppermint.git`                               |
| Branch to deploy | **`release`** — never `main`                                                |
| Credential       | A **GitHub deploy key** — an SSH keypair authorised for this one repository |
| Access level     | **Read-only** — the deployer can pull, never push                           |

A deploy key is not a GitHub account. It grants access to exactly one repository,
carries no permissions anywhere else, and can be revoked from the repository settings
without affecting anyone else.

The private key half is delivered **by email** from the repository owner. It is a
credential — §3.3 covers handling it correctly.

---

## PART A — For the repository owner

Skip to Part B if you are the deployer and already received a key.

### 1. Generate the deploy keypair

Generate a **dedicated** keypair for this deployment. Do not reuse your personal
`~/.ssh/id_ed25519` — it authenticates you across every repository and service you use,
and emailing it hands over all of that.

```bash
ssh-keygen -t ed25519 \
  -C "grandway-deploy" \
  -f ~/.ssh/grandway_deploy \
  -N ""
```

- `-t ed25519` — the modern key type; short, fast, secure.
- `-C "grandway-deploy"` — a label, so it is identifiable in the GitHub UI later.
- `-f ~/.ssh/grandway_deploy` — writes two files, keeping it out of the way of your own key.
- `-N ""` — **no passphrase**. Required: an unattended `git pull` in a deploy script
  cannot answer a passphrase prompt.

This produces:

| File                         | Half        | Goes where                                       |
| ---------------------------- | ----------- | ------------------------------------------------ |
| `~/.ssh/grandway_deploy`     | **private** | emailed to the deployer, installed on the server |
| `~/.ssh/grandway_deploy.pub` | **public**  | registered on GitHub as a deploy key             |

### 2. Register the public half on GitHub

```bash
cat ~/.ssh/grandway_deploy.pub
```

Copy the entire single line (`ssh-ed25519 AAAA... grandway-deploy`), then:

1. Open **https://github.com/the-mintyleaf/peppermint/settings/keys**
2. Click **Add deploy key**
3. **Title:** `Grandway production server`
4. **Key:** paste the line from above
5. **Leave "Allow write access" UNCHECKED** — the deployer only ever pulls.
6. Click **Add key**

> Checking "Allow write access" would let anyone holding that key push to the
> repository. There is no reason to grant it for a deployment.

### 3. Send the private half to the deployer

```bash
cat ~/.ssh/grandway_deploy
```

That is the block from `-----BEGIN OPENSSH PRIVATE KEY-----` to
`-----END OPENSSH PRIVATE KEY-----` inclusive — send **all** of it, including both
marker lines and the trailing newline.

Email them, together:

- the private key block above,
- the repository SSH URL: `git@github.com:the-mintyleaf/peppermint.git`,
- the branch: **`release`**,
- a link to this file and to `deploy-guide.md`.

#### 3.1 Handling caveats — read before sending

A private key sent by email is only as protected as the mailbox it lands in. Because
this one is passphrase-less and grants read access to a private codebase:

- Send it to **one named individual**, never a shared or team alias.
- Prefer an encrypted channel where you have one (a password manager's secure-share, an
  encrypted attachment with the password sent separately). Plain email is acceptable for
  a **read-only** deploy key, but is a real trade-off, not a neutral choice.
- Tell them to **delete the email** once the key is installed on the server (§B-2).
- **Never reuse this key** for a second server, a second client, or anything else.
  Generate a fresh one per deployment so revoking one never breaks another.
- If the deployer's laptop, mailbox, or the server is ever compromised — or the
  engagement ends — **revoke immediately** (§4). Revocation is instant and total.

The safer alternative, if you would rather no private key travel at all: have the
deployer run step 1 on the server themselves and email you back only the `.pub` file,
which you then register in step 2. Nothing else in this guide changes.

### 4. Revoking access

1. Open **https://github.com/the-mintyleaf/peppermint/settings/keys**
2. Find `Grandway production server`
3. Click **Delete**

The key stops working immediately, everywhere. The deployed application keeps running —
only future `git pull`s fail.

### 5. Keeping `release` current

Deployers pull `release`. Publishing a new version means moving `release` forward:

```bash
git checkout main
git pull --ff-only

git checkout release
git merge --ff-only main        # release simply tracks the approved state of main
git push ppm release

git checkout main
```

If `--ff-only` refuses, `release` has commits `main` does not — reconcile before
publishing rather than forcing.

---

## PART B — For the deployer

### 1. What you should have received

- A private key block (`-----BEGIN OPENSSH PRIVATE KEY-----` … `-----END OPENSSH PRIVATE KEY-----`)
- Repository URL: `git@github.com:the-mintyleaf/peppermint.git`
- Branch: **`release`**

If any of these is missing, stop and ask — do not improvise a different access method.

### 2. Install the key on the server

Run these **on the deployment server**, as the user that will run the deploy (the same
user that will own `/srv/ppm` and run PM2).

```bash
# 2.1 — make sure ~/.ssh exists with correct permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

```bash
# 2.2 — write the private key. Paste the block, then press Enter, then Ctrl-D.
cat > ~/.ssh/grandway_deploy
```

Paste the **entire** key including both `-----BEGIN...-----` and `-----END...-----`
lines, press <kbd>Enter</kbd> so the file ends with a newline, then <kbd>Ctrl</kbd>+<kbd>D</kbd>.

```bash
# 2.3 — lock the permissions. SSH REFUSES to use a key others can read.
chmod 600 ~/.ssh/grandway_deploy
```

Verify the key is intact and well-formed:

```bash
ssh-keygen -l -f ~/.ssh/grandway_deploy
# → 256 SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxx grandway-deploy (ED25519)
```

If that errors with `invalid format`, the paste was truncated or mangled (a common cause
is an email client wrapping long lines). Ask for it again — do not try to repair it by hand.

**Now delete the email containing the key**, and clear it from your Trash.

### 3. Configure SSH for GitHub

Tell SSH to use this specific key for GitHub — without this, SSH offers your default
keys instead and GitHub rejects the connection.

```bash
cat >> ~/.ssh/config <<'EOF'

Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/grandway_deploy
  IdentitiesOnly yes
EOF

chmod 600 ~/.ssh/config
```

`IdentitiesOnly yes` matters: it stops SSH from trying every other key first, which
GitHub can count as failed attempts and close the connection over.

Test it:

```bash
ssh -T git@github.com
```

Accept the host fingerprint the first time (`yes`). Expected reply:

```
Hi the-mintyleaf/peppermint! You've successfully authenticated, but GitHub does not provide shell access.
```

That message — including "does not provide shell access" — is **success**. Naming the
repository confirms it authenticated as a deploy key.

If you see `Permission denied (publickey)`, go to §5.

### 4. Clone and pull the `release` branch

#### 4.1 First clone

```bash
sudo mkdir -p /srv && sudo chown "$USER" /srv
cd /srv
git clone --branch release git@github.com:the-mintyleaf/peppermint.git ppm
cd /srv/ppm

git branch --show-current     # must print: release
git log --oneline -5          # sanity check
```

If it printed `release`, access is working. **Continue with `deploy-guide.md` §2.**

#### 4.2 Pulling updates later

```bash
cd /srv/ppm
git pull --ff-only origin release
```

`--ff-only` is deliberate — it fails loudly rather than creating a merge commit on a
server checkout. `deploy-guide.md` §6 wraps this in the full deploy sequence
(pull → install → build → `pm2 reload`).

#### 4.3 If the pull refuses to fast-forward

The server checkout has diverged — usually because a tracked file was edited in place.
Discard the local state and match `release` exactly:

```bash
cd /srv/ppm
git status                              # see what changed, first
git fetch origin
git reset --hard origin/release
git clean -fd                           # removes untracked files — see the warning
```

> ⚠️ `git clean -fd` deletes untracked files. `apps/grandway/.env.production` **is
> untracked**, so this removes it. Recreate it afterwards — `deploy-guide.md` §3.2 —
> and rebuild before reloading, since the API URL is compiled into the bundle.

#### 4.4 What you cannot do

The key is read-only by design. `git push` will fail:

```
ERROR: The key you are authorized with is not allowed to push to this repository.
```

That is expected, not a misconfiguration. Never commit on the server — any code change
goes through the repository owner, who moves it onto `release` for you to pull.

### 5. Troubleshooting

| Symptom                                    | Cause                                               | Fix                                                                                                   |
| ------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Permission denied (publickey)`            | key not installed, wrong path, or not offered       | `ssh -vT git@github.com` and read which key it tried; confirm `~/.ssh/config` names `grandway_deploy` |
| `WARNING: UNPROTECTED PRIVATE KEY FILE!`   | key is world/group readable                         | `chmod 600 ~/.ssh/grandway_deploy`                                                                    |
| `Load key ...: invalid format`             | paste truncated or line-wrapped by the mail client  | request the key again; do not hand-edit it                                                            |
| `Load key ...: error in libcrypto`         | missing trailing newline, or CRLF line endings      | `printf '\n' >> ~/.ssh/grandway_deploy`, or `dos2unix ~/.ssh/grandway_deploy`                         |
| Prompts for a passphrase                   | the key was generated with one                      | it must be passphrase-less for unattended deploys — ask the owner to reissue                          |
| Prompts for a username/password            | the remote is HTTPS, not SSH                        | `git remote set-url origin git@github.com:the-mintyleaf/peppermint.git`                               |
| `Repository not found`                     | key not registered, revoked, or wrong repo          | ask the owner to confirm the deploy key is listed and active                                          |
| `Host key verification failed`             | fingerprint never accepted (common in scripts/cron) | `ssh-keyscan github.com >> ~/.ssh/known_hosts`                                                        |
| `ERROR: ... not allowed to push`           | read-only key working as designed                   | do not push from the server (§4.4)                                                                    |
| Works interactively, fails in cron/systemd | no `HOME` set, so `~/.ssh/config` is not read       | set `HOME=/home/<user>` in the unit/crontab, or use `GIT_SSH_COMMAND`                                 |

#### Diagnosing with verbose SSH

```bash
ssh -vT git@github.com 2>&1 | grep -Ei "offering|identity file|authenticated|denied"
```

Look for `Offering public key: /home/<user>/.ssh/grandway_deploy` followed by
`Authenticated to github.com`. If a different key is offered, `~/.ssh/config` is not
being applied — check its permissions are `600` and the `Host github.com` block is
spelled exactly as in §3.

#### Confirming the remote is SSH, not HTTPS

```bash
cd /srv/ppm && git remote -v
# → origin  git@github.com:the-mintyleaf/peppermint.git (fetch)
```

If it shows `https://github.com/...`, git will ask for a password the deploy key cannot
supply:

```bash
git remote set-url origin git@github.com:the-mintyleaf/peppermint.git
```

### 6. Quick reference

```bash
# Install (once)
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat > ~/.ssh/grandway_deploy          # paste key, Enter, Ctrl-D
chmod 600 ~/.ssh/grandway_deploy
printf '\nHost github.com\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/grandway_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config
chmod 600 ~/.ssh/config
ssh -T git@github.com                 # expect the "successfully authenticated" line

# Clone (once)
cd /srv && git clone --branch release git@github.com:the-mintyleaf/peppermint.git ppm

# Pull (every deploy)
cd /srv/ppm && git pull --ff-only origin release
```

### 7. Checklist

- [ ] Private key received and written to `~/.ssh/grandway_deploy`
- [ ] `chmod 700 ~/.ssh` and `chmod 600 ~/.ssh/grandway_deploy` applied
- [ ] `ssh-keygen -l -f ~/.ssh/grandway_deploy` prints a valid ED25519 fingerprint
- [ ] Email containing the key deleted, including from Trash
- [ ] `~/.ssh/config` has the `Host github.com` block, permissions `600`
- [ ] `ssh -T git@github.com` returns the "successfully authenticated" message
- [ ] Repo cloned to `/srv/ppm`, `git branch --show-current` prints `release`
- [ ] `git remote -v` shows the `git@github.com:` SSH URL
- [ ] `git pull --ff-only origin release` runs without prompting for anything
- [ ] Continued to `deploy-guide.md` for build and PM2 setup
