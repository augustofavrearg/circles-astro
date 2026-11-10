# Repository Instructions

## Technical audits and reviews

These rules apply whenever the user asks to audit, review, validate, verify, or
approve a change, commit, task, page, integration, preview, or release.

Before performing the review:

1. Read `docs/technical-review-playbook.md` in full.
2. Identify the expected outcome, acceptance criteria, authoritative references,
   and exact commit, range, or working-tree changes under review.
3. Select the applicable audit levels from the playbook. Do not run irrelevant
   levels merely to make the review appear more complete.
4. Report missing or contradictory requirements before making an approval
   decision.

During the review:

- Treat the review as read-only unless the user explicitly asks for fixes.
- Inspect the diff and preserve unrelated user changes.
- Prioritize bugs, regressions, security or data risks, violated requirements,
  and missing tests. Report findings first, ordered by severity, with file and
  line references when available.
- Run every check required by the applicable audit levels. Record each result as
  passed, failed, blocked, or not applicable; give a reason for every omitted
  check.
- Never claim that a command, route, viewport, browser behavior, CMS source, or
  integration passed unless it was actually verified during the audit.
- For visible UI changes, perform the visual, responsive, functional, and basic
  accessibility checks defined by the playbook.
- For Wix or integration changes, verify the real source or environment when
  required; fixtures alone are not sufficient evidence.
- Before a preview or release, use the complete gate defined by the playbook and
  `README.md`.

Review decisions:

- Approve only when every applicable acceptance criterion and mandatory check
  passes and the evidence is recorded.
- Request changes when defects are concrete and correctable.
- Mark the review blocked when an external dependency prevents a defensible
  decision.
- If the reviewed code changes after a finding, invalidate the earlier approval
  and repeat the affected checks.
- Do not fix findings silently while presenting the task as still under review.
  If the user requests fixes, implement them as a separate step and then rerun
  the applicable audit.

Safety boundaries:

- Do not run seeds, imports, releases, deployments, production writes, or enable
  indexing without explicit user authorization.
- Do not expose credentials or environment values in output or evidence.
- Do not create commits or push changes unless the user explicitly requests it.

The playbook owns the detailed procedure and evidence template. Keep this file
concise; update the playbook rather than duplicating its instructions here.
