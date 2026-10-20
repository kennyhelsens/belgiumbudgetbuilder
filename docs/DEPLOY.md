# Deploying to Cloudflare Pages

The site is a set of static files built by `npm run build` into `build/`.
Cloudflare Pages builds and hosts it for free, and gives every pull request
its own preview link.

## One-time setup (about 5 minutes)

Cloudflare's menu labels change from time to time; if a label below differs,
look for the closest match.

1. Log in to the Cloudflare dashboard (or create a free account).
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize the Cloudflare GitHub app for the
   `kennyhelsens/belgiumbudgetbuilder` repository only.
4. Build settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `build`
   - Environment variable: `NODE_VERSION` = `24`
5. **Save and Deploy.** The site appears at `https://<project-name>.pages.dev`.
6. Under **Settings** → **Builds & deployments**, keep preview deployments
   enabled for all non-production branches.

From then on:

- Every pull request gets a preview link, posted on the PR by Cloudflare.
  Reviewers check figures on that link before approving.
- Every merge to `main` deploys to production.

## Adding a custom domain later

1. In the Pages project, open **Custom domains** → **Set up a custom domain**.
2. Enter the domain (e.g. `begroting.example` or `www.begroting.example`).
3. If the domain's DNS is managed by Cloudflare, the record is created for you.
   Otherwise Cloudflare shows one CNAME record to add at your registrar.

No code changes are needed: the site uses relative paths.

## Fallback: GitHub Pages

If Cloudflare is ever not an option, the same `build/` folder can be published
with GitHub Pages through a GitHub Actions workflow. It has no per-PR preview
links.
