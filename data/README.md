# Budget data

Every figure on the site comes from the files in this folder. Each number
points to a source, so anyone can check it. Changes go through a pull request
and are reviewed by the code owners before they are published.

## Layout

```
data/2026/
  sources.json            every document we cite
  overview.json           Belgium as a whole (all governments, ESA 2010)
  outlook.json            inputs for the 10-year projection: interest rate,
                          nominal growth, official ageing costs, official
                          debt path
  history.json            how the budget got where it is, from published
                          analyses: how much the deficit grew since 2016,
                          and why (National Bank of Belgium)
  entities/<id>.json      one file per government: federal, social-security,
                          flanders, wallonia, wallonia-brussels-federation,
                          brussels, german-speaking-community, local
  details/<line id>.json  what a change to one spending line could mean, in
                          words and without numbers (effects of a cut and
                          of an increase, with their source), and
                          optionally unit examples kept as reference, a
                          breakdown into sub-budgets and the official
                          levers
```

## Rules

- **Amounts are in millions of euro** (`eurMillion`), for the budget year.
  Spending excludes repayments of debt principal (that is financing, not
  spending) but includes interest.
- **Every amount has a `ref`**: the `source` id from `sources.json` and a
  `locator` saying where in the document the number is (page, table, line).
  Add `quote`, the line of the document containing the number, copied
  verbatim, so reviewers can find it. Use `note` to explain any calculation,
  e.g. "sum of divisions 12 and 13".
- **Sources** have a title, publisher, `https` link, the date we retrieved
  it, and the publication date when the document states one (never guessed).
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
  credits, or `forecast` for an official forecast where no single budget
  document exists (local government).
- **Labels** are given in Dutch, French and English.
- **Unit examples** (`equivalents` in `details/`) have a `unitEur` amount with
  its own `ref`, and a label written as a plural noun phrase that reads after
  a number ("That is about 3,100 …"). The label says what the amount is: an
  average or a legal minimum or maximum, gross or net, and its year when it is
  not 2026. A reviewer who approves an example adds `reviewedBy` with their
  GitHub handle. A `breakdown`, when given, must add up to its line.

## Not yet included

- **German-speaking Community**: its 2026 budget could only be read through an
  unofficial mirror of the Belgian Official Journal, and a first adjustment
  has since been adopted. It will be added once the figures are checked
  against the official documents (pdg.be, ostbelgienlive.be or the Moniteur
  belge block automated access). Until then, the federal grant to it is shown
  as federal spending.

The checks in `src/lib/data/` run in CI and fail the pull request if any rule
is broken.
