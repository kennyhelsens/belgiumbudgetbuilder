# Belgium Budget Builder — Product Spec (v1)

Status: draft for review · Last updated: 2026-10-20

## 1. Purpose

A public, politically neutral website where anyone can understand Belgium's
public finances and build their own budget. Every lever shows its real cost:
**now** (in concrete, relatable examples), and **over 10–20 years** (debt,
interest, ageing costs).

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
| Projection | **Static debt arithmetic + official ageing costs**, prominent caveat. No behavioural feedback. |

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
- Local government (municipalities, provinces, OCMW/CPAS, police zones) — shown, not adjustable in v1 *(to confirm)*

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

- **Zoomable map** (circle-pack or treemap, D3): click to zoom, breadcrumb to go up,
  smooth "Google Maps" transitions. Keyboard and screen-reader accessible list
  view as an equivalent alternative.
- **Sliders** per L3 line and revenue lever; changes roll up to L2/L1 live.
- **Balance strip** always visible: deficit now vs official plan, debt in 2036/2046.
- **Presets**: Official 2026 (adjusted); later Official 2027.
- **Share**: full state encoded in the URL. No accounts, no backend in v1.

## 7. 10–20 year projection

Transparent, static model, yearly steps to 2046:

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

Open data question: verify whether Brussels has a regular 2026 budget or
provisional twelfths, and model whichever is factual.

## 9. Design system

- Warm off-white paper background, ink-dark text; full dark mode.
- Serif for headings and body (e.g. Newsreader or Source Serif 4); a quiet sans
  only for numbers in charts if needed.
- Editorial layout: generous margins, footnote-style source markers, pull-quotes
  for key insights.
- Muted, accessible categorical palette for L2 entities; colour never the only signal.
- Mobile-first; works at 360px width.

## 10. Tech (proposal)

- Static site: **SvelteKit or Astro** (decide at kickoff), D3 for the zoomable map.
- Data: JSON in `data/` with a schema and a validation script (every number has a source).
- i18n: message files per language.
- Hosting: any static host (domain to decide).

## 11. Testing

TDD throughout.
- **Unit**: projection model, netting of transfers, roll-ups, example conversion, URL state encode/decode.
- **Integration**: data files validate against schema; totals reconcile to published aggregates within tolerance.
- **End-to-end** (Playwright): zoom navigation, slider changes update balance + examples, share link round-trip, language switch.

## 12. Milestones

1. **Data foundation** — schema, sourced 2026-adjusted L1–L3 figures, reconciliation tests.
2. **Projection engine** — model + tests, ageing data.
3. **Zoom map + fact cards** (read-only explorer).
4. **Builder** — sliders, revenue levers, balance strip, URL sharing.
5. **Examples** — drafted list, review pass, sampling.
6. **i18n NL/FR/EN, accessibility, polish, launch.**

## 13. Open items

- [ ] Local government: adjustable or display-only in v1?
- [ ] Include social-security financing view (contributions vs state subsidy)?
- [ ] Framework choice (SvelteKit vs Astro).
- [ ] Domain name and hosting.
- [ ] Who are the reviewers for examples and figures?
- [ ] Brussels 2026 budget status.
