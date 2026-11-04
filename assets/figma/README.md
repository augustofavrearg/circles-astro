# Figma asset registry

This directory records the origin of the media recovered from the Figma file `Circles - website` without persisting its temporary download URLs.

## Naming convention

Public media is stored by its canonical product route or content domain:

```text
public/images/
├── locations/<city>/
├── events/<city>/
├── news/
├── home/<section>/
└── shared/<component>/
```

File names describe the subject or editorial use. Figma layer names such as `To change`, `Image`, `Detail`, `imgToChange` and numeric suffixes must not be used as repository file names.

## Registry rules

- One registry file is maintained for each recovered Figma screen.
- `figmaAssetId` is the stable identifier present in the temporary MCP asset URL; the URL itself is intentionally omitted because it expires.
- `sha256` verifies that a later export is identical to the recovered file.
- `figmaNode` identifies the visible slot where the asset is used.
- Reused files keep one canonical path rather than being duplicated by page.
- Assets are not considered recovered until their local file exists, is non-empty and matches the recorded checksum.

Run `npm run assets:check` after recovering or replacing an asset. The command validates every registry against the files under `public/`.
