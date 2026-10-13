import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("names the image and appends the status", () => {
    render(<Avatar alt="Maya Okafor" status="online" />);
    expect(screen.getByRole("img", { name: "Maya Okafor (online)" })).toHaveTextContent("MO");
  });

  it("is hidden when decorative", () => {
    const { container } = render(<Avatar alt="" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("centers covered initials in the visible part of a group", () => {
    // Every child but the last is overlapped by its neighbour, so the group sets a shift for them
    // and the initials translate by it. The last child keeps the default of 0.
    render(
      <AvatarGroup max={2}>
        <Avatar alt="Wren Morales" />
        <Avatar alt="Marcus Webb" />
        <Avatar alt="Ama Mensah" />
      </AvatarGroup>,
    );
    const group = screen.getByRole("img", { name: "Wren Morales" }).parentElement!;
    expect(group.className).toContain("[&>*:not(:last-child)]:[--avatar-shift:5px]");
    expect(group.className).toContain("[&>*+*]:-ml-2");
    const initials = screen.getByText("WM");
    expect(initials).toHaveAttribute("data-avatar-fallback");
    expect(initials.className).toContain("[transform:translateX(calc(var(--avatar-shift,0px)*-1))]");
    expect(screen.getByRole("img", { name: "1 more" })).toHaveTextContent("+1");
  });

  it("scales the shift with the group size", () => {
    render(
      <AvatarGroup size="xl">
        <Avatar alt="Hugo Moreau" />
        <Avatar alt="Mei Watanabe" />
      </AvatarGroup>,
    );
    const group = screen.getByRole("img", { name: "Hugo Moreau" }).parentElement!;
    expect(group.className).toContain("[--avatar-shift:9px]");
  });
});
