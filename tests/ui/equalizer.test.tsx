import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Equalizer } from "@/components/ui/equalizer";

// A stand-in for Web Audio that records what the component builds.
function installAudioContext() {
  const created: FakeContext[] = [];
  class FakeContext {
    state = "running";
    sampleRate = 48000;
    destination = {};
    sources: unknown[] = [];
    constructor() {
      created.push(this);
    }
    createAnalyser() {
      return {
        fftSize: 0,
        smoothingTimeConstant: 0,
        frequencyBinCount: 1024,
        context: this,
        connect: vi.fn(),
        getByteFrequencyData: vi.fn(),
      };
    }
    createMediaElementSource(element: unknown) {
      this.sources.push(element);
      return { connect: vi.fn() };
    }
    resume = vi.fn();
  }
  vi.stubGlobal("AudioContext", FakeContext);
  return created;
}

describe("Equalizer", () => {
  beforeEach(() => {
    // jsdom has no canvas; the component must cope without a 2D context.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("is decorative unless it is given a name", () => {
    const { container, rerender } = render(<Equalizer />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
    rerender(<Equalizer aria-label="Spectrum of the current track" />);
    expect(screen.getByRole("img", { name: "Spectrum of the current track" })).not.toHaveAttribute("aria-hidden");
  });

  it("renders a canvas at the requested height", () => {
    const { container } = render(<Equalizer height={80} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.height).toBe("80px");
    expect(root.querySelector("canvas")).toBeInTheDocument();
  });

  it("applies an explicit color through --neon", () => {
    const { container } = render(<Equalizer color="magenta" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--neon")).toBe("240 70 235");
  });

  it("forwards its ref to the root element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Equalizer ref={ref} data-testid="eq" />);
    expect(ref.current).toBe(screen.getByTestId("eq"));
  });

  it("waits for the audio element's first play before creating an AudioContext", () => {
    const created = installAudioContext();
    const audio = document.createElement("audio");
    render(<Equalizer audio={audio} />);
    expect(created).toHaveLength(0);
    fireEvent(audio, new Event("play"));
    expect(created).toHaveLength(1);
    expect(created[0].sources).toEqual([audio]);
  });

  it("shares one audio graph per element", () => {
    const created = installAudioContext();
    const audio = document.createElement("audio");
    const { unmount } = render(<Equalizer audio={audio} />);
    fireEvent(audio, new Event("play"));
    unmount();
    render(<Equalizer audio={audio} />);
    fireEvent(audio, new Event("play"));
    expect(created).toHaveLength(1);
  });

  it("stops listening to the element when unmounted", () => {
    const audio = document.createElement("audio");
    const remove = vi.spyOn(audio, "removeEventListener");
    const { unmount } = render(<Equalizer audio={audio} />);
    unmount();
    expect(remove.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(["play", "pause"]));
  });
});
