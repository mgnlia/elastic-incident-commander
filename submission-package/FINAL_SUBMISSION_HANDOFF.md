# Final Submission Handoff (Operator-Only)

**Task ID:** `-tpnAASKhmIu8js9_wABl`  
**Repo:** https://github.com/mgnlia/elastic-incident-commander  
**Live site:** https://elastic-incident-commander.vercel.app

## 0) Current gate status

Canonical adversary re-check: **PASS**
- Report: `submission-package/ADVERSARY_RECHECK.md`
- Commit: https://github.com/mgnlia/elastic-incident-commander/commit/fd63309eae687f747d5672ff34c9dc34fd8b65a5

Verified there:
- `/LICENSE` present
- `/submission-package/DEVPOST_DRAFT.md` present
- `/submission-package/DEMO_VIDEO_SCRIPT.md` present
- Communication binding uses `postmortem_generate_workflow`
- Bootstrap reliability hardening present (`1018637a11475140c5acca3d84302a277e7eea37`)

## 1) Required operator inputs

Fill these before final submit:

- `VIDEO_URL` = ______________________________
- `X_POST_URL` = ______________________________
- `DEVPOST_PROJECT_URL` = ______________________________
- `SUBMITTED_AT_EST` = ______________________________

## 2) Update placeholders in repo

Replace placeholders in:

1. `README.md`
   - `[VIDEO_URL_PLACEHOLDER]` → `VIDEO_URL`
2. `submission-package/DEVPOST_DRAFT.md`
   - `[VIDEO_URL_PLACEHOLDER]` → `VIDEO_URL`
   - `[SOCIAL_POST_PLACEHOLDER]` → `X_POST_URL`

## 3) Final Devpost publish flow

1. Open Devpost project edit page.
2. Paste contents from `submission-package/DEVPOST_DRAFT.md` (after placeholder replacement).
3. Add:
   - Live demo site: https://elastic-incident-commander.vercel.app
   - Repo: https://github.com/mgnlia/elastic-incident-commander
   - Demo video: `VIDEO_URL`
   - Social post: `X_POST_URL`
4. Submit before **Feb 27, 1:00 PM EST**.
5. Capture proof:
   - public project URL
   - submission confirmation screenshot with timestamp

## 4) Completion evidence to return

Provide all 4 artifacts:

1. Final Devpost URL
2. X post permalink (tagging `@elastic_devs`)
3. Commit URL with placeholders replaced
4. Submission confirmation proof with timestamp

When these are available, this lane can move from **REVIEW → DONE**.
