# Review — Task BP-6: E2E Test Suite

## Completion checklist

- [x] Page objects created: `StartHerePage`, `BackupToastPage`, `AutoBackupModalPage`, `FsaStatusPage` — all testid bindings correct
- [x] 3 seeding helpers added to `helpers/db.ts`: `seedNoExport`, `seedLapsedExport`, `seedOpenCount3`
- [x] `tier1/start-here.spec.ts` — 4 tests (all 5 browsers)
- [x] `tier1/backup-reminder.spec.ts` — 5 tests (all 5 browsers)
- [x] `tier1/autobackup-modal.spec.ts` — 4 tests (all 5 browsers)
- [x] `tier2/fsa-status.spec.ts` — 4 tests (Chromium only)
- [x] `tier2/backup-reminder-edge.spec.ts` — 3 tests (Chromium only)
- [x] `tier2/start-here-edge.spec.ts` — 2 tests (Chromium only)
- [x] 22 new E2E specs written
- [x] Existing `tier2/backup-reminder.spec.ts` updated to seed `appOpenCount` and `fsaSetupShown` to align with new reminder system
- [x] `seedLapsedExport` uses `Date.now() - N * ms` arithmetic to avoid date-fns import from node_modules in browser context
