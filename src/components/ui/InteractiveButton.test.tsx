import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InteractiveButton } from "./InteractiveButton";

describe("InteractiveButton", () => {
  it("defaults controls to a non-submitting button", () => {
    const html = renderToStaticMarkup(<InteractiveButton>Open</InteractiveButton>);

    expect(html).toContain('type="button"');
    expect(html).toContain('data-motion="press"');
    expect(html).toContain("interactive-button");
  });

  it("allows explicit submit buttons and preserves accessible state", () => {
    const html = renderToStaticMarkup(
      <InteractiveButton type="submit" disabled aria-label="Subscribe" className="bg-white">
        Send
      </InteractiveButton>,
    );

    expect(html).toContain('type="submit"');
    expect(html).toContain("disabled");
    expect(html).toContain('aria-label="Subscribe"');
    expect(html).toContain("bg-white");
  });

  it("exposes a contextual motion variant without leaking the prop", () => {
    const html = renderToStaticMarkup(<InteractiveButton motion="toggle">Filter</InteractiveButton>);

    expect(html).toContain('data-motion="toggle"');
    expect(html).not.toContain(' motion="toggle"');
  });
});
