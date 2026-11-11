# Website Delivery Workflow

- Status: Active
- Version: 1.0
- Document owner: Website Lead
- Last reviewed: 2026-11-10
- Effective from: 2026-11-10
- Scope: How website delivery tasks are assigned, executed, reviewed, completed, cancelled, and closed.
Does not cover: Product roadmap, collection schema definitions, routing specifications, implementation reference, release runbooks, or meeting notes.

## 1. Purpose (Website Lead + Marketing)

This document defines how the **Website Delivery** Kanban is operated. Its purpose is to make every status trustworthy: anyone looking at the board should be able to distinguish unselected work, ready work, active work, blocked work, work awaiting verification, and finished work.

A status communicates evidence about the task's current condition. A task moves only when it meets the entry criteria of its destination status.

The **Website Delivery List** is the canonical operational board. Folder-level views are summaries only.

## 2. Actual Participants (Website Lead)

The workflow has **two core participants**.

| Participant | Roles performed | Responsibilities |
|----|----|----|
| Website Lead | Project Owner, Technical Task Owner, Reviewer | Prioritizes work, defines scope, implements most tasks, protects the collection and routing model, reviews every task, and makes final project decisions. |
| Marketing | CMS Content Owner, CMS Task Owner | Loads and maintains approved CMS content, media, metadata, references, publication state, and ordering within the approved model. |

The Website Lead may execute and review the same technical task. In that case, the task must follow the formal self-review procedure in this document. Marketing work receives a cross-review from the Website Lead.

Additional specialist review may be requested for legal, privacy, payments, authentication, booking, destructive CMS operations, or final production release, but those specialists are not permanent Kanban participants.

## 3. Responsibility Boundary (Website Lead + Marketing)

### Tasks owned by the Website Lead (Website Lead)

- **Project planning, prioritization, and acceptance criteria.** (Website Lead)
- **Collection architecture, fields, references, and composition rules.** (Website Lead)
- **Routes, slugs, redirects, and page behavior.** (Website Lead)
- **Astro, Wix Headless, integrations, forms, and booking behavior.** (Website Lead)
- **Desktop and mobile implementation.** (Website Lead)
- **Tests, builds, previews, deployment, and production validation.** (Website Lead)
- **Technical review and final task approval.** (Website Lead)

### Tasks owned by Marketing (Marketing)

- **Create and update approved CMS records.** (Marketing)
- **Enter final copy, labels, descriptions, and editorial content.** (Marketing)
- **Upload and assign approved images and other media.** (Marketing)
- **Complete approved SEO content fields.** (Marketing)
- **Set approved references, ordering, and publication state.** (Marketing)
- **Verify spelling, factual accuracy, content completeness, and media rights.** (Marketing)

### CMS guardrails (Marketing + Website Lead)

Marketing works inside the approved collection model. Marketing must not perform any of the following without explicit approval from the Website Lead:

- **Create, rename, or delete a collection.** (Website Lead approval required)
- **Create, rename, delete, or change the type of a field.** (Website Lead approval required)
- **Change reference or multi-reference structure.** (Website Lead approval required)
- **Change route logic, slug rules, or collection IDs.** (Website Lead approval required)
- **Run a seed, bulk import, bulk update, or bulk deletion in production.** (Website Lead approval required)
- **Replace approved production content with fixtures or test data.** (Not permitted)

The Website Lead provides the required collection, fields, relationship rules, and acceptance criteria before a CMS task enters `TO DO/OPEN`.

### Mixed technical and CMS work (Website Lead)

A task that requires both implementation and CMS content operations must be split into two linked tasks before work begins:

1.  **Implement and validate the technical or collection behavior.** (Website Lead)
2.  **Load or update the approved CMS content.** (Marketing)

The Marketing task depends on the technical task unless the Website Lead confirms that the current model is already stable.

## 4. Workflow at a Glance (Website Lead + Marketing)

    IDEAS/SUGGESTIONS  (Website Lead)
            ↓
    BACKLOG           (Website Lead)
            ↓
    TO DO/OPEN        (Website Lead assigns owner)
            ↓
    IN PROGRESS       (Website Lead or Marketing)
            ├──────────────→ BLOCKED (Assigned Task Owner + Website Lead)
            ↓
    IN REVIEW         (Website Lead reviews)
            ├──────────────→ IN PROGRESS (corrections required)
            ↓
    COMPLETED         (Website Lead approves)
            ↓
    CLOSED            (Website Lead archives)

`CANCELLED` is an exceptional final state controlled by the Website Lead. It can be reached from any non-final status when the task is intentionally abandoned.

## 5. Status Reference (Website Lead + Marketing)

| Status | Meaning | Responsible participant | Exit condition |
|----|----|----|----|
| IDEAS/SUGGESTIONS | A possibility worth preserving but not yet accepted as project work. | Website Lead | Accept into `BACKLOG`, merge, or cancel. |
| BACKLOG | Accepted work not yet selected or ready for immediate execution. | Website Lead | Satisfy the Definition of Ready and select for `TO DO/OPEN`. |
| TO DO/OPEN | A small, defined, unblocked task that may be started without another planning session. | Website Lead + assigned Task Owner | Work actually begins, or the task returns to `BACKLOG`. |
| IN PROGRESS | Implementation or CMS work is happening now. | Assigned Task Owner: Website Lead or Marketing | Prepare review evidence, declare a blocker, or cancel. |
| BLOCKED | Meaningful progress cannot continue because of a specific external condition. | Assigned Task Owner + Website Lead | Resolve the blocker and resume or reschedule. |
| IN REVIEW | Work has stopped changing and is being verified against its acceptance criteria. | Website Lead | Approve, request corrections, or declare review blocked. |
| COMPLETED | The outcome passed review and satisfies the Definition of Done. | Website Lead | Retain for reporting or archive as `CLOSED`. |
| CANCELLED | The original outcome was intentionally abandoned. | Website Lead | Final state; preserve the reason. |
| CLOSED | Completed work archived after its milestone, release, or reporting cycle. | Website Lead | Final administrative state. |

## 6. Definition of Ready (Website Lead + Assigned Task Owner)

A task may enter `TO DO/OPEN` only when every applicable condition is true:

- **State one verifiable outcome and explicit acceptance criteria.** (Website Lead)
- **Assign the task to the Website Lead or Marketing.** (Website Lead)
- **Keep the scope small enough to implement and review as one task.** (Website Lead)
- **Split mixed technical and CMS work into linked tasks.** (Website Lead)
- **Identify the affected route, component, collection, or integration.** (Website Lead)
- **Link relevant Figma, copy, media, data, and technical references.** (Website Lead)
- **Document collection fields and relationship rules for CMS work.** (Website Lead)
- **Confirm dependencies, access, credentials, and required decisions.** (Assigned Task Owner)
- **Label provisional content and identify who must approve it.** (Website Lead)
- **Set priority, workstream, and milestone.** (Website Lead)
- **Confirm that no unanswered question prevents work from starting.** (Website Lead + Assigned Task Owner)

If a required condition is missing, the task remains in `BACKLOG`.

### Required ClickUp structure

Every delivery task uses the built-in assignee, priority, status, and dependency features plus the existing `Route`, `Workstream`, and `Milestone` fields. Do not encode dependencies only in the legacy `Dependency` text field; create a native waiting-on/blocking relationship and retain the text value only until legacy tasks are migrated.

The task description contains the verifiable outcome and acceptance criteria. References are recorded in the description or review note using stable identifiers:

- Git commit hash or pull request;
- Figma file, page, frame name, node ID, and viewport;
- Wix environment, collection IDs, and affected record IDs;
- preview URL when a preview was explicitly authorized;
- linked follow-up tasks for accepted limitations.

An assignee is mandatory from `TO DO/OPEN` through `COMPLETED`. A task cannot enter `COMPLETED` with an empty evidence thread.

### Legacy task migration

Existing completed tasks without review evidence are historical delivery records, not evidence that the current Definition of Done was followed. Do not invent retrospective evidence. Add links only when they can be verified from Git, Figma, Wix, or an existing preview; otherwise label the gap and apply this workflow to all new transitions.

## 7. Selecting and Starting Work (Website Lead + Assigned Task Owner)

1.  **Choose the highest-priority task that satisfies the Definition of Ready.** (Website Lead)
2.  **Confirm that the assigned participant has capacity and access.** (Assigned Task Owner)
3.  **Move the task from** `BACKLOG` **to** `TO DO/OPEN`**.** (Website Lead)
4.  **Read the description, acceptance criteria, dependencies, and references.** (Assigned Task Owner)
5.  **Raise material ambiguity before making changes.** (Assigned Task Owner)
6.  **Move the task to** `IN PROGRESS` **only when work actually begins.** (Assigned Task Owner)

Moving a task to `TO DO/OPEN` is a near-term commitment. Only one task should normally be `IN PROGRESS` for the Website Lead and one for Marketing.

## 8. Performing Technical Work (Website Lead)

1.  **Implement only the agreed outcome.** (Website Lead)
2.  **Keep the task checklist and technical notes current.** (Website Lead)
3.  **Record decisions affecting data, routes, content, or production behavior.** (Website Lead)
4.  **Protect unrelated changes and keep the change set focused.** (Website Lead)
5.  **Create separate follow-up tasks for discoveries outside the agreed scope.** (Website Lead)
6.  **Run relevant tests, checks, builds, and previews.** (Website Lead)
7.  **Prepare the review note and move the task to** `IN REVIEW`**.** (Website Lead)

## 9. Performing CMS Work (Marketing)

1.  **Confirm the target collection and required records.** (Marketing)
2.  **Follow the approved field and relationship instructions.** (Marketing)
3.  **Load or update copy, media, SEO content, references, ordering, and publication state in scope.** (Marketing)
4.  **Do not change the collection model or perform unapproved bulk operations.** (Marketing)
5.  **Check spelling, factual accuracy, completeness, and media rights.** (Marketing)
6.  **Record which environment and records were changed.** (Marketing)
7.  **Attach evidence and move the task to** `IN REVIEW`**.** (Marketing)

If the requested data cannot fit the approved model, Marketing stops work and moves the task to `BLOCKED`; the Website Lead decides whether the model or the content must change.

## 10. Managing a Blocker (Assigned Task Owner + Website Lead)

`BLOCKED` is used only when meaningful progress cannot continue. Difficulty, low priority, or ordinary review time are not blockers.

1.  **Describe exactly what cannot proceed and why.** (Assigned Task Owner)
2.  **Identify the decision, credential, person, system, or dependency required.** (Assigned Task Owner)
3.  **Record the next action and follow-up date.** (Assigned Task Owner)
4.  **Move the task to** `BLOCKED`**.** (Assigned Task Owner)
5.  **Coordinate or decide the resolution.** (Website Lead)
6.  **Return the task to** `IN PROGRESS` **when work resumes immediately, or** `TO DO/OPEN` **when it will resume later.** (Website Lead + Assigned Task Owner)

The Website Lead reviews every blocked task during each project follow-up.

## 11. Preparing Review (Assigned Task Owner)

Before moving a task from `IN PROGRESS` to `IN REVIEW`, the assigned Task Owner adds one review note containing:

### Outcome and scope (Assigned Task Owner)

- **Describe the delivered outcome.** (Assigned Task Owner)
- **State what was included and intentionally excluded.** (Assigned Task Owner)

### Evidence (Assigned Task Owner)

- **Link the commit or identifiable change set for technical work.** (Website Lead)
- **Link the preview and relevant Figma frame for visual work.** (Website Lead)
- **Record desktop, mobile, test, check, build, and validation results.** (Website Lead)
- **Identify the Wix environment, collections, and records changed for CMS work.** (Marketing)
- **Attach screenshots or record links that demonstrate the CMS result.** (Marketing)
- **State whether production data was written.** (Assigned Task Owner)

### Content and limitations (Assigned Task Owner)

- **Classify content as approved, awaiting approval, or provisional.** (Assigned Task Owner)
- **Describe fallback behavior when applicable.** (Website Lead)
- **List known non-blocking limitations.** (Assigned Task Owner)
- **Create and link required follow-up tasks.** (Website Lead)

After the note is complete, the assigned Task Owner moves the task to `IN REVIEW`.

## 12. Review Models (Website Lead + Marketing)

### Technical self-review (Website Lead)

When the Website Lead implemented the task, `IN REVIEW` creates a deliberate separation between implementation and verification.

1.  **Stop modifying the task and review it from the acceptance criteria, not from memory.** (Website Lead)
2.  **Inspect the final diff or commit as a reviewer.** (Website Lead)
3.  **Rerun the applicable checks from a clean, reproducible state.** (Website Lead)
4.  **Verify the affected routes and behavior independently.** (Website Lead)
5.  **Compare visual work with Figma at agreed desktop and mobile viewports.** (Website Lead)
6.  **Verify CMS sources, references, fallbacks, and production safety.** (Website Lead)
7.  **Record** `SELF-REVIEW APPROVED` **or return the task to** `IN PROGRESS` **for corrections.** (Website Lead)

The Website Lead must not silently fix findings while leaving the task in `IN REVIEW`. Any correction moves the task back to `IN PROGRESS`, even if the same person performs it.

An additional reviewer should be requested when the Website Lead judges the change to be high-risk, especially for authentication, payments, booking, permissions, destructive CMS operations, privacy, or final production release.

### CMS cross-review (Marketing + Website Lead)

1.  **Record** `CONTENT VERIFIED` **after checking copy, facts, completeness, ordering, publication state, and media rights.** (Marketing)
2.  **Verify that the intended collections and fields were used.** (Website Lead)
3.  **Verify references, multi-references, slugs, and page composition.** (Website Lead)
4.  **Verify the visible result through the Wix Headless site or preview.** (Website Lead)
5.  **Confirm that no schema change, fixture fallback, or unapproved bulk operation occurred.** (Website Lead)
6.  **Record** `APPROVED`**,** `CHANGES REQUESTED`**, or** `BLOCKED`**.** (Website Lead)

Marketing corrects content findings. The Website Lead corrects technical or model findings. If both kinds of correction are required, use the two linked tasks rather than mixing ownership.

### Review decision (Website Lead)

- `SELF-REVIEW APPROVED`**: a Website Lead task passed the formal self-review.** (Website Lead)
- `APPROVED`**: a Marketing or externally executed task passed review.** (Website Lead)
- `CHANGES REQUESTED`**: concrete, testable corrections are required; move to** `IN PROGRESS`**.** (Website Lead)
- `BLOCKED`**: an external condition prevents verification; move to** `BLOCKED`**.** (Website Lead)

General comments such as “needs improvement” are not sufficient. Every correction must describe an observable failure or unmet criterion.

## 13. Definition of Done (Website Lead)

A task can enter `COMPLETED` only when every applicable condition is true:

- **The agreed outcome exists and all acceptance criteria pass.** (Website Lead)
- **Required tests, checks, builds, validations, and previews pass.** (Website Lead)
- **Desktop and mobile behavior are verified for visual work.** (Website Lead)
- **The result is sufficiently faithful to Figma for the agreed delivery stage.** (Website Lead)
- **CMS data uses the intended collections and relationships.** (Website Lead)
- **Marketing has recorded** `CONTENT VERIFIED` **for CMS content work.** (Marketing)
- **Production does not depend on fixtures or test-data fallback.** (Website Lead)
- **Routes, links, and interactions in scope behave correctly.** (Website Lead)
- **Required evidence is attached or linked.** (Assigned Task Owner)
- **Provisional content and non-critical limitations are explicit.** (Assigned Task Owner)
- **Required follow-up work exists as separate tasks.** (Website Lead)
- **The Website Lead has recorded an approval decision.** (Website Lead)

`COMPLETED` does not mean “released to production” unless production release is explicitly included in the acceptance criteria.

## 14. Final States and Reopening (Website Lead)

### COMPLETED → CLOSED (Website Lead)

1.  **Confirm that the milestone, release, or reporting cycle has finished.** (Website Lead)
2.  **Confirm that required follow-up tasks remain visible.** (Website Lead)
3.  **Move the completed task to** `CLOSED`**.** (Website Lead)

### Any non-final status → CANCELLED (Website Lead)

1.  **Confirm that the original outcome is intentionally abandoned.** (Website Lead)
2.  **Record the reason, decision owner, and replacement task when applicable.** (Website Lead)
3.  **Move the task to** `CANCELLED`**; do not delete its history.** (Website Lead)

### Reopening completed work (Website Lead)

- **Return the original task to** `IN PROGRESS` **only when its original acceptance criteria were not actually met.** (Website Lead)
- **Create a new task when requirements changed after correct completion.** (Website Lead)
- **Link the new and completed tasks for traceability.** (Website Lead)

## 15. Provisional Content Policy (Website Lead + Marketing)

Provisional content may advance layout and responsive implementation, but it must never be confused with approved production content.

- **Ensure provisional values follow Figma and known business reality.** (Website Lead)
- **Label every provisional value in the task review note.** (Website Lead)
- **Create a linked CMS replacement or approval task.** (Website Lead)
- **Replace provisional content with approved copy and media.** (Marketing)
- **Record** `CONTENT VERIFIED` **after replacement.** (Marketing)
- **Verify that replacement did not require an unintended model change.** (Website Lead)

Colored image placeholders are acceptable during design implementation. They must be replaced or explicitly accepted before the relevant production milestone.

## 16. Work-in-Progress Limits (Website Lead + Marketing)

| Status | Limit | Responsible participant |
|----|---:|----|
| TO DO/OPEN | 2 total | Website Lead |
| IN PROGRESS | 1 Website Lead task + 1 Marketing task | Website Lead + Marketing |
| IN REVIEW | 1 total | Website Lead |

When a limit is reached, finish, review, or unblock existing work before pulling another task. `BLOCKED` has no planned capacity, but every blocked task must have an owner, next action, and follow-up date.

## 17. Project Follow-up (Website Lead + Marketing When Needed)

The Website Lead reviews the board from right to left so that finishing takes priority over starting:

1.  **Review the single task in** `IN REVIEW`**.** (Website Lead; Marketing joins for CMS work)
2.  **Review blockers and next actions.** (Website Lead + affected Task Owner)
3.  **Review active technical progress.** (Website Lead)
4.  **Review active CMS progress when CMS work exists.** (Marketing + Website Lead)
5.  **Confirm that** `TO DO/OPEN` **remains ready and correctly ordered.** (Website Lead)
6.  **Reorder** `BACKLOG` **only when priority changes.** (Website Lead)
7.  **Capture new ideas without interrupting active work.** (Website Lead)

Marketing does not need to attend technical follow-ups that contain no CMS task, dependency, or content decision.

## 18. Transition Reference (Website Lead + Marketing)

| From | To | Participant who moves the task | Required evidence |
|----|----|----|----|
| IDEAS/SUGGESTIONS | BACKLOG | Website Lead | Idea accepted as project work. |
| BACKLOG | TO DO/OPEN | Website Lead | Definition of Ready satisfied. |
| TO DO/OPEN | IN PROGRESS | Assigned Task Owner | Work actually started. |
| TO DO/OPEN | BACKLOG | Website Lead | Task deprioritized or no longer ready. |
| IN PROGRESS | IN REVIEW | Assigned Task Owner | Work complete and review note added. |
| IN PROGRESS | BLOCKED | Assigned Task Owner | Blocker and next action recorded. |
| BLOCKED | IN PROGRESS | Assigned Task Owner | Work resumes immediately. |
| BLOCKED | TO DO/OPEN | Website Lead | Blocker removed; work resumes later. |
| IN REVIEW | COMPLETED | Website Lead | Approval decision recorded. |
| IN REVIEW | IN PROGRESS | Website Lead | Testable corrections recorded. |
| IN REVIEW | BLOCKED | Website Lead | External review dependency recorded. |
| COMPLETED | IN PROGRESS | Website Lead | Original acceptance criteria proved unmet. |
| COMPLETED | CLOSED | Website Lead | Reporting or release cycle finalized. |
| Any non-final status | CANCELLED | Website Lead | Reason recorded. |

## 19. Required Comment Templates (Website Lead + Marketing)

### Review request (Assigned Task Owner)

    OUTCOME

    SCOPE
    Included:
    Excluded:

    EVIDENCE
    - Change set or CMS records:
    - Environment/preview:
    - Desktop/mobile:
    - Checks or content verification:
    - Figma/reference:

    CONTENT AND DATA
    - Collections:
    - Approval state:
    - Fallback behavior:
    - Production data written: Yes/No

    KNOWN LIMITATIONS AND FOLLOW-UPS

### Technical self-review approval (Website Lead)

    SELF-REVIEW APPROVED

    Acceptance criteria verified:
    Change set inspected:
    Checks rerun:
    Routes and responsive behavior verified:
    CMS/fallback behavior verified:
    Non-blocking follow-ups:

### CMS content verification (Marketing)

    CONTENT VERIFIED

    Collections and records changed:
    Copy and facts checked:
    Media and rights checked:
    References/order/publication checked:
    Provisional values remaining:

### Cross-review approval (Website Lead)

    APPROVED

    Acceptance criteria verified:
    CMS structure and references verified:
    Visible result verified:
    Non-blocking follow-ups:

### Changes requested (Website Lead)

    CHANGES REQUESTED

    Finding:
    Responsible participant: Website Lead/Marketing
    Expected result:
    How to verify the correction:

### Blocker (Assigned Task Owner)

    BLOCKED

    Blocked condition:
    Required resolution:
    Resolution owner:
    Next action:
    Follow-up date:

## 20. Workflow Governance (Website Lead)

- **Maintain the board and this document.** (Website Lead)
- **Use backlog order and priority fields for priority; do not misuse status.** (Website Lead)
- **Do not introduce alternative statuses without updating this document.** (Website Lead)
- **Review the workflow after each milestone or repeated process failure.** (Website Lead)
- **Ask Marketing to review changes affecting CMS responsibilities.** (Website Lead)
- **Keep the document** `Active` **while it represents the process currently in use.** (Website Lead)
- **Review the CMS guardrails with Marketing before Marketing starts its first CMS task.** (Website Lead)
- **Record Marketing's acknowledgement in the first assigned CMS task or the project documentation.** (Marketing)
