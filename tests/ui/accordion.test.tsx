import { fireEvent, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function Faq(props: { collapsible?: boolean }) {
  return (
    <Accordion type="single" defaultValue="free" {...props}>
      <AccordionItem value="free">
        <AccordionTrigger>Is it free?</AccordionTrigger>
        <AccordionContent>Yes, MIT.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="tailwind">
        <AccordionTrigger>Tailwind 4?</AccordionTrigger>
        <AccordionContent>3.4 works too.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("only points aria-controls at a panel that exists", () => {
    render(<Faq />);
    const open = screen.getByRole("button", { name: "Is it free?" });
    const closed = screen.getByRole("button", { name: "Tailwind 4?" });
    expect(document.getElementById(open.getAttribute("aria-controls")!)).toHaveTextContent("Yes, MIT.");
    expect(closed).not.toHaveAttribute("aria-controls");

    fireEvent.click(closed);
    expect(closed).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(closed.getAttribute("aria-controls")!)).toHaveTextContent("3.4 works too.");
  });

  it("moves between triggers with the arrow keys", () => {
    render(<Faq />);
    screen.getByRole("button", { name: "Is it free?" }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toHaveTextContent("Tailwind 4?");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toHaveTextContent("Is it free?");
  });

  it("keeps the open item open when not collapsible", () => {
    render(<Faq collapsible={false} />);
    const open = screen.getByRole("button", { name: "Is it free?" });
    fireEvent.click(open);
    expect(open).toHaveAttribute("aria-expanded", "true");
    expect(open).toHaveAttribute("aria-disabled", "true");
  });
});
