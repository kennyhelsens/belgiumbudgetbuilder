# Belgium Budget Builder

**Where does Belgium's money go?** Public finances, to scale.
[belgiumbudgetbuilder.pages.dev](https://belgiumbudgetbuilder.pages.dev) · Nederlands · Français · English

> _"Government looks for 10 billion."_ You read it in the paper. It sounds like an
> enormous amount. But how much is it, compared with everything government spends?

## The story

<!-- The figures below are those of the site's intro, checked in e2e/intro.e2e.ts: update both when data/ changes. -->

Together, Belgium's governments spend **€355.2 billion** in 2026: the federal
government, social security, the regions, the communities and local
government. Ten billion is **2.8%** of that, about **€843 for every
inhabitant**, every year.

But the gap is bigger. Governments spend **€33.7 billion** more than they take
in, and that money is borrowed. Ten billion closes **30%** of it. Interest on
the debt already costs **€16.6 billion** a year, and without changes the debt
rises to **132.7% of GDP by 2036**.

Behind every euro are pensions, hospitals, schools, police, trains and roads.
Cuts affect people, so do taxes, and doing nothing lets the debt grow. **There
are no easy choices.** Try to balance a budget yourself.

## What you can do on the site

- See the spending of all governments to scale, then open one to see its
  lines, each coloured by what it pays for.
- Switch to revenue and see which level of government collects which tax.
- Lower or raise any line or tax. The site says in plain words what that could
  mean, and shows the deficit and the debt over the next ten years.
- Take the challenge, find €10 billion, and share your budget as a link.
- Put the builder in an article or a course page (see the FAQ).
- Follow every figure to the official document it comes from.

## What this is, and what it is not

The figures were extracted with the help of AI agents from official sources:
BOSA, the Chamber of Representatives (lachambre.be), the Federal Planning
Bureau, the National Bank and other official references. **Mistakes are
possible.** [How the numbers are made](docs/FAQ.md) explains every figure,
source and assumption.

This site is not built for politicians: they should know these figures by
heart. It is an effort to grow our shared understanding of public finances,
makes no claim to be 100% correct, and is not a budgeting tool for
governments.

An independent, non-partisan project.

Found a mistake? Please [open an issue](https://github.com/kennyhelsens/belgiumbudgetbuilder/issues)
with the figure, the page and, if you can, the official source.

## For developers

A static [SvelteKit](https://svelte.dev) site on Cloudflare Pages, with one small
Pages Function for anonymous click counts. Requires Node 24.

```sh
npm ci                        # install
npm run dev                   # dev server at http://localhost:5173
npm run lint && npm run check # formatting, ESLint, type checks
npm test                      # unit, integration and end-to-end tests
npm run og-images             # after a build: the preview images in static/og/
```

| Where        | What                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| `data/2026/` | every amount, with its source, page and the line it was copied from                     |
| `src/lib/`   | map, builder, outlook, intro, translations (NL, FR, EN)                                 |
| `functions/` | the anonymous click counter ([`docs/TRACKING.md`](docs/TRACKING.md)) and share previews |
| `e2e/`       | end-to-end tests (Playwright)                                                           |
| `docs/`      | [FAQ](docs/FAQ.md), [spec](docs/SPEC.md), [deployment](docs/DEPLOY.md)                  |

Every figure on the site comes from `data/`, never from the code, and every
change to figures goes through a pull request that a person reviews against
its source.
