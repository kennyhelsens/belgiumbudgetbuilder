# FAQ: how the numbers are made

This page explains where every number on the site comes from, which
assumptions sit behind the calculations, and how the site was built. It is
kept up to date with every change to the data or the calculations.

---

## The numbers

### Where do the figures come from?

Only from official documents: the budgets voted by the federal, regional and
community parliaments, the social security budget, RIZIV/INAMI, the Federal
Planning Bureau, the Study Committee on Ageing (part of the High Council of
Finance), the National Bank, Statbel, Eurostat and BOSA's interactive federal
budget. News articles were used at most to find a document, never as a
source.

Every amount in `data/2026/` carries its source: the document, its link, the
page or table, and for documents the line copied word for word, so anyone
can check it. On the site, the table view under the budget map shows the
source of each line.

### Which year and which version of the budget?

Budget year **2026**, in the latest voted version:

| Government                   | Version                                      | Basis                                   |
| ---------------------------- | -------------------------------------------- | --------------------------------------- |
| Federal                      | first adjustment (voted 25 June 2026)        | payment credits                         |
| Social security              | budget control 2026 (April 2026)             | budget figures before ESA corrections   |
| Flanders                     | adjustment (voted 8 July 2026)               | ESA-consolidated payment credits        |
| Walloon Region               | adjustment (decree of 2 July 2026)           | payment credits                         |
| Wallonia-Brussels Federation | adjustment (decree of 17 July 2026)          | payment credits, by budget chapter      |
| Brussels (Region + COCOM)    | initial budget (voted 27 March 2026)         | payment credits, including budget funds |
| Local government             | Federal Planning Bureau forecast (June 2026) | national accounts (ESA 2010)            |
| Belgium as a whole           | Federal Planning Bureau forecast (June 2026) | national accounts (ESA 2010)            |

### How is the federal budget grouped?

The same way BOSA (the federal Policy and Support department) groups it in
its interactive budget at budget.infocenter.belgium.be: by budget section,
one per department or group of grants. Every section total matches BOSA's
export and the adjusted budget law (DOC 56 1470/001) to the thousand euro.

A few sections are split, so that money handed to another government can be
shown where it is spent, and pensions can follow the ageing path:

- **Section 01 (grants):** the grants to the Flemish Community, the French
  Community, COCOM and the German-speaking Community are separate lines.
- **Section 13 (Home affairs):** Fedasil and the Immigration Office are
  separate lines.
- **Section 17 (Federal police):** the grants to local police zones (€1.3
  billion) are a separate line.
- **Section 24 (Social security):** civil-service pensions, the grants to
  social security and the allowances for persons with disabilities are
  separate lines.
- **Section 44 (Social integration):** the refunds to OCMW/CPAS (€2.3
  billion) are a separate line.
- **Section 51 (Public debt):** interest is a separate line. Repaying loans
  and buying securities (€40.5 billion) are left out (see below).

### What counts as "spending"?

- **Included:** everything a government pays out in the year, including
  interest on its debt.
- **Excluded:** repaying the principal of loans. That is financing (an old
  loan replaced by a new one), not spending. For example, the Walloon
  Region's €1.1 billion of loan repayments and the Wallonia-Brussels
  Federation's €0.9 billion are left out.

### Isn't money counted twice when one government pays another?

No. Belgian governments pass a lot of money to each other: the federal
government funds part of social security, the communities, police zones and
OCMW/CPAS; the regions fund municipalities. Such payments are marked as
transfers in the data and shown only where the money is finally spent.
That is why the federal tile on the map is smaller than the federal budget.

Most of the money the regions and communities receive under the Special
Financing Act is not federal spending at all. The federal budget books it
as revenue handed over, not as expenditure, so it is not in the federal
total either.

### Why is the map total (€346 billion) lower than the official €362 billion?

The €362 billion (€361.8 billion) is general government spending in the
national accounts (ESA 2010, Federal Planning Bureau, June 2026). The map adds
up the governments' own 2026 budgets instead. Every step between the two
totals was traced in the source documents and checked a second time:

| Difference                                                                                                                                                                                                                                                                                              | € billion |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Public-sector pensions.** ESA counts all civil-servant pensions as spending, plus a notional employer pension contribution in staff costs. The map only counts the federal grant to the pension scheme.                                                                                               | +18.6     |
| **Tax measures.** ESA counts some tax measures as spending, while the budget counts them as lower revenue: withholding-tax exemptions, refundable tax credits, the VAT-based EU contribution, and tax revenue passed on to bodies such as CREG and Elia.                                                | +8.2      |
| **Transfers counted twice in our data.** Regions and communities pay grants to municipalities that our data does not yet mark as transfers, so they are counted twice: in the regional budget and in local government. The largest are the French Community's grants for teachers in municipal schools. | −8.5      |
| **Federal timing and accounting corrections.** These include the assumed underspending, the timing of Defence purchases, non-interest debt costs, and the difference between the budgeted and the ESA interest bill.                                                                                    | −3.7      |
| **Governments and schemes missing from our data:** the German-speaking Community, the French Community Commission in Brussels (COCOF) and smaller social security schemes.                                                                                                                              | +2.4      |
| **Small consolidation items** (payments between governments)                                                                                                                                                                                                                                            | −0.6      |
| **Not explained**                                                                                                                                                                                                                                                                                       | −0.6      |
| **Total difference**                                                                                                                                                                                                                                                                                    | **+15.7** |

The €8.5 billion counted twice is an estimate, because the national accounts
and the budgets do not record transfers in exactly the same way. It is an
error in our data, and we will correct it by marking those grants as
transfers. The ten-year outlook uses the national-accounts figures, so the
debt calculation is not affected.

### Why is the German-speaking Community missing?

Its 2026 budget could only be read through an unofficial copy of the
Belgian Official Journal, because the official websites block automated
access, and an adjustment has been adopted since. Rather than publish
figures we could not check against the original, it is left out for now.
The €124 million federal grant to it is shown as federal spending until it
is added.

### Did Brussels have a budget in 2026?

Yes. Brussels ran on provisional credits throughout 2025 and early 2026,
based on its 2024 budget. The Brussels Parliament then adopted the 2026
budget on 27 March 2026, and the Common Community Commission (COCOM)
followed on 22 May 2026.

### What do "entitlement", "committed" and "discretionary" mean?

These tags say how hard a line is to change in practice:

- **entitlement:** rights set by law per person, such as pensions;
- **committed:** wages, interest and contracts;
- **discretionary:** decided in the yearly budget.

These tags are our own judgement, not taken from the budget documents, and
are open to review.

---

## The ten-year outlook

### How is the future debt calculated?

With simple, transparent arithmetic, year by year, starting from 2026:

- **GDP:** next year's GDP = this year's GDP × (1 + nominal growth).
- **Interest:** this year's debt × the average interest rate.
- **Primary balance** (the budget balance before interest): stays at its
  2026 share of GDP. It changes only for the cost of ageing (below) and for
  the changes you make with the sliders.
- **Debt:** next year's debt = this year's debt + interest − primary balance.

### What are the starting values?

From the Federal Planning Bureau's forecast of June 2026:

| Item     | 2026                        |
| -------- | --------------------------- |
| GDP      | €663.3 billion              |
| Deficit  | €33.7 billion (5.1% of GDP) |
| Interest | €16.6 billion               |
| Debt     | 109.9% of GDP               |

The source gives 2026 debt only as a percentage, so the € amount (€729
billion) is calculated as 109.9% of GDP.

### Which interest rate and growth are assumed?

- **Interest rate: 2.40% a year.** That is the 2026 interest bill divided by
  the debt at the end of 2025 (Eurostat).
- **Nominal growth: 3.26% a year.** That is the average yearly growth of
  nominal GDP in the Planning Bureau's forecast for 2026–2031.

Both can be changed under "Assumptions" on the site.

### How do I know the model is reasonable?

With the budget unchanged, the model reaches 119.8% of GDP in 2031. The
Planning Bureau's official projection reaches 122.3%. The official path is
shown as dots on the chart. Our model stays slightly below it because the
Planning Bureau expects the interest rate to rise over time, while we keep it
fixed.

### What does the outlook leave out?

- **How people and companies react:** a tax rise does not slow the economy in
  this model, and spending more does not speed it up.
- **Interest rates that change:** the rate stays fixed unless you change it.
  The Planning Bureau expects the average rate to rise and to exceed growth
  from about 2031, which would make the debt grow faster.
- **Policy beyond 2026:** apart from ageing, the 2026 budget is assumed to
  stay the same share of GDP every year.

That is why the site calls it arithmetic, not a forecast.

---

## The cost of ageing

### Where do the ageing figures come from?

From the Study Committee on Ageing (Studiecommissie voor de Vergrijzing /
Comité d'étude sur le vieillissement), part of the High Council of Finance,
in its July 2026 report. Its statistical annex gives social spending as a
share of GDP for every year to 2070. All 754 values we use were checked
against that annex.

|                          | 2026  | 2036  | 2046  |
| ------------------------ | ----- | ----- | ----- |
| Social spending in total | 25.7% | 27.0% | 27.1% |
| of which pensions        | 11.3% | 12.0% | 12.0% |
| of which healthcare      | 8.1%  | 9.1%  | 9.7%  |

(Rounded; the exact yearly values are in `data/2026/outlook.json`.)

### What does the report assume?

Its reference scenario includes:

- **Policy:** measures known on 29 May 2026, including the pension reform as
  voted by Parliament.
- **Productivity:** growth of 1.1% a year on average.
- **Employment:** the employment rate of 18–66 year-olds rises from 70.4%
  (2025) to 73.4% (2031) and 77.6% (2050).
- **Benefit adjustments:** no welfare adjustment of benefits in 2025–2029; the
  usual rules return from 2030.

With lower productivity growth (0.9% a year), the cost of ageing up to 2070
roughly doubles, from 1.5 to 3.3 points of GDP.

### How does ageing enter the calculation?

Only the **increase** above 2026 counts, because today's pensions and
healthcare are already in the 2026 budget. The cost of ageing is the yearly
extra spending compared with 2026. It is split into three parts:

- pensions;
- healthcare;
- other, which falls over time, for example because of lower unemployment.

This extra cost is added to the deficit each year. The site shows it in
"The cost of ageing", under the outlook.

### What happens to the cost of ageing if I cut pensions or healthcare?

The projected increase changes **in the same proportion** as your change to
that spending. Cut pensions by 10%, and the pension part of the ageing
increase is 10% smaller too. This is a simplification: a real reform would
affect different groups of pensioners differently.

The lines that count:

- **Pensions:** employee pensions, self-employed pensions and civil-servant
  pensions.
- **Healthcare:** healthcare through RIZIV/INAMI.

Regional care spending, such as the Flemish care budget, is not linked to
the ageing path.

### Are the pension numbers about people?

The report counts **pensions**, not people. Someone with a pension from
two schemes is counted twice, so the numbers must not be read as the number
of pensioners.

---

## What a change means

### How do I change a budget?

Open a government on the map and use − and + on a tile: each click changes
that line by 1% of its 2026 amount, up to 50% either way. The table under the
map has the same change as a slider. The tile keeps its official size; a
hatched slice along its edge shows a cut, and a dotted slice shows extra
spending, as wide as the change.

### What do the key figures at the top show?

They stay at the top of the screen while you change the budget:

- **Public debt 2026:** €729 billion, or 109.9% of GDP (Federal Planning
  Bureau, June 2026; see "What are the starting values?").
- **Deficit 2026:** €33.7 billion, or 5.1% of GDP, minus your cuts and plus
  your extra spending, euro for euro. Changes are assumed not to affect the
  economy or tax revenue (see "What does the outlook leave out?").
- **Debt at the end of the outlook:** your budget as calculated in the
  ten-year outlook, with the result for an unchanged budget next to it once
  you make a change.

After every change, a short notice illustrates it. Where the line has an
example in concrete units, such as GP consultations reimbursed, the notice
says roughly how many of them the change is worth, rounded to two digits
because it is an illustration. Otherwise it gives the change per inhabitant
per year (Belgium's population on 1 January 2026, 11,867,634, Statbel). The
exact amounts are in the key figures and on the map. The notice disappears by
itself after a few seconds.

Each change also moves the debt: more spending raises it and less spending
lowers it. The figures at the top react, and emojis bubble up the screen:
happy ones when the debt falls, worried ones when it rises. This is a playful
signal of direction, not a judgement of the choice. People who have asked
their device for reduced motion do not see these animations.

### Are the examples in concrete units checked?

Every example comes from an official source, with its amount, page and quote
in the data. Each was found by one AI research agent and then checked by a
second agent that downloaded the source again, found the quote and redid the
arithmetic. That second check confirmed, corrected or rejected each example:
corrected examples carry the reason in the data, and rejected or misleading
ones were left out.

The project owners have chosen to show the examples while their own review
is still under way: examples a reviewer has approved come first, and the
others are shown too. Each example records who approved it, once that has
happened.

Examples are approximate by nature. Some are averages, some are legal
minimums or maximums, and a few use the latest published year (2024 or 2025)
or a rate that has since been indexed; the label says which.

### Which examples are there?

| Government                   | Line                                                                                                                         | Example                                                                                                                  | € per unit |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Federal government           | Allowances for persons with disabilities                                                                                     | years of disability allowance for one person (average amount)                                                            | 11,256     |
| Federal government           | Allowances for persons with disabilities                                                                                     | years of combined income-replacement and integration allowance for one person (average)                                  | 17,100     |
| Federal government           | Defence                                                                                                                      | average yearly pay costs of a member of the armed forces                                                                 | 70,690     |
| Federal government           | Federal police (excluding grants to local police zones)                                                                      | average yearly pay costs per federal police staff member (police officers and civilian staff together)                   | 85,008     |
| Federal government           | Grant to Fedasil (reception of asylum seekers)                                                                               | adult asylum seekers housed for a year in a local reception initiative                                                   | 18,360     |
| Federal government           | Grant to Fedasil (reception of asylum seekers)                                                                               | asylum reception places for a year (saving per place closed)                                                             | 19,018     |
| Federal government           | Income guarantee for older people (GRAPA) and running costs of the Social Security department                                | years of income guarantee (GRAPA) for one older person (average amount)                                                  | 9,032      |
| Federal government           | Income guarantee for older people (GRAPA) and running costs of the Social Security department                                | years of the maximum income guarantee for a single older person                                                          | 19,731     |
| Federal government           | Justice                                                                                                                      | prisoners held for a year (average cost)                                                                                 | 62,283     |
| Federal government           | Public-sector (civil service) pensions paid by the Federal Pension Service                                                   | months of the guaranteed minimum civil-service pension (gross, single rate)                                              | 1,881.58   |
| Social security              | Employee pensions                                                                                                            | average gross monthly pensions from the employee scheme (per pensioner)                                                  | 1,435.91   |
| Social security              | Employee pensions                                                                                                            | yearly gross minimum pensions for a full career as an employee (single rate)                                             | 22,582.98  |
| Social security              | Healthcare (RIZIV/INAMI)                                                                                                     | GP consultations reimbursed by RIZIV                                                                                     | 29.74      |
| Social security              | Healthcare (RIZIV/INAMI)                                                                                                     | yearly fees for a global medical file                                                                                    | 38.82      |
| Social security              | Healthcare (RIZIV/INAMI)                                                                                                     | RIZIV/INAMI reimbursements of a consultation with an accredited cardiologist (standard rate, no GP referral)             | 38.33      |
| Social security              | Self-employed pensions                                                                                                       | yearly gross minimum pensions for a full career as a self-employed person (single rate)                                  | 22,582.98  |
| Social security              | Sickness, disability and maternity benefits                                                                                  | average yearly invalidity benefits per person in invalidity (employees and unemployed, 2025)                             | 18,951.48  |
| Social security              | Unemployment and related benefits (RVA/ONEM)                                                                                 | average monthly unemployment benefits of a fully unemployed jobseeker (2025)                                             | 1,461.17   |
| Social security              | Unemployment and related benefits (RVA/ONEM)                                                                                 | maximum gross monthly unemployment benefits in the first three months of unemployment                                    | 2,812.94   |
| Flanders                     | Education and training                                                                                                       | gross annual salaries of a starting secondary-school teacher (master's degree), excluding holiday pay and year-end bonus | 48,499.92  |
| Flanders                     | Education and training                                                                                                       | school years of a pupil in mainstream secondary education                                                                | 11,800     |
| Flanders                     | Education and training                                                                                                       | school years of a pupil in mainstream nursery and primary education                                                      | 7,600      |
| Flanders                     | Mobility and public works                                                                                                    | boardings on a De Lijn bus or tram (average Flemish contribution per boarding, 2024)                                     | 3.30       |
| Flanders                     | Welfare, public health and family (incl. Groeipakket family allowances and Flemish social protection)                        | years of the basic Groeipakket child benefit for one child born since 2019                                               | 2,287.92   |
| Flanders                     | Welfare, public health and family (incl. Groeipakket family allowances and Flemish social protection)                        | years of the Flemish care budget for a person with severe care needs                                                     | 1,680      |
| Flanders                     | Work, economy, science, innovation, agriculture and social economy                                                           | hours of household help with service vouchers, counting only the Flemish subsidy per hour (rate from 1 October 2025)     | 19.63      |
| Walloon Region               | Employment and training (FOREM, IFAPME, service vouchers, target-group reductions)                                           | hours of service-voucher home help subsidised by the Walloon Region (regional share per hour)                            | 20.35      |
| Walloon Region               | Family allowances (AVIQ, family branch)                                                                                      | years of basic family allowance (without supplements) for one child in Wallonia (born 2020 or later)                     | 2,406.12   |
| Walloon Region               | Family allowances (AVIQ, family branch)                                                                                      | birth grants in Wallonia                                                                                                 | 1,422.96   |
| Wallonia-Brussels Federation | Education, research and training (compulsory education incl. teacher salaries, higher education, research, school buildings) | gross annual salaries of a starting upper-secondary teacher (master's degree), excluding holiday pay and year-end bonus  | 47,103.30  |
| Wallonia-Brussels Federation | Education, research and training (compulsory education incl. teacher salaries, higher education, research, school buildings) | school years of a pupil in mainstream secondary education                                                                | 9,557      |
| Wallonia-Brussels Federation | Education, research and training (compulsory education incl. teacher salaries, higher education, research, school buildings) | school years of a pupil in mainstream primary education                                                                  | 6,163      |

There are no examples yet for Brussels, the railways, the Immigration Office
or foreign affairs and development: the sources could not be reached or give
no amount per unit that is easy to understand. Local government cannot be
changed on the site, so it has no examples.

### What is the card that appears when I change a spending line?

When you change a spending line that has detailed data behind it, a card
explains what the change means. Healthcare through RIZIV/INAMI has every part
below; the other lines in "Which examples are there?" have the examples only:

- **Per inhabitant:** the yearly change divided by Belgium's population on
  1 January 2026 (11,867,634, Statbel). For example, a 10% cut in healthcare
  is about €370 less per inhabitant per year.
- **Where it would land:** the change is spread over the sub-budgets in
  proportion to their size. A real reform chooses where to cut; the
  proportional spread only shows the scale.
- **That's about:** the change expressed in concrete units, such as GP
  consultations reimbursed by RIZIV (€29.74 each in 2026). Examples a
  reviewer has approved come first (see "Are the examples in concrete units
  checked?").
- **How could it be done?:** the official levers through which this spending
  changes, each with a neutral explanation and its source.

### Where do the healthcare sub-budgets come from?

The 2026 healthcare budget of €43.9 billion (budget control 2026,
DOC 56 1468/001) is split over 12 lines:

- **Ten sector budgets** as set by the RIZIV General Council in October 2025
  (note ARGV 2025/069). RIZIV has not republished the split by sector since
  the 2026 budget control, so this is the initial split.
- **The state part of hospital financing (€2.8 billion),** which is counted
  inside the healthcare budget from 2026.
- **€69 million** not broken down by sector in published sources.

The **medicine contracts line (€1.9 billion)** is matched by equal receipts
from drug companies, so cutting it alone would save nothing. The card shows it
but leaves it out of the spread.

### Are the healthcare figures checked?

Yes, in the same way as all other data: a second agent re-downloaded every
source and checked every figure, unit amount and lever. None was wrong; two
labels were corrected.

---

## How this site was built

### Who made it?

An independent, non-partisan project by Kenny Helsens. Figures are reviewed
by two code owners before they are published.

### How was the data collected and checked?

1. **Research:** AI research agents (Claude, by Anthropic) were each given
   one government and a strict brief: official documents only; for every
   figure the document, page and a word-for-word quote; and "missing"
   instead of any estimate.
2. **Verification:** a second, independent agent re-downloaded every source
   and checked every figure against the document. It also redid every
   calculation and looked for double counting.
   - **No figure turned out wrong.**
   - **Corrections were about scope:** excluding loan repayments, adding
     Brussels' budget funds, and fixing a rounding.
3. **Human review:** every change to the data goes through a pull request on
   GitHub and is reviewed by the code owners before it is published.

### How is the site itself made and tested?

- **Code:** written with Claude Code (an AI coding assistant), test first. The
  calculations, the data checks and the pages all have automated tests,
  which run on every change.
- **Technology:** SvelteKit, D3, TypeScript.
- **Hosting:** Cloudflare Pages, which builds a preview of every proposed
  change.
- **Privacy:** the site has no cookies, no tracking and no accounts. Its font
  is served from the site itself, so no third-party font service sees your
  visit.

### I found a mistake. What now?

Please open an issue or pull request on the project's GitHub repository, with
a link to the document and page that shows the right number. Corrections go
through the same review as every other change.
