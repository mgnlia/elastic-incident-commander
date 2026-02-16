# Submission Operations Checklist (Critical Path)

**Task ID:** `-tpnAASKhmIu8js9_wABl`  
**Track:** Elasticsearch Agent Builder sprint execution (fallback lane)  
**Deadline:** **Feb 27, 1:00 PM EST**

> Scope guard: submission operations only. No feature expansion.

## 1) Must-complete items

- [x] **Repo lock commit prepared**
  - Latest docs lock packet and architecture evidence are present in-repo.
  - Reference: `docs/SUBMISSION_LOCK.md`

- [x] **Public demo site live (Vercel)**
  - Home: https://elastic-incident-commander.vercel.app
  - Architecture: https://elastic-incident-commander.vercel.app/architecture
  - Demo: https://elastic-incident-commander.vercel.app/demo

- [ ] **Demo video uploaded and URL finalized**
  - Target: YouTube unlisted or Loom
  - Action: replace `[VIDEO_URL_PLACEHOLDER]` in:
    - `README.md`
    - `submission-package/DEVPOST_DRAFT.md`

- [ ] **X post published tagging @elastic_devs**
  - Action: publish post and copy permalink
  - Action: replace `[SOCIAL_POST_PLACEHOLDER]` in:
    - `submission-package/DEVPOST_DRAFT.md`

- [ ] **Final Devpost form submission proof captured**
  - Required evidence:
    1. public Devpost project URL
    2. screenshot or exported confirmation showing submitted timestamp
    3. final description text with real links

## 2) Evidence packet links

- Repo: https://github.com/mgnlia/elastic-incident-commander
- Submission lock packet: https://github.com/mgnlia/elastic-incident-commander/blob/main/docs/SUBMISSION_LOCK.md
- Devpost draft text: https://github.com/mgnlia/elastic-incident-commander/blob/main/submission-package/DEVPOST_DRAFT.md
- Demo script: https://github.com/mgnlia/elastic-incident-commander/blob/main/submission-package/DEMO_VIDEO_SCRIPT.md

## 3) Current blockers

1. **Human-operated channels required**
   - Video platform upload and X posting cannot be completed autonomously in this runtime.
2. **Devpost final submit requires human account session**
   - Final submission proof depends on manual completion in Devpost UI.

## 4) Immediate next action (operator)

1. Upload 3-minute demo video and provide final URL.
2. Publish X post tagging `@elastic_devs` and provide permalink.
3. Paste both URLs into `submission-package/DEVPOST_DRAFT.md` (and README for video URL).
4. Submit on Devpost and capture confirmation proof.

## 5) Done criteria for this lane

Task can be marked **done** only when all below are attached to task record:

- Devpost project URL
- X post permalink
- Commit SHA with placeholders replaced
- Confirmation proof that submission occurred before deadline
