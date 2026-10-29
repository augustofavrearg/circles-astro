# Patch workflow

Status: active

This guide defines the repository convention for exchanging a coherent change
as a Git patch. Generated patch files are temporary transport artifacts; the
commits they represent are the canonical project history.

## One change, one commit

Before exporting a patch, make the commit independently understandable:

- Keep one logical change in each commit.
- Use an imperative subject, ideally no longer than 72 characters.
- Describe the outcome and relevant scope in the body, not the editing process.
- Record co-authors with standard `Co-Authored-By` trailers when applicable.
- Include a `Claude-Session` trailer only when the session may be shared with
  every repository collaborator and retaining it is useful for traceability.
- Do not include secrets, credentials, personal data, or local machine paths.

The tracked [`.gitmessage`](../.gitmessage) file is the canonical message
template. Enable it for this repository with:

```bash
git config commit.template .gitmessage
```

Its rendered form is:

```text
<Imperative summary>

<What changed and why>

Co-Authored-By: <Name> <email@example.com>
Claude-Session: <shareable session URL>
```

Remove unused trailers instead of leaving placeholders in a commit.

## Create a patch

Commit and validate the change first. Then export that commit with Git rather
than writing or editing the diff manually:

```bash
mkdir -p patchs
git format-patch -1 --stdout HEAD > patchs/<change-name>.patch
```

Use lowercase kebab-case for `<change-name>`, for example
`add-events-page.patch`. The local `patchs/` directory is ignored by Git so
exported patches cannot accidentally become part of the repository history.

For a series of commits, preserve one patch per commit and its sequence:

```bash
git format-patch -o patchs/ <base-commit>..HEAD
```

## Review and apply a patch

Inspect the summary and validate that the patch applies before importing it:

```bash
git apply --stat patchs/<change-name>.patch
git apply --check patchs/<change-name>.patch
git am --3way patchs/<change-name>.patch
```

Run these commands from a clean working tree. `git am` preserves the patch's
message and authorship. After applying it, run the checks appropriate to the
change, such as `npm run check`, `npm test`, or `npm run build`.

If a patch conflicts, abort the partial import with `git am --abort`, update the
source commit against the intended base, and generate the patch again. Avoid
hand-editing a generated patch because doing so weakens reproducibility.

## Repository policy

- Commit the workflow and template because they govern current development.
- Do not commit `patchs/`; use GitHub commits and pull requests as the durable
  record.
- Do not commit `.wrangler/`; it contains local tooling output.
- Keep patches outside the repository only when they are needed for exchange,
  recovery, or audit.
