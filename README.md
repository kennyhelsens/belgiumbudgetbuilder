# Belgium Budget Builder

A public, sourced and politically neutral website that shows Belgium's 2026
public budgets (federal, social security, regions) to scale, so people can
grasp how big each topic is relative to the others, how hard it is to land a
budget, and what choices mean over the next ten years.

- Product spec: [`docs/SPEC.md`](docs/SPEC.md)
- Deployment and custom domain: [`docs/DEPLOY.md`](docs/DEPLOY.md)
- How the numbers are made: [`docs/FAQ.md`](docs/FAQ.md)

## Development

Requires Node 24 (see `.nvmrc`), which includes npm 11.

```sh
npm ci              # install dependencies
npm run dev         # start the dev server at http://localhost:5173
npm run build       # build the static site into build/
npm run preview     # serve the production build
```

## Checks

The same checks run in CI on every pull request.

```sh
npm run lint                  # Prettier formatting + ESLint
npm run check                 # TypeScript and Svelte type checks
npm run test:unit -- --run    # unit and integration tests (Vitest)
npx playwright install chromium   # once, to get the test browser
npm run test:e2e              # end-to-end tests against the production build (Playwright)
npm run format                # fix formatting
```

## Project layout

```
src/lib/i18n/       languages (nl, fr, en) and message files
src/lib/styles/     design tokens and base styles
src/routes/         pages: / (language choice) and /[lang]/
e2e/                end-to-end tests
docs/               spec and deployment notes
```

## Contributing figures

Budget figures and examples will live in `data/`, each with a source. Changes
go through a pull request and are reviewed before they are published; the PR
template lists what reviewers check.
