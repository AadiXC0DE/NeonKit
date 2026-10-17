import type { ComponentDoc } from "../types";
import VoiceInputDemo from "../examples/voice-input/demo";
import VoiceInputHold from "../examples/voice-input/hold";
import VoiceInputStates from "../examples/voice-input/states";
import VoiceInputEngine from "../examples/voice-input/engine";

export const doc: ComponentDoc = {
  usage: `import { VoiceInput } from "@/components/ui/voice-input"

<VoiceInput onStop={async ({ audio }) => setText(await transcribe(audio))} />`,
  examples: [
    {
      name: "demo",
      title: "Dictating a commit message",
      description:
        "In a composer toolbar. Press the mic, allow it, and talk: the tape is a dot matrix that steps left every 70ms, with older columns fading like phosphor. Finish and a playhead reads the tape back while onStop's promise is pending.",
      component: VoiceInputDemo,
    },
    {
      name: "hold",
      title: "Push to talk",
      description:
        "mode=\"hold\" records while the button or Space is held. A tap under 300ms is treated as a slip and says to hold. maxDuration stops it at 30s and turns the timer amber for the last ten.",
      component: VoiceInputHold,
    },
    {
      name: "states",
      title: "States",
      description: "Driven by the state prop, with a simulated level and no microphone.",
      component: VoiceInputStates,
    },
    {
      name: "engine",
      title: "With your own speech engine",
      description:
        "microphone={false} leaves capture to your SDK: pass its input level as level and show its interim words yourself.",
      component: VoiceInputEngine,
    },
  ],
  api: [
    {
      name: "VoiceInput",
      description: "Renders a div holding the button, the tape, the timer and Cancel. Other div attributes go on it.",
      props: [
        { prop: "mode", type: '"toggle" | "hold"', default: '"toggle"', description: "toggle: press to start and again to finish. hold: talk while the button or Space is held." },
        { prop: "microphone", type: "boolean", default: "true", description: "Ask for the microphone on start, drive the tape from it and record it with MediaRecorder. Nothing is requested until the first press." },
        { prop: "level", type: "number", description: "Input level, 0 to 1. Overrides the microphone's reading." },
        { prop: "onStart", type: "() => void", description: "Called on press, before any permission prompt." },
        { prop: "onStop", type: "(recording: { audio?: Blob; duration: number }) => void | Promise<unknown>", description: "Called when the speaker finishes. Return a promise to show Transcribing until it settles; a rejection shows an error." },
        { prop: "onCancel", type: "() => void", description: "Called on Cancel or Escape. The recording is discarded and a pending transcription is ignored." },
        { prop: "onError", type: "(error: unknown) => void", description: "The microphone was refused, missing or failed, or the stop promise rejected." },
        { prop: "state", type: "VoiceInputState", description: "Controlled state: idle, requesting, listening, transcribing, done, denied or error." },
        { prop: "defaultState", type: "VoiceInputState", default: '"idle"', description: "Initial state when uncontrolled." },
        { prop: "onStateChange", type: "(state: VoiceInputState) => void", description: "Called on every transition." },
        { prop: "maxDuration", type: "number", description: "Seconds. Recording finishes by itself at this length." },
        { prop: "size", type: '"sm" | "md"', default: '"sm"', description: "sm is a 32px toolbar control that grows into a strip; md is a full-width bar." },
        { prop: "label", type: "string", default: '"Dictate"', description: "Accessible name of the button at rest." },
        { prop: "hint", type: "string", description: "md only: the line on the display at rest." },
        { prop: "disabled", type: "boolean", default: "false", description: "Disables the button." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex." },
      ],
    },
  ],
  notes: [
    "The microphone is only requested from a press, never during render or on mount, so server rendering and hydration never touch it.",
    "One button keeps focus through every state; its name changes from Dictate to Finish and transcribe, and a status region announces Listening, Transcribing, Done or the error.",
    "Escape cancels while listening, waiting for permission or transcribing.",
    "In hold mode Space and Enter work like the pointer, aria-pressed reports the hold, and releasing during the permission prompt cancels quietly.",
    "A refused microphone shows Mic blocked next to the button and describes it with how to fix it; pressing again retries.",
    "Under reduced motion the scrolling tape becomes a still LED level that updates four times a second, and the readback playhead becomes the word Transcribing.",
  ],
};
