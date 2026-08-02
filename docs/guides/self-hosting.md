# Self-Hosting Guide

Deploy CarbonSnap on your own infrastructure — a VPS (Ubuntu, Debian, DigitalOcean, Hetzner, AWS EC2), or a local machine. You keep full control of your carbon data.

---

## Requirements

* **OS:** Linux (Ubuntu 22.04 LTS / Debian 12 recommended)
* **Resources:** 1 vCPU, 1 GB RAM (2 GB recommended), 5 GB SSD
* **Software:** Node.js **v20+** and npm — or Docker v24+ if you prefer containers
* **Account:** A Firebase project with Authentication (Email/Password + Google) and Firestore enabled

---

## Step 1 — Clone & configure

```bash
git clone https://github.com/Yashraghuvans/CarbonSnap.git
cd CarbonSnap

cp .env.example .env
```

Fill in `.env`:

| Variable | Purpose |
| :--- | :--- |
| `FIREBASE_API_KEY` | Server-side verification of ID tokens |
| `RESEND_API_KEY` | Transactional email (optional) |
| `STRIPE_SECRET_KEY` | Billing (optional) |
| `VITE_FIREBASE_*` | Public Firebase web-app config (required) |

See the **Firebase Setup** section of the [README](../../README.md) for where these values come from, and remember to deploy the Firestore rules.

---

## Step 2 — Deploy

### Option A: Docker (recommended)

```bash
docker build -t carbonsnap .
docker run -d --name carbonsnap -p 3000:3000 --env-file .env --restart unless-stopped carbonsnap
```

### Option B: Bare Node

```bash
npm ci
npm run build
NODE_ENV=production PORT=3000 node dist/server.cjs
```

Verify: `curl http://localhost:3000/api/health` → `{"status":"ok", ...}`

---

## Step 3 — Reverse proxy & SSL (production domains)

Serve `carbon.yourcompany.com` with Nginx + Let's Encrypt:

```nginx
server {
    listen 80;
    server_name carbon.yourcompany.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name carbon.yourcompany.com;

    ssl_certificate     /etc/letsencrypt/live/carbon.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/carbon.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d carbon.yourcompany.com
```

> **Important:** add your custom domain to **Firebase Console → Authentication → Settings → Authorized domains**, or Google popup sign-in will be blocked.

---

## Running as a service (systemd)

```ini
# /etc/systemd/system/carbonsnap.service
[Unit]
Description=CarbonSnap
After=network.target

[Service]
Type=simple
User=carbonsnap
WorkingDirectory=/opt/CarbonSnap
EnvironmentFile=/opt/CarbonSnap/.env
ExecStart=/usr/bin/node dist/server.cjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now carbonsnap
```

---

## Updates & backups

**Update:**
```bash
git pull origin main
npm ci && npm run build
sudo systemctl restart carbonsnap   # or: docker restart carbonsnap
```

**Back up** the Firestore data (tenant metadata) and any locally persisted ledger store:

```bash
# Example: export Firestore collections to a timestamped directory
npx firebase-tools firestore:export --project <project-id> backups/$(date +%F)
```

---

## Troubleshooting

| Symptom | Fix |
| :--- | :--- |
| `CONFIGURATION_NOT_FOUND` on login | Enable Email/Password (and Google) under Firebase Authentication → Sign-in method |
| Google sign-in blocked | Add the domain to Firebase Authorized domains |
| Firestore data not persisting | Deploy rules: `npx firebase-tools deploy --only firestore:rules` |
| `401` everywhere | `.env` missing `FIREBASE_API_KEY` or token expired (re-sign in) |
