import { TimeInput } from "@/components/ui/time-input";

export default function TimeInputStepAndSeconds() {
  return (
    <div className="grid w-full max-w-xs gap-5">
      <TimeInput
        label="Daily standup"
        defaultValue="09:45"
        minuteStep={15}
        description="Arrow keys move minutes in quarter hours."
      />
      <TimeInput
        label="Clip starts at"
        hourCycle={24}
        showSeconds
        defaultValue="00:12:48"
        description="Seconds are part of the value: 00:12:48."
      />
    </div>
  );
}
