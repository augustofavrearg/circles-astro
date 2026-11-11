# Project documentation

- Status: active
- Owner: Website Lead
- Last reviewed: 2026-11-10
- Scope: index and authority rules for documentation required to change, review, operate, or release the website.
Does not cover: product brainstorming, meeting notes, personal notes, or transient audit output.

## Sources of truth

| Question | Canonical source |
|---|---|
| Expected outcome, priority, owner, and current status | ClickUp `Website Delivery` task |
| Approved visual composition | Figma reference identified by the task and [`reference/design-sources.md`](reference/design-sources.md) |
| Current editorial content and CMS relationships | Wix CMS in the environment identified by the task |
| Current technical behavior | Repository code and tests |
| Accepted technical decisions | [`decisions/`](decisions/) |
| Development, preview, release, and rollback | [`../README.md`](../README.md) |
| Task transitions and evidence | [`workflow/website-delivery.md`](workflow/website-delivery.md) |
| Technical review procedure | [`technical-review-playbook.md`](technical-review-playbook.md) |
| Marketing CMS operations | [`content/cms-content-guide.md`](content/cms-content-guide.md) |

No source replaces another. A Figma frame does not approve business facts, Wix does not define route behavior, and a completed ClickUp status does not replace technical evidence.

## Active documents

| Document | Lifecycle role | Status |
|---|---|---|
| [`decisions/0001-content-model-and-routing-baseline.md`](decisions/0001-content-model-and-routing-baseline.md) | Architecture decision | accepted |
| [`workflow/website-delivery.md`](workflow/website-delivery.md) | Delivery workflow | active |
| [`technical-review-playbook.md`](technical-review-playbook.md) | Review runbook | active |
| [`content/cms-content-guide.md`](content/cms-content-guide.md) | CMS operating guide | active |
| [`reference/design-sources.md`](reference/design-sources.md) | Figma traceability reference | active |

## Location policy

- `docs/` contains current technical and operational truth needed to work safely.
- ClickUp contains planning, ownership, priority, task status, acceptance criteria, and review evidence.
- Figma contains approved visual references.
- Wix contains environment-specific editorial content and CMS relationships.
- Historical research and obsolete proposals belong in `docs/archive/` only when they remain useful; every archived file must say why it is historical.
- Generated DOCX/PDF files are publication artifacts, not canonical sources. Their editable Markdown source must be identified.
- Local exports, temporary locks, raw audit output, and superseded patch files must not become project authority.

## Change rules

1. Update the canonical document in the same change as the behavior it governs.
2. Give every durable document a status, owner, review date, scope, and exclusions.
3. Link requirements to the applicable ADR, implementation, validation, and task evidence.
4. Archive replaced documents instead of leaving two active versions.
5. Do not copy credentials, access tokens, private CMS content, or expiring Figma URLs into documentation.
