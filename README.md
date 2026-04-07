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

Open **http://127.0.0.1:5173**. In dev, the UI resolves Evennia at `ws://127.0.0.1:5173/evennia-ws`, which Vite proxies to `ws://127.0.0.1:4002` (override with `VITE_EVENNIA_WS_PROXY_TARGET` in `client/.env.local` if your portal listens elsewhere).

To point at a **remote** Evennia from the browser, copy `client/.env.example` to `client/.env.local` and set `VITE_EVENNIA_WS_URL=ws://host:4002`.

Shared Evennia URL config helper: `client/src/config/evennia.ts`.
