import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Tooltip } from "@/components/ui/tooltip";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

// What a Server Component hands over before the client module is linked: a lazy node.
function lazyNode(element: React.ReactElement) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: element,
    _init: (value: React.ReactElement) => value,
  } as unknown as React.ReactElement;
}

describe("Tooltip", () => {
  it("describes its trigger while open", () => {
    render(
      <Tooltip content="Bold ⌘B" defaultOpen>
        <button type="button">B</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "B" });
    expect(screen.getByRole("tooltip")).toHaveTextContent("Bold ⌘B");
    expect(trigger).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
  });

  it("server-renders a trigger passed as a lazy reference", () => {
    // This used to throw while reading the props of the unresolved child.
    const html = renderToString(<Tooltip content="Bold">{lazyNode(<button type="button">B</button>)}</Tooltip>);
    expect(html).toContain("<button");
  });

  it("wires a lazy trigger on the client", () => {
    render(
      <Tooltip content="Italic" delay={0}>
        {lazyNode(<button type="button">I</button>)}
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "I" });
    fireEvent.pointerEnter(trigger.parentElement!, { pointerType: "mouse" });
    expect(screen.getByRole("tooltip")).toHaveTextContent("Italic");
    expect(trigger).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
  });

  it("closes on Escape", async () => {
    render(
      <Tooltip content="Underline" defaultOpen>
        <button type="button">U</button>
      </Tooltip>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });
});
