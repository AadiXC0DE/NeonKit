import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceInput } from "@/components/ui/voice-input";

const status = () => screen.getByRole("status");

describe("VoiceInput", () => {
  beforeEach(() => {
    // jsdom has no canvas; the tape just doesn't draw.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts on press and finishes on the second press", () => {
    const onStart = vi.fn();
    const onStop = vi.fn();
    render(<VoiceInput microphone={false} onStart={onStart} onStop={onStop} />);
    fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(status()).toHaveTextContent("Listening");
    expect(screen.getByRole("button", { name: "Cancel recording" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish and transcribe" }));
    expect(onStop).toHaveBeenCalledWith({ audio: undefined, duration: expect.any(Number) });
    expect(status()).toHaveTextContent("Done");
  });

  it("shows Transcribing until the stop promise settles, then returns to rest", async () => {
    vi.useFakeTimers();
    let resolve!: () => void;
    const onStop = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<VoiceInput microphone={false} onStop={onStop} />);
    fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish and transcribe" }));
    expect(status()).toHaveTextContent("Transcribing");
    expect(screen.getByRole("button", { name: "Transcribing" })).toBeDisabled();
    await act(async () => resolve());
    expect(status()).toHaveTextContent("Done");
    act(() => vi.advanceTimersByTime(1200));
    expect(screen.getByRole("button", { name: "Dictate" })).toBeInTheDocument();
  });

  it("cancels on Escape and on the cancel button", () => {
    const onCancel = vi.fn();
    const onStop = vi.fn();
    render(<VoiceInput microphone={false} onCancel={onCancel} onStop={onStop} />);
    fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "Finish and transcribe" }), { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel recording" }));
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onStop).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Dictate" })).toBeInTheDocument();
  });

  it("says the microphone is blocked when permission is refused", async () => {
    const error = Object.assign(new Error("denied"), { name: "NotAllowedError" });
    const getUserMedia = vi.fn().mockRejectedValue(error);
    Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true });
    const onError = vi.fn();
    render(<VoiceInput onError={onError} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
    });
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
    expect(status()).toHaveTextContent("Microphone blocked");
    const retry = screen.getByRole("button", { name: "Dictate, try again" });
    expect(retry).toHaveAccessibleDescription(/Microphone blocked/);
    Object.defineProperty(navigator, "mediaDevices", { value: undefined, configurable: true });
  });

  it("reports pages without microphone access instead of throwing", async () => {
    Object.defineProperty(navigator, "mediaDevices", { value: undefined, configurable: true });
    const onError = vi.fn();
    render(<VoiceInput onError={onError} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dictate" }));
    });
    expect(onError).toHaveBeenCalled();
    expect(status()).toHaveTextContent("No microphone access on this page");
  });

  it("talks while Space is held in hold mode, and treats a tap as a slip", () => {
    let now = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    const onStop = vi.fn();
    render(<VoiceInput mode="hold" microphone={false} onStop={onStop} />);
    const button = screen.getByRole("button", { name: "Hold to talk" });

    fireEvent.keyDown(button, { key: " " });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(status()).toHaveTextContent("Listening");
    now += 120;
    fireEvent.keyUp(button, { key: " " });
    expect(onStop).not.toHaveBeenCalled();
    expect(status()).toHaveTextContent("Hold to talk");

    fireEvent.keyDown(button, { key: " " });
    now += 2400;
    fireEvent.keyUp(button, { key: " " });
    expect(onStop).toHaveBeenCalledWith({ audio: undefined, duration: 2400 });
  });

  it("follows a controlled state", () => {
    const onStateChange = vi.fn();
    const { rerender } = render(<VoiceInput state="listening" microphone={false} onStateChange={onStateChange} />);
    expect(status()).toHaveTextContent("Listening");
    fireEvent.click(screen.getByRole("button", { name: "Finish and transcribe" }));
    expect(onStateChange).toHaveBeenCalledWith("done");
    rerender(<VoiceInput state="idle" microphone={false} onStateChange={onStateChange} />);
    expect(screen.getByRole("button", { name: "Dictate" })).toBeInTheDocument();
  });

  it("ignores presses while disabled", () => {
    const onStart = vi.fn();
    render(<VoiceInput microphone={false} disabled onStart={onStart} />);
    expect(screen.getByRole("button", { name: "Dictate" })).toBeDisabled();
  });
});
