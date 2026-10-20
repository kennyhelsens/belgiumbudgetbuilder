# Belgium Budget Builder — Product Spec (v1)

Status: draft for review · Last updated: 2026-10-20

## 1. Purpose

**Mission:** grow people's sense of the order of magnitude of public spending
(how big each topic is relative to the others) and of the complexity of
landing a budget, to support an informed democratic debate.

A public, politically neutral website that **educates** people about
Belgium's public finances. Building your own budget is the way in, not the
point. The site does not say "how hard can it be"; it shows *why* landing a
budget is hard: where the money really goes, what is growing on its own
(pensions, healthcare, interest), and how small some much-debated lines are
next to the big ones. Every lever shows its real cost:
**now** (in concrete, relatable examples), and **over the next 10 years** (debt,
interest, ageing costs), with an optional 20-year view.

Primary audience: **curious citizens**. Plain language first; sources one click
away so journalists and policy people can verify and share.

## 2. Principles

1. **Truthful and sourced.** Every number lives in a versioned data file with a
   source URL, publication date and retrieval date. No figures hard-coded in UI.
2. **Neutral.** No party framing, no "right answer". The official plan is a
   reference point, not a target.
3. **Kind and explanatory.** Journal/editorial tone: explain, don't lecture.
4. **Shallow but zoomable.** Max 3 levels of depth.
5. **Honest about limits.** The projection model is static (see §7) and says so.
6. **Educate, don't gamify.** No "you fixed the budget!" victory screen. When
   someone closes the deficit, the site shows what their choices mean for
   people and services, and what they don't solve (e.g. ageing costs keep
   growing after 2030).
7. **Proportion over opinion.** The site's voice states sizes, trends and
   comparisons. Words like "underfunded" or "too expensive" appear only when
   attributed to a cited source (e.g. a Court of Audit report or a court
   ruling), never as the site's own judgement.
8. **Even-handed myths.** Common beliefs are tested from across the political
   spectrum, not only from one side.

## 3. Scope decisions (locked)

| Topic | Decision |
|---|---|
| Baseline data | **2026 budgets as adjusted** (spring 2026 adjustments). 2027 added as a preset once voted. |
| Accounting basis | Consolidated general government (ESA 2010), split by spending level, **intergovernmental transfers netted out** to avoid double counting. |
| Trade-off mechanic | **Free + consequences**: users raise/cut anything; the deficit absorbs the gap; examples and the projection make the cost visible. |
| Revenue side | **Adjustable via 6–8 big levers.** |
| Zoom lens | **Who → what**: L1 Belgium, L2 government level, L3 function/programme. Secondary "by theme" view shows the same totals by function across levels. |
| Languages | **NL + FR + EN** at launch; DE later via the same i18n files. |
| Trade-off examples | **Claude drafts with sources, Kenny/expert reviews** before publication. |
| Projection | **Static debt arithmetic + official ageing costs**, prominent caveat. No behavioural feedback. **10-year horizon (to 2036) by default**; a "show 20 years" toggle extends to 2046, where the ageing snowball becomes clearest. |
| Focus | The **federal budget cycle** is the main playground. Regions and communities are adjustable; **local government is display-only**. |
| Social security | Shown with a **simple funding view**: who pays in (contributions, state subsidy, alternative financing), kept to one card. |
| Stack | **SvelteKit (static adapter) + TypeScript + D3**, Vitest, Playwright. |
| Hosting | **Cloudflare Pages** (free) with a preview URL per PR; GitHub Pages as fallback. |
| Review | Kenny and a politically versed reviewer review figures and examples **via GitHub PRs**. |

## 4. Information architecture

### Level 1 — Belgium
Total spending, total revenue, deficit, debt (€ and % of GDP), interest bill.

### Level 2 — Who spends (after netting transfers)
- Federal government
- Social security (Entity I: RSZ/ONSS-managed branches)
- Flemish Community/Region
- Walloon Region + Fédération Wallonie-Bruxelles
- Brussels-Capital Region (+ COCOM/COCOF)
- German-speaking Community
- Local government (municipalities, provinces, OCMW/CPAS, police zones) — **display-only**

A "money flows" explainer shows the major transfers (Special Financing Act
grants, state subsidy to social security) without counting them twice.

### Level 3 — What it's spent on (per L2 entity)
Example for social security:
- Pensions (employees, self-employed; civil-servant pensions are federal)
- Healthcare (RIZIV/INAMI)
- Unemployment (RVA/ONEM)
- Incapacity & disability
- Family allowances (regionalised — shown under the regions)
- Administration

**Funding card (social security only).** One simple stacked bar: social
contributions, state subsidy from the federal budget, alternative financing
(earmarked tax revenue, e.g. a share of VAT), other. One sentence explains
that a gap in social security lands on the federal budget, which is why cutting
or raising social security moves the federal deficit.

### Fact cards (L3)
Each L3 line has a sidebar card:
- Amount (€, % of total, € per inhabitant)
- **Beneficiaries** (e.g. number of pensioners)
- **People working in the sector** (e.g. healthcare workforce)
- **People running the system** (e.g. agency staff)
- Trend over last ~10 years
- Sources

The three "people" counts are always labelled distinctly; never merged.

### Revenue levers (6–8)
Personal income tax, social contributions, VAT, corporate tax, excises,
capital/wealth-related taxes, (optional) other. Each lever moves in rates or €,
with examples ("+1pt VAT ≈ €X per household per year").

## 4a. Stories: a sense of scale

Short, guided explainers (3–5 steps each) that walk through the zoom map and
sliders. They are the main educational layer; each is a data file with cited
claims, reviewed via PR like the figures.

**Launch set (draft):**
1. **Pensions: the line that grows on its own.** Today's pension spending, the
   number of pensioners now and in 2036, ageing costs per the Study Committee
   on Ageing, and what that growth equals in other budget lines.
2. **Asylum and migration in proportion.** Where this money actually sits
   (mostly the federal reception budget, e.g. Fedasil; some at local
   OCMW/CPAS level, partly refunded by the federal level), its size next to
   pensions and healthcare, and what "stopping it completely" would change
   for social security and the deficit. Shows the numbers; leaves the
   conclusion to the reader.
3. **Justice: what it costs and what the system is under.** Spending per
   inhabitant vs the EU average (once §14 data exists), plus cited facts such
   as court backlogs, prison overcrowding and court rulings against Belgium.
   "Underfunded" appears only as a quote from a cited source.
4. **Interest: the silent budget line.** How the interest bill grows when rates
   rise, and what it crowds out.

**Balance check:** the story list is reviewed as a set, so that beliefs held
on different sides are tested with the same rigour. Candidates for later:
development aid, politicians' pay and party funding, the royal endowment,
civil-servant numbers, taxing the highest earners, company car tax treatment,
subsidies to companies.

**"What if" presets:** each story can load a one-click scenario (e.g. "stop all
asylum reception spending") into the builder. The result shows the change to
the deficit and the 10-year debt next to the pension growth over the same
period, so the size speaks for itself.

## 5. Trade-off examples

When a user moves a line, the UI samples 1–2 examples from a curated list for
that line and states the change in those units:

> "−€500m on healthcare ≈ N fewer full-time nurses for a year"

### Example data schema
```json
{
  "id": "health-nurse-fte",
  "line": "socsec.healthcare",
  "label": { "nl": "...", "fr": "...", "en": "full-time nurse for one year" },
  "unitCostEur": 0,
  "costBasis": "total employer cost incl. social contributions",
  "source": { "url": "...", "publisher": "...", "published": "YYYY-MM-DD", "retrieved": "YYYY-MM-DD" },
  "reviewed": { "by": "...", "on": "YYYY-MM-DD" }
}
```
- 5–10 examples per L3 line; unreviewed examples never ship.
- Sampling is deterministic per session (seeded) so shared links show the same examples.
- Both directions phrased: cuts ("fewer…") and increases ("more…").

## 6. Interaction

### Seeing scale (the core of the site)
- **Area-true treemap** as the zoomable map (D3). Rectangles, not circles:
  people compare rectangle areas more accurately than circle areas, and
  every euro gets the same amount of ink. Never a log scale.
- **Scale stays visible when zooming.** A minimap ("you are here") shows the
  zoomed area inside the whole budget, like the Google Maps inset, so a
  zoomed-in line never looks bigger than it is.
- **Guess first, then reveal.** On first visit (and in stories), people guess
  the share of a few lines ("what share of spending goes to pensions? to
  asylum? to justice?") before seeing the answer. The gap between guess and
  reality is the lesson.
- **Compare any two lines to scale:** pick two lines and see them drawn side
  by side ("pensions are N times justice").
- **Per-person units:** every amount can be shown as € per inhabitant per
  month, alongside the totals in billions.

### Seeing complexity
- **Who decides:** each line shows which government controls it (federal,
  region, community, local) and whether EU fiscal rules constrain it.
- **How fixed is it:** each line is tagged *legal entitlement* (e.g.
  pensions), *committed* (wages, debt interest, contracts) or
  *discretionary*. Users can move any line, but the tag explains why some are
  much harder to change in practice.

### Building
- **Zoomable map navigation:** click to zoom, breadcrumb to go up, smooth
  transitions. Keyboard and screen-reader accessible list view as an
  equivalent alternative.
- **Sliders** per L3 line and revenue lever; changes roll up to L2/L1 live.
- **Balance strip** always visible: deficit now vs official plan, debt in 2036 (2046 when the 20-year view is on).
- **Presets**: Official 2026 (adjusted); later Official 2027.
- **Share**: full state encoded in the URL. No accounts, no backend in v1.

## 7. 10–20 year projection

Transparent, static model, yearly steps to **2036 by default**, extendable to 2046:

```
debt[t+1]     = debt[t] * (1 + r) / (1 + g) + primaryDeficit[t+1]      (as % of GDP)
primaryDef[t] = baselinePrimaryDef + userChanges + ageingCost[t]
interest[t]   = r_effective[t] * debt[t]
```
- **Ageing costs** from the Study Committee on Ageing (Hoge Raad van Financiën /
  Conseil supérieur des Finances), mainly pensions and healthcare.
- **User-adjustable assumptions**: implicit interest rate r, nominal growth g,
  optional "interest shock" toggle.
- **Visuals**: debt path vs official path; interest bill crowding out other
  spending (e.g. "by 2040 interest ≈ the whole education budget"); r–g snowball explainer.
- **Caveat box**: no behavioural/multiplier effects, no policy feedback; explains why.

## 8. Data sources (to compile, each cited per figure)

- Federal: BOSA (FOD/SPF Beleid en Ondersteuning) — budget & adjustment documents
- Flemish, Walloon, FWB, Brussels, German-speaking Community budget documents
- Social security: RSZ/ONSS, RIZIV/INAMI, RVA/ONEM, FPD/SFP, global management budget
- Consolidation & ESA: NBB / INR-ICN, Federal Planning Bureau
- Ageing: Study Committee on Ageing annual report
- Stability programme / EU fiscal-structural plan; Eurostat for cross-checks
- Workforce: Statbel, sector federations, agency annual reports

### Brussels without a regular budget
Brussels is believed to have no voted 2026 budget (to verify at data
collection). We model what legally applies, as accurately as possible:
- Baseline = spending authorised under **provisional credits/twelfths**,
  based on the last voted budget, clearly labelled "provisional" in the UI.
- **Committed spending** (wages, including grants that fund police zones,
  debt service, legal entitlements) is flagged: users can still move it, but
  the card warns that these bills arrive regardless.
- A note explains what provisional twelfths are and why the baseline is less
  certain than for other entities.

The "committed" flag is a general data field, usable for any entity.

## 9. Design system

- Warm off-white paper background, ink-dark text; full dark mode.
- Serif for headings and body (e.g. Newsreader or Source Serif 4); a quiet sans
  only for numbers in charts if needed.
- Editorial layout: generous margins, footnote-style source markers, pull-quotes
  for key insights.
- Muted, accessible categorical palette for L2 entities; colour never the only signal.
- Mobile-first; works at 360px width.

## 10. Tech

- **SvelteKit with the static adapter, TypeScript.** The app is one highly
  interactive tool (sliders, zoom, live roll-ups), which Svelte's reactivity
  handles with little code; the static adapter outputs plain files.
- **D3** (hierarchy, zoom, scales) for the zoomable map and charts.
- Data: JSON in `data/` with a schema and a validation script (every number has a source).
- i18n: message files per language (NL, FR, EN).
- **Hosting: Cloudflare Pages**, free tier, connected to the GitHub repo.
  Every PR gets its own preview URL, so reviewers check figures on the live
  site before merging; `main` deploys to production. Fallback: GitHub Pages
  via a GitHub Actions workflow (no previews).
- **Custom domain:** added later in the Cloudflare Pages dashboard (Custom
  domains → add). Easiest if the domain's DNS is on Cloudflare; otherwise a
  single CNAME record. The app uses relative paths only, so no code changes.

## 10a. Usage insights (later, designed-in now)

Not in v1, but the architecture keeps it a small addition on Cloudflare:
- **Traffic:** Cloudflare Web Analytics: free, cookieless, a single toggle.
- **What people build:** a Pages Function (`functions/api/budgets.ts`) writing
  to **Cloudflare D1** (managed SQLite). The site stays static; the function is
  the only server code.
- **What we would store:** the budget state (already a compact URL string),
  language, the preset it started from, timestamp. **No accounts, no IP
  addresses, no cookies, no personal data.**
- **Consent:** an explicit, opt-in "share my budget anonymously for research"
  button, not silent tracking. Privacy note on the site (GDPR).
- **What we learn:** which lines people cut or raise most, how often they
  close the deficit, which examples change minds. Aggregates could be
  published back on the site.
- **CI (GitHub Actions)** on every PR: lint, typecheck, unit + integration tests,
  data validation, Playwright e2e, build.

## 10b. Review workflow

- All figures and examples change via PRs touching `data/`.
- `CODEOWNERS` routes `data/` changes to Kenny and the political reviewer.
- PR template for data changes: what changed, source links, reviewer checklist.
- An example's `reviewed` field is filled in only after PR approval.

## 11. Testing

TDD throughout.
- **Unit**: projection model, netting of transfers, roll-ups, example conversion, URL state encode/decode.
- **Integration**: data files validate against schema; totals reconcile to published aggregates within tolerance.
- **End-to-end** (Playwright): zoom navigation, slider changes update balance + examples, share link round-trip, language switch.

## 12. Milestones

0. **Scaffold** — SvelteKit app, CI, Cloudflare Pages previews, CODEOWNERS, PR template.
1. **Data foundation** — schema, sourced 2026-adjusted L1–L3 figures, reconciliation tests.
2. **Projection engine** — model + tests, ageing data.
3. **Zoom map + fact cards** (read-only explorer).
4. **Builder** — sliders, revenue levers, balance strip, URL sharing.
5. **Examples** — drafted list, review pass, sampling.
6. **i18n NL/FR/EN, accessibility, polish, launch.**

## 13. Open items

- [x] Local government: display-only.
- [x] Social-security financing view: yes, one simple card.
- [x] Framework: SvelteKit (static).
- [x] Hosting: Cloudflare Pages (Kenny connects the repo once).
- [x] Reviewers: Kenny + political reviewer via GitHub PRs.
- [ ] Brussels 2026 budget status: verify during data collection (approach in §8).
- [ ] Domain name (default `*.pages.dev`; plugs in via the dashboard later).
- [ ] Usage insights (§10a): decide on scope after launch.
- [ ] Final launch set of stories (§4a), reviewed as a set for balance.
- [ ] EU comparison countries (§14), v2.
- [ ] GitHub handle of the political reviewer (for `CODEOWNERS`).

## 14. v2: European comparison

Compare Belgium's spending by function with a few EU countries, so people can
see whether a line is large or small by European standards.
- **Data:** Eurostat COFOG (general government expenditure by function), which
  uses the same ESA 2010 basis as our figures, so comparisons are like for
  like.
- **Measures:** % of GDP and € per inhabitant, per function (pensions,
  health, education, justice, defence, …).
- **Proposed countries:** Netherlands, Germany, France, plus the EU-27
  average; optionally one Nordic country (e.g. Denmark or Sweden) as a
  high-tax/high-service reference.
- **Placement:** a "How do others compare?" strip on each level-3 fact card
  and in the stories.
- **Caveat:** systems differ (e.g. private vs public pensions), so each
  comparison carries a short note on what it does and does not capture.
