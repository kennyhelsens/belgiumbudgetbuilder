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
- **Section 24 (Social security):** the grant to the Federal Pension Service,
  the grants to social security and the allowances for persons with
  disabilities are separate lines. The grant to the Federal Pension Service
  is passed on to social security, where the public-sector pensions are shown
  (see "Why are public-sector pensions under social security?").
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

### Why are public-sector pensions under social security?

Because that is how BOSA and the national accounts present them. The Federal
Pension Service pays the pensions of former civil servants of every level of
government: federal, community and regional (including teachers), local
(municipalities, provinces, OCMW/CPAS, police zones), the military, HR Rail
and public bodies. In 2026 that scheme spends €23.9 billion (DOC 56 1468/001,
Tabel I.2). It is financed by a federal grant of €16.1 billion and by €7.5
billion of pension contributions, of which €3.8 billion from local
authorities.

On the map, the federal grant is a transfer to social security, so it is
counted once, under social security. Employers' pension contributions are not
treated as transfers: in the national accounts they are part of staff pay,
like the rest of a salary.

The income guarantee for older people (GRAPA/IGO) and the allowances for
persons with disabilities stay with the federal government. In the social
security budget they are "social assistance", which BOSA also counts outside
social security.

### How do the totals compare with BOSA's?

BOSA's overview of the 2026 budget gives totals in the national accounts (ESA
2010), for the initial budget (DOC 56 1278/001 of January 2026, p. 6). The map
shows them beside ours:

|                    | Map (adjusted budget) | BOSA (national accounts, initial budget) |
| ------------------ | --------------------- | ---------------------------------------- |
| Social security    | €147.5 billion        | €147.3 billion                           |
| Federal government | €57.5 billion         | €54.2 billion                            |

- **Federal government:** BOSA counts the contribution to the EU budget as
  money handed to another government, not as federal spending. Without it,
  the map's federal total is €52.6 billion. BOSA's €41.9 billion is its €54.2
  billion without interest charges (€12.3 billion).
- **The rest of the difference** comes from the basis: the map uses the
  adjusted budget of June 2026, in payment credits, line by line; BOSA's
  overview uses the initial budget and the national accounts.

### Why are the lines coloured as they are?

On the map of Belgium, each government has its own colour. Inside a
government, each line takes the colour of what it pays for, so you can see,
for example, that education sits with the communities and security with the
federal government. The eight themes follow the COFOG functions of
government, the international classification by purpose that Eurostat and
the National Bank use, grouped into themes a reader recognises:

- **Social protection:** pensions, unemployment, sickness and family benefits,
  social assistance (COFOG 10)
- **Health:** COFOG 07
- **Education:** COFOG 09
- **Security, justice and defence:** COFOG 02 and 03
- **Economy, work and mobility:** COFOG 04, including transport and labour
  market policy
- **Environment, housing and land:** COFOG 05 and 06
- **Culture, sport and media:** COFOG 08
- **Government and general services:** COFOG 01, including foreign affairs,
  the EU contribution, administration and grants to other governments

Two more have neutral colours:

- **Interest on debt:** in COFOG it belongs to general services, but it
  follows from the debt rather than from a budget choice.
- **Local spending by type:** the local budgets in the data are split by type
  of spending (staff, investment, ...), not by purpose.

Many budget lines mix several purposes. The site classifies each by its main
purpose; this is the site's own classification, not an official one. Every
line:

| Theme                           | Government                   | Line                                                                                                                                              |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Social protection               | Brussels                     | COCOM: health, elderly care and welfare (Vivalis, Iriscare, New Samusocial)                                                                       |
| Social protection               | Brussels                     | Family allowances (COCOM, via Iriscare)                                                                                                           |
| Social protection               | Federal government           | Allowances for persons with disabilities                                                                                                          |
| Social protection               | Federal government           | Grant to Fedasil (reception of asylum seekers)                                                                                                    |
| Social protection               | Federal government           | Income guarantee for older people (GRAPA) and running costs of the Social Security department                                                     |
| Social protection               | Federal government           | Social integration (other)                                                                                                                        |
| Social protection               | Flanders                     | Welfare, public health and family (incl. Groeipakket family allowances and Flemish social protection)                                             |
| Social protection               | Social security              | Administration costs (institutions and health insurance funds)                                                                                    |
| Social protection               | Social security              | Employee pensions                                                                                                                                 |
| Social protection               | Social security              | Other schemes (Fedris funds, public-sector career breaks, former Overseas Social Security, ...)                                                   |
| Social protection               | Social security              | Other spending                                                                                                                                    |
| Social protection               | Social security              | Public-sector pensions (all levels of government, Federal Pension Service)                                                                        |
| Social protection               | Social security              | Self-employed pensions                                                                                                                            |
| Social protection               | Social security              | Sickness, disability and maternity benefits                                                                                                       |
| Social protection               | Social security              | Unemployment and related benefits (RVA/ONEM)                                                                                                      |
| Social protection               | Social security              | Work accidents and occupational diseases (Fedris)                                                                                                 |
| Social protection               | Wallonia-Brussels Federation | Health, social affairs, culture, media and sport (incl. early childhood/ONE, youth care, justice houses, culture, RTBF public broadcaster, sport) |
| Social protection               | Walloon Region               | Family allowances (AVIQ, family branch)                                                                                                           |
| Social protection               | Walloon Region               | Health, elderly care, disability and social action (AVIQ and other)                                                                               |
| Health                          | Federal government           | Public health, food chain safety and environment                                                                                                  |
| Health                          | Social security              | Healthcare (RIZIV/INAMI)                                                                                                                          |
| Education                       | Flanders                     | Education and training                                                                                                                            |
| Education                       | Wallonia-Brussels Federation | Education, research and training (compulsory education incl. teacher salaries, higher education, research, school buildings)                      |
| Security, justice and defence   | Brussels                     | Fire service, prevention and security (SIAMU, Brussels Prevention & Security)                                                                     |
| Security, justice and defence   | Federal government           | Defence                                                                                                                                           |
| Security, justice and defence   | Federal government           | Federal police (excluding grants to local police zones)                                                                                           |
| Security, justice and defence   | Federal government           | Home affairs (excluding Fedasil and the Immigration Office)                                                                                       |
| Security, justice and defence   | Federal government           | Immigration Office                                                                                                                                |
| Security, justice and defence   | Federal government           | Justice                                                                                                                                           |
| Economy, work and mobility      | Brussels                     | Employment and economy (Actiris, service vouchers, Innoviris, hub.brussels)                                                                       |
| Economy, work and mobility      | Brussels                     | Mobility and public transport (incl. STIB)                                                                                                        |
| Economy, work and mobility      | Federal government           | Economy, small businesses, self-employed and energy                                                                                               |
| Economy, work and mobility      | Federal government           | Employment, labour and social dialogue                                                                                                            |
| Economy, work and mobility      | Federal government           | Mobility and transport (mostly SNCB and Infrabel railways)                                                                                        |
| Economy, work and mobility      | Flanders                     | Mobility and public works                                                                                                                         |
| Economy, work and mobility      | Flanders                     | Work, economy, science, innovation, agriculture and social economy                                                                                |
| Economy, work and mobility      | Social security              | Contribution reductions booked as spending (ESA 2010)                                                                                             |
| Economy, work and mobility      | Walloon Region               | Economy, research and digital                                                                                                                     |
| Economy, work and mobility      | Walloon Region               | Employment and training (FOREM, IFAPME, service vouchers, target-group reductions)                                                                |
| Economy, work and mobility      | Walloon Region               | Mobility, roads, waterways and public transport                                                                                                   |
| Economy, work and mobility      | Walloon Region               | Walloon Recovery Plan (PRW) and EU Recovery and Resilience Facility                                                                               |
| Environment, housing and land   | Brussels                     | Environment, energy and cleanliness                                                                                                               |
| Environment, housing and land   | Brussels                     | Housing and urban development                                                                                                                     |
| Environment, housing and land   | Flanders                     | Environment and spatial planning (Omgeving)                                                                                                       |
| Environment, housing and land   | Walloon Region               | Agriculture, nature and environment                                                                                                               |
| Environment, housing and land   | Walloon Region               | Housing, spatial planning, energy and heritage                                                                                                    |
| Culture, sport and media        | Flanders                     | Culture, youth, sport and media                                                                                                                   |
| Government and general services | Brussels                     | Grants to the French (COCOF) and Flemish (VGC) community commissions                                                                              |
| Government and general services | Brussels                     | Other (administration, tax service, financial stakes and loans, EU-funded projects, external relations, ...)                                      |
| Government and general services | Federal government           | Buildings Agency (Régie des Bâtiments)                                                                                                            |
| Government and general services | Federal government           | Chancellery of the Prime Minister                                                                                                                 |
| Government and general services | Federal government           | Finance                                                                                                                                           |
| Government and general services | Federal government           | Foreign affairs, foreign trade and development cooperation                                                                                        |
| Government and general services | Federal government           | GNI-based contribution to the EU budget                                                                                                           |
| Government and general services | Federal government           | Grants to the German-speaking Community                                                                                                           |
| Government and general services | Federal government           | Independent bodies                                                                                                                                |
| Government and general services | Federal government           | Policy and Support (BOSA), with provisions                                                                                                        |
| Government and general services | Federal government           | Royal family, parliament and other grants                                                                                                         |
| Government and general services | Federal government           | Science policy                                                                                                                                    |
| Government and general services | Flanders                     | Chancellery, governance, foreign affairs and justice (excl. local government funds)                                                               |
| Government and general services | Flanders                     | Finance and budget (excl. interest): provisions, tax administration, budget policy                                                                |
| Government and general services | Flanders                     | Higher entities (Flemish Parliament etc.)                                                                                                         |
| Government and general services | Wallonia-Brussels Federation | General services (parliament, ministers' offices, general secretariat incl. staff, IT, buildings, international relations)                        |
| Government and general services | Walloon Region               | General administration (SPW staff, digital), institutions and other                                                                               |
| Interest on debt                | Brussels                     | Interest on regional debt                                                                                                                         |
| Interest on debt                | Federal government           | Interest on the public debt                                                                                                                       |
| Interest on debt                | Federal government           | Public debt: other costs (excluding repayments)                                                                                                   |
| Interest on debt                | Flanders                     | Interest and financial costs on Flemish debt                                                                                                      |
| Interest on debt                | Local government             | Interest                                                                                                                                          |
| Interest on debt                | Wallonia-Brussels Federation | Public debt: interest and charges (excluding repayment of principal)                                                                              |
| Interest on debt                | Walloon Region               | Debt interest, issuance costs and guarantees                                                                                                      |
| Local spending by type          | Local government             | Goods and services (intermediate consumption)                                                                                                     |
| Local spending by type          | Local government             | Gross fixed capital formation                                                                                                                     |
| Local spending by type          | Local government             | Other (subsidies, transfers to households and companies, other capital spending)                                                                  |
| Local spending by type          | Local government             | Social benefits (incl. integration income via OCMW/CPAS)                                                                                          |
| Local spending by type          | Local government             | Staff (compensation of employees)                                                                                                                 |
| Local spending by type          | Local government             | Transfers to other governments                                                                                                                    |

### Why is the map total (€355 billion) lower than the official €362 billion?

The €362 billion (€361.8 billion) is general government spending in the
national accounts (ESA 2010, Federal Planning Bureau, June 2026). The map adds
up the governments' own 2026 budgets instead. Every step between the two
totals was traced in the source documents and checked a second time:

| Difference                                                                                                                                                                                                                                                                                              | € billion |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Public-sector pensions.** ESA adds a notional employer pension contribution for federal, community and regional civil servants to their staff costs (€12.7 billion), and records €1.8 billion less in pension benefits than the pension scheme's budget spends.                                       | +10.8     |
| **Tax measures.** ESA counts some tax measures as spending, while the budget counts them as lower revenue: withholding-tax exemptions, refundable tax credits, the VAT-based EU contribution, and tax revenue passed on to bodies such as CREG and Elia.                                                | +8.2      |
| **Transfers counted twice in our data.** Regions and communities pay grants to municipalities that our data does not yet mark as transfers, so they are counted twice: in the regional budget and in local government. The largest are the French Community's grants for teachers in municipal schools. | −8.5      |
| **Federal timing and accounting corrections.** These include the assumed underspending, the timing of Defence purchases, non-interest debt costs, and the difference between the budgeted and the ESA interest bill.                                                                                    | −3.7      |
| **Governments missing from our data:** the German-speaking Community and the French Community Commission in Brussels (COCOF).                                                                                                                                                                           | +1.0      |
| **Small consolidation items** (payments between governments)                                                                                                                                                                                                                                            | −0.6      |
| **Not explained**                                                                                                                                                                                                                                                                                       | −0.6      |
| **Total difference**                                                                                                                                                                                                                                                                                    | **+6.6**  |

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

- **Pensions:** employee pensions, self-employed pensions and public-sector
  pensions (all levels of government).
- **Healthcare:** healthcare through RIZIV/INAMI.

Regional care spending, such as the Flemish care budget, is not linked to
the ageing path.

### Are the pension numbers about people?

The report counts **pensions**, not people. Someone with a pension from
two schemes is counted twice, so the numbers must not be read as the number
of pensioners.

---

## The intro

### What does the intro show?

On a first visit, a short intro asks what a headline like "Government looks
for 10 billion" means. It shows all public spending of 2026 as a grid of
dots, one dot per billion euros (355 dots, coloured by government, rounded
so they add up to the €355.2 billion on the map). Then it sets 10 billion
against that total and against the population, the deficit, the interest
bill and the debt outlook. Every number comes from the data files:

| Step                 | Figure                                             | From                                                            |
| -------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| All spending         | €355.2 billion                                     | Sum of the map, money passed between governments counted once   |
| 10 billion           | 2.8% of all spending; €843 per inhabitant          | 10 billion ÷ €355.2 billion; ÷ 11,867,634 inhabitants (Statbel) |
| The gap              | Deficit €33.7 billion; 10 billion closes 30%       | `overview.balance` (Federal Planning Bureau)                    |
| How did we get here? | +€18 billion since 2016 (see below)                | `history.json` (National Bank of Belgium)                       |
| The bill             | Interest €16.6 billion; debt 132.7% of GDP in 2036 | `overview.interest`; the outlook without changes                |

The intro can be skipped, closed with Escape and watched again from the
home page. The browser only remembers that it was seen; nothing is sent
anywhere.

### Where does "10 billion" come from?

It is a round amount like the ones in newspaper headlines, used as a
yardstick. It is not the figure of any specific plan, and the intro does not
say where the money should come from.

### Why does the intro quote the National Bank?

To explain how the deficit got this big, the intro uses the factual findings
of the National Bank of Belgium's Economic Review article "What's behind the
increase in the federal and regional budget deficits in Belgium?" (October
2026, p. 25):

- Between 2016 and 2025 the deficit grew by €18 billion. Without interest,
  which fell by €4 billion, the gap grew by €21 billion.
- That €21 billion comes from both **lower revenue (€12 billion)** and
  **higher spending (€9 billion)**.
- Both the **federal government (€11 billion)** and the **communities and
  regions (€8 billion)** contributed.

These findings name no single cause or culprit, which suits a neutral site.
The article also ends with a policy recommendation, for a binding national
fiscal framework; the site leaves that out, as it does every recommendation.

## What a change means

### How do I change a budget?

Open a government on the map and use − and + on a tile: each click changes
that line by 1% of its 2026 amount, up to 50% either way. The table under the
map has the same change as a slider. The tile keeps its official size; a
hatched slice along its edge shows a cut, and a dotted slice shows extra
spending, as wide as the change. Where a tile is too small for its name, or
its name is cut off, hovering over it, tapping it or reaching it with the
keyboard shows its full name, amount and share.

Interest and other costs of the debt cannot be changed. They are not a budget
choice: they follow from the debt and the interest rates, which the ten-year
outlook calculates (see "How is the future debt calculated?").

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

After every click, a short notice says one thing the change could mean, in
plain words: for example "Less money for Healthcare could mean: a higher
co-payment at the GP". Each click on the same line shows the next possible
effect. The notice has no numbers, because a number is never right for
everyone; the exact amounts are in the key figures and on the map. The
notice disappears by itself after a few seconds.

Each change also moves the debt: more spending raises it and less spending
lowers it. The figures at the top react, and emojis bubble up the screen:
happy ones when the debt falls, worried ones when it rises. This is a playful
signal of direction, not a judgement of the choice. People who have asked
their device for reduced motion do not see these animations.

### What happened to the examples in concrete units?

Earlier versions of the site expressed a change in concrete units, such as
"about 15 million GP consultations". The site no longer shows them: a count
like that is never right for everyone, and the possible effects in words are
easier to grasp. The examples stay in the data, with their sources, for
reference; they are listed below.

### Are the examples in concrete units checked?

Every example comes from an official source, with its amount, page and quote
in the data. Each was found by one AI research agent and then checked by a
second agent that downloaded the source again, found the quote and redid the
arithmetic. That second check confirmed, corrected or rejected each example:
corrected examples carry the reason in the data, and rejected or misleading
ones were left out.

Each example records who approved it, once a reviewer has done so.

Examples are measured per year or per item, so they can be compared with a
yearly budget. Where the source gives a monthly amount, the data multiplies
it by 12 (or by 3 for the maximum unemployment benefit, which only applies
in the first three months) and says so in the note next to the quote.

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
| Social security              | Employee pensions                                                                                                            | years of the average gross pension from the employee scheme (per pensioner)                                              | 17,230.92  |
| Social security              | Employee pensions                                                                                                            | yearly gross minimum pensions for a full career as an employee (single rate)                                             | 22,582.98  |
| Social security              | Healthcare (RIZIV/INAMI)                                                                                                     | GP consultations reimbursed by RIZIV                                                                                     | 29.74      |
| Social security              | Healthcare (RIZIV/INAMI)                                                                                                     | yearly fees for a global medical file                                                                                    | 38.82      |
| Social security              | Healthcare (RIZIV/INAMI)                                                                                                     | RIZIV/INAMI reimbursements of a consultation with an accredited cardiologist (standard rate, no GP referral)             | 38.33      |
| Social security              | Public-sector pensions (all levels of government, Federal Pension Service)                                                   | years of the guaranteed minimum civil-service pension (gross, single rate)                                               | 22,578.96  |
| Social security              | Self-employed pensions                                                                                                       | yearly gross minimum pensions for a full career as a self-employed person (single rate)                                  | 22,582.98  |
| Social security              | Sickness, disability and maternity benefits                                                                                  | average yearly invalidity benefits per person in invalidity (employees and unemployed, 2025)                             | 18,951.48  |
| Social security              | Unemployment and related benefits (RVA/ONEM)                                                                                 | years of the average unemployment benefit of a fully unemployed jobseeker (2025)                                         | 17,534.04  |
| Social security              | Unemployment and related benefits (RVA/ONEM)                                                                                 | first three months of unemployment at the maximum gross benefit                                                          | 8,438.82   |
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

When you change a spending line, a card says what that change could mean,
in plain words and without numbers:

- **Could mean:** two to four possible effects of a cut, or of an increase,
  such as "a higher co-payment at the GP" or "fewer trains at off-peak
  hours". They are possibilities, not a forecast: who feels a change depends
  on how a government makes the choice. Each line links to the official
  document that shows what the line pays for (see "Where do the possible
  effects come from?").
- **Where it would land:** for healthcare through RIZIV/INAMI, the change is
  spread over the sub-budgets in proportion to their size and shown as bars.
  A real reform chooses where to cut; the proportional spread only shows the
  scale.
- **How could it be done?:** for healthcare, the official levers through
  which this spending changes, each with a neutral explanation and its
  source.

### Where do the possible effects come from?

For every line you can change, AI research agents (Claude, by Anthropic)
read the official documents that say what the line pays for: the budget
laws and decrees, their general explanations, the policy notes of the
ministers, and the agencies' own pages. From those they wrote short phrases
for what a cut and an increase could mean, in Dutch, French and English,
with the source of each line. A second agent checked every phrase against
its source and against these rules:

- **No numbers:** no amounts, percentages or counts, because they are never
  right for everyone.
- **Grounded:** each phrase names something the line actually pays for, or
  an official lever over it.
- **Direct, not speculative:** "fewer buses and trams", not guesses about
  traffic, jobs or the economy.
- **Neutral and mirrored:** a cut and an increase are described the same
  way ("fewer" and "more"), without loaded words or party positions.

Like the rest of the site, the phrases still await a human review; see "Why
does the site say "work in progress"?".

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

### Why does the site say "work in progress"? Can the figures be wrong?

Yes, mistakes are possible. The figures were extracted with the help of AI
agents from official sources: BOSA, the Chamber of Representatives
(lachambre.be) and other official references, as described above. Each one
was checked against its source, but the site is still being built and not
every figure has had a human review yet. That is why the masthead carries a
"work in progress" badge and every page ends with this disclaimer and a link
to this FAQ.

### How is the site itself made and tested?

- **Code:** written with Claude Code (an AI coding assistant), test first. The
  calculations, the data checks and the pages all have automated tests,
  which run on every change.
- **Technology:** SvelteKit, D3, TypeScript.
- **Hosting:** Cloudflare Pages, which builds a preview of every proposed
  change.
- **Privacy:** the site has no cookies, no accounts and no third-party
  trackers. Its fonts are served from the site itself, so no third-party font
  service sees your visit. It does count clicks on the budget map, anonymously;
  see below.

### Does the site track what I click?

Only on the budget map, and anonymously, to learn which budgets people look
at, cut or add to. For each click on a tile the site records:

- which government or spending line was clicked (e.g. `federal.defence`);
- whether you opened it, cut it or added to it, and the resulting percentage;
- the language of the page and the order of the click;
- a random session id that exists only while the page is open. It is not
  stored on your device, so a reload or a second visit gets a new one.

It does not record your IP address, browser, device or location, and sets no
cookies. If your browser sends Global Privacy Control or Do Not Track, nothing
is recorded at all. The clicks are stored in a Cloudflare D1 database that
only the project's maintainers can read.

### I found a mistake. What now?

Please open an issue or pull request on the project's GitHub repository, with
a link to the document and page that shows the right number. Corrections go
through the same review as every other change.
