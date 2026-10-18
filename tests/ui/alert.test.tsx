import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function Callout(props: React.ComponentProps<typeof Alert>) {
  return (
    <Alert {...props}>
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>The Visa ending in 4242 was declined.</AlertDescription>
    </Alert>
  );
}

describe("Alert", () => {
  it("announces an alert added after load: errors assertively, the rest politely", () => {
    const { rerender } = render(<Callout status="error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Payment failed");
    rerender(<Callout status="success" key="success" />);
    expect(screen.getByRole("status")).toHaveTextContent("Payment failed");
  });

  it("keeps an alert that was server-rendered with the page quiet", async () => {
    const markup = renderToString(<Callout status="warning" />);
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.appendChild(container);
    expect(container.querySelector('[role="alert"]')).toBeNull();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Callout status="warning" />);
    });
    const alert = container.querySelector("[data-status]");
    expect(alert).not.toBeNull();
    expect(alert).not.toHaveAttribute("role");
    act(() => root?.unmount());
    container.remove();
  });

  it("lets live override the default", () => {
    const { rerender } = render(<Callout status="error" live="polite" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<Callout status="error" live="off" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(<Callout status="info" live="assertive" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the action and a labelled dismiss button", () => {
    const onDismiss = vi.fn();
    render(<Callout status="error" onDismiss={onDismiss} action={<button type="button">Update card</button>} />);
    expect(screen.getByRole("button", { name: "Update card" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("colors from the status unless color is set", () => {
    const { rerender } = render(<Callout status="error" />);
    expect(screen.getByRole("alert").style.getPropertyValue("--neon")).toBe("255 77 94");
    rerender(<Callout status="error" color="violet" />);
    expect(screen.getByRole("alert").style.getPropertyValue("--neon")).toBe("168 85 247");
  });
});
