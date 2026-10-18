import { fireEvent, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function Settings(props: React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs defaultValue="general" {...props}>
      <TabsList aria-label="Project settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="domains">Domains</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="git">Git</TabsTrigger>
      </TabsList>
      <TabsContent value="general">Framework: Next.js</TabsContent>
      <TabsContent value="domains">3 domains</TabsContent>
      <TabsContent value="git">main</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("wires tabs to panels", () => {
    render(<Settings />);
    const general = screen.getByRole("tab", { name: "General" });
    expect(general).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", general.id);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("moves with Left and Right, skipping disabled tabs", () => {
    const onValueChange = vi.fn();
    render(<Settings onValueChange={onValueChange} />);
    screen.getByRole("tab", { name: "General" }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toHaveTextContent("Domains");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toHaveTextContent("Git");
    expect(onValueChange).toHaveBeenLastCalledWith("git");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toHaveTextContent("Git");
  });

  it("uses Up and Down when vertical", () => {
    render(<Settings orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    screen.getByRole("tab", { name: "General" }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toHaveTextContent("General");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toHaveTextContent("Domains");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("3 domains");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(document.activeElement).toHaveTextContent("Git");
  });

  it("waits for Enter in manual mode", () => {
    render(<Settings activationMode="manual" />);
    screen.getByRole("tab", { name: "General" }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Domains" })).toHaveAttribute("aria-selected", "false");
    fireEvent.click(document.activeElement!);
    expect(screen.getByRole("tab", { name: "Domains" })).toHaveAttribute("aria-selected", "true");
  });
});
