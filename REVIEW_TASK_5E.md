# Peer Review — Task 5E

## Architecture note
Tests use `page.evaluate(() => import('/src/lib/db.ts'))` which requires the
Vite dev server. CI clones the public app repo and runs `npm run dev` instead
of serving a built dist/ artifact.

## GitHub Actions workflow (e2e.yml):
- [x] tier1 matrix has exactly 5 projects: chromium, firefox, webkit, mobile-chrome, mobile-safari
- [x] fail-fast: false on tier1 matrix
- [x] Browser cache key includes project name and package-lock.json hash
- [x] App repo cloned from public URL (no token required)
- [x] Vite dev server started with wait-on before tests run
- [x] BASE_URL=http://localhost:5173 passed to test runs
- [x] Playwright reports uploaded on: always
- [x] Report artifact names include github.run_id
- [x] tier2 only runs after ALL tier1 jobs pass (needs: tier1)
- [x] e2e-complete provides single status check for branch protection
- [x] workflow_dispatch trigger present for manual runs
- [x] repository_dispatch trigger for app-build-complete events

## GitLab CI:
- [x] .gitlab-ci.yml present
- [x] Clones public app repo in install stage
- [x] All 5 browsers in tier1 stage
- [x] tier2 only runs on default branch

## App repo build.yml update:
- [x] Trigger E2E step added after artifact upload
- [x] Skips gracefully if E2E_DISPATCH_TOKEN not set

## Secrets needed (manual setup required):
- [ ] E2E_DISPATCH_TOKEN in budget-tracker app repo
  - Permission needed: contents:write on encomp/budget-tracker-e2e
  - Setup: GitHub → Settings → Developer settings → Fine-grained tokens
    → Repository: encomp/budget-tracker-e2e → Permissions: Contents → Read and write
  - Then add as secret in encomp/budget-tracker → Settings → Secrets → Actions

## tsc:
- [x] npx tsc --noEmit exits 0

Reviewer: Claude agent
Date: 2026-05-01
Result: PASS
Notes: APP_REPO_TOKEN not needed (repo is public). Only E2E_DISPATCH_TOKEN
needed for auto-trigger from app repo, and it fails gracefully if absent.
