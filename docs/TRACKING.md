# Anonymous click tracking: setup and queries

The site counts clicks on budget-map tiles: which government a visitor opens,
and which spending lines they cut or add to. Revenue types are counted the
same way, with ids such as `revenue.corporate-income-tax`; for them `cut`
means lower and `add` means raise. `docs/FAQ.md` ("Does the site
track what I click?") explains it to visitors.

## How it works

- **Page (`src/lib/tracking/clicklog.ts`):** collects clicks under a random
  session id that lives only in memory. It sends them as one batch to
  `POST /api/events` with `navigator.sendBeacon`, after a 4-second pause,
  when 20 clicks are queued, or when the page is hidden or closed. Browsers
  that send Global Privacy Control or Do Not Track send nothing.
- **API (`functions/api/events.ts`):** a Cloudflare Pages Function. It
  accepts only small, valid batches (`src/lib/tracking/events.ts`) and writes
  one row per click to D1.
- **Database:** a D1 database bound as `DB`, with the table from
  `migrations/0001_tile_clicks.sql`. No IP address, user agent or device id
  is stored.

On `vite preview` and `npm run dev` there is no API; the beacons get a 404,
and the page does not mind.

## One-time setup in Cloudflare

1. **Create the database.** In the Cloudflare dashboard, go to **Storage &
   databases → D1 SQL database → Create**, and name it
   `belgiumbudgetbuilder-clicks`. The location can be Western Europe.
2. **Create the table.** Open the database, go to **Console**, paste the
   whole of `migrations/0001_tile_clicks.sql` and click **Execute**.
3. **Bind it to the site.** Go to **Workers & Pages → belgiumbudgetbuilder →
   Settings → Bindings → Add → D1 database**. Set the variable name to `DB`
   and pick `belgiumbudgetbuilder-clicks`. Do this for **Production**, and
   for **Preview** too if preview deployments should record clicks. (You can
   also give Preview a separate database to keep test clicks apart.)
4. **Redeploy** the latest deployment (Deployments → ⋯ → Retry deployment),
   so the binding takes effect.
5. **Check it.** Click a few tiles on the live site, wait a few seconds, and
   run in the D1 console:
   `SELECT * FROM tile_clicks ORDER BY id DESC LIMIT 10;`

## Useful queries

```sql
-- Which governments are opened most
SELECT line, count(*) AS opens FROM tile_clicks
WHERE action = 'open' GROUP BY line ORDER BY opens DESC;

-- Which lines are cut and which get more, by number of clicks
SELECT line, sum(action = 'cut') AS cuts, sum(action = 'add') AS adds
FROM tile_clicks WHERE action != 'open'
GROUP BY line ORDER BY cuts + adds DESC LIMIT 20;

-- Where each session ended up: the last percentage per line
SELECT line, avg(percent) AS average_final_percent, count(*) AS sessions
FROM (
  SELECT session, line, percent,
         row_number() OVER (PARTITION BY session, line ORDER BY seq DESC) AS rn
  FROM tile_clicks WHERE action != 'open'
) WHERE rn = 1
GROUP BY line ORDER BY sessions DESC LIMIT 20;

-- Visits and clicks per day
SELECT date(created_at) AS day, count(DISTINCT session) AS sessions, count(*) AS clicks
FROM tile_clicks GROUP BY day ORDER BY day DESC;

-- Sessions and clicks per hour over the last two days, in Belgian time
-- (created_at is UTC: '+1 hour' in winter, '+2 hours' in summer)
SELECT strftime('%Y-%m-%d %H:00', created_at, '+1 hour') AS hour_brussels,
       count(DISTINCT session) AS sessions, count(*) AS clicks
FROM tile_clicks WHERE created_at >= datetime('now', '-2 days')
GROUP BY hour_brussels ORDER BY hour_brussels DESC;
```

A session here is one page load with at least one click on the map; a reload
gets a new one, and browsers that opt out are not counted. For page views and
visits, including people who never click, see Cloudflare Web Analytics below.

## Page views and visits: Cloudflare Web Analytics

Web Analytics is switched on for the Pages project (**Workers & Pages →
belgiumbudgetbuilder → Metrics → Web Analytics**). Cloudflare adds its script
(`static.cloudflareinsights.com/beacon.min.js`) to every page itself; the
site's code does not include it. The dashboard shows page views and visits
over time, by page, referrer, country and device. The FAQ ("Does the site
track what I click?") tells visitors about it.

## Tests

The tests use a real local D1 database through wrangler, set up from
`wrangler.local.toml` and the same migration. They never touch the Cloudflare
account.

- **Unit tests:** `events.spec.ts` and `clicklog.spec.ts`.
- **Integration tests:** `store.spec.ts`, which covers the database and the
  API handler.
- **End-to-end tests:** `e2e/tracking.e2e.ts`. They run the site and API on
  `wrangler pages dev`.
