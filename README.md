# MaxCape

MaxCape is an OSRS milestone tracker. It records skill level-ups, collection log additions, boss kills, and achievement diary completions — giving you a timestamped history of how your account has progressed.

Check it out at [maxcape.net](https://maxcape.net)!

Events are sent by the [Account History RuneLite plugin](https://github.com/josephmr/account-history), which runs in the background and forwards milestones to MaxCape as they happen.

## Features

- **Day and month views** — browse your milestones grouped by day or by month
- **UTC / Local timezone** — switch between UTC and your local timezone for event grouping
- **Recent players** — check out players who have logged events recently

## Tech stack

- [SvelteKit](https://kit.svelte.dev) with Svelte 5
- [Tailwind CSS v4](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team) + SQLite via `better-sqlite3`

## Developing

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

To enable the protected manual-event modal, configure both secrets before starting the server:

```sh
MANUAL_EVENT_ADMIN_PASSWORD='choose-a-strong-password'
MANUAL_EVENT_SESSION_SECRET='choose-a-long-random-signing-secret'
```

Admin sessions expire after eight hours. Manual entry remains disabled when either value is missing.

## Building

```sh
npm run build
```
