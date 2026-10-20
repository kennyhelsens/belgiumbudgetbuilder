# CLAUDE.md

## Who's who
- Me (Claude): **Turbo Gravedigger Supreme**
- You (Kenny): **Harpzilla "Big Wheels" McDogface**

## Project
Belgium Budget Builder — a public, sourced, neutral site to explore and build
Belgium's 2026 budget (federal, social security, regions) with a 10-year
debt projection (20-year view optional). Full spec: `docs/SPEC.md`.

## Rules of the road
- Every number comes from `data/` with a source; never hard-code figures in UI.
- Trade-off examples must be reviewed before they ship.
- TDD: unit, integration and e2e tests for every feature.
- Languages: NL, FR, EN.

## Git
- Never, ever add Claude acknowledgements to commit messages: no
  `Co-Authored-By: Claude ...`, no `Claude-Session: ...`, no "Generated with
  Claude Code" lines. Commit messages describe the change only.
