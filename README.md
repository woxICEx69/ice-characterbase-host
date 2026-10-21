# ICE CharacterBase Host V1

Independent Cloudflare Worker hosting a **diagnostic-only Lua text module**.

**Not a game patch, not anti-cheat protection, and not a way to execute Lua on PUBG servers.**

## Endpoints

- `GET /1.lua` — diagnostic Lua text
- `GET /main.lua` — alias
- `POST /` with form body `key_path=1.lua` — diagnostic Lua text
- `GET /manifest.json` — version, byte length, and SHA-256
- `GET /health` — status

## Run and deploy

Requires Node.js 20+ and a Cloudflare account.

```bash
npm install
npm test
npx wrangler login
npm run deploy
```

Cloudflare supplies the live Worker URL **after deployment**. GitHub commits do not deploy automatically unless you configure Git integration in Cloudflare.

## Updating

Edit `payload/1.lua`, run `npm test`, commit, and deploy again.

**Security:** This repository is public. Do not upload game assets, modified game source, PAK files, authorization tokens, or private keys. The manifest hash is served by the same host and is not an independent integrity guarantee.
