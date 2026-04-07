# sevenwall

Monorepo-style layout: **React UI** in `client/`, **Evennia game** in `evennia-game/`. Use **Git** as the single source of truth so you can open the same folder from any machine.

## One-time setup (each computer)

```bash
git clone https://github.com/delinquencies/sevenwall.git
cd sevenwall

python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cd client && npm install && cd ..
```

## Evennia (per machine)

The SQLite DB lives at `evennia-game/server/evennia.db3` and is **not** committed. After clone:

```bash
source .venv/bin/activate
cd evennia-game
evennia migrate
evennia start
```

Create a superuser when prompted on first start (or run `evennia createsuperuser`). Website: **http://127.0.0.1:4001** — webclient WebSocket defaults to port **4002**.

## React UI

```bash
cd client
npm run dev
```

Open **http://127.0.0.1:5173** while Evennia is running. In dev, Vite proxies:

- **`/evennia-portal`** → `http://127.0.0.1:4001` (Django session cookie for webclient bootstrap)
- **`/evennia-ws`** → `ws://127.0.0.1:4002` (WebSocket)

Override targets in `client/.env.local` with `VITE_EVENNIA_PORTAL_PROXY_TARGET` and `VITE_EVENNIA_WS_PROXY_TARGET` if needed.

**Remote Evennia:** set `VITE_EVENNIA_WS_URL` and `VITE_EVENNIA_PORTAL_ORIGIN` (same host as the portal; the browser must be able to reach both with credentials if cross-origin).

Shared helpers: `client/src/config/evennia.ts`, `client/src/evennia/useEvenniaWebClient.ts`.
