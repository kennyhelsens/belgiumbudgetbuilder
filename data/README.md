# Budget data

Every figure on the site comes from the files in this folder. Each number
points to a source, so anyone can check it. Changes go through a pull request
and are reviewed by the code owners before they are published.

## Layout

```
data/2026/
  sources.json            every document we cite
  overview.json           Belgium as a whole (all governments, ESA 2010)
  entities/<id>.json      one file per government: federal, social-security,
                          flanders, wallonia, wallonia-brussels-federation,
                          brussels, german-speaking-community, local
```

## Rules

- **Amounts are in millions of euro** (`eurMillion`), for the budget year.
- **Every amount has a `ref`**: the `source` id from `sources.json` and a
  `locator` saying where in the document the number is (page, table, line).
  Use `note` to explain any calculation, e.g. "sum of divisions 12 and 13".
- **Sources** have a title, publisher, `https` link, publication date and the
  date we retrieved it.
- **Lines add up to the total** of their government, within rounding. Use an
  explicit "other" line rather than leaving a gap.
- **Transfers between governments** (e.g. the federal grant to social security,
  or money passed on to the regions) are marked with `transferTo`, so they are
  counted only once, where the money is finally spent.
- **`nature`** says how hard a line is to change in practice:
  - `entitlement`: rights set by law per person, such as pensions;
  - `committed`: wages, interest and contracts;
  - `discretionary`: decided in the yearly budget.
- **`budgetStatus`** is `adjusted` for 2026 budgets as adjusted, or
  `provisional` when there is no voted budget and spending runs on provisional
  credits.
- **Labels** are given in Dutch, French and English.

The checks in `src/lib/data/` run in CI and fail the pull request if any rule
is broken.
