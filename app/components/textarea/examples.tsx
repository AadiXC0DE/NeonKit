"use client";

import { Textarea } from "@/components/textarea";

export function NeonTextareasPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea
        variant="neon-cyan"
        placeholder="Neon cyan textarea..."
        label="Cyan Textarea"
        rows={3}
      />
      <Textarea
        variant="neon-purple"
        placeholder="Neon purple textarea..."
        label="Purple Textarea"
        rows={3}
      />
      <Textarea
        variant="neon-chartreuse"
        placeholder="Neon chartreuse textarea..."
        label="Chartreuse Textarea"
        rows={3}
      />
      <Textarea
        variant="neon-pink"
        placeholder="Neon pink textarea..."
        label="Pink Textarea"
        rows={3}
      />
    </div>
  );
}

export function BasicTextareasPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea placeholder="Default textarea..." label="Default" rows={3} />
      <Textarea
        variant="filled"
        placeholder="Filled textarea..."
        label="Filled"
        rows={3}
      />
      <Textarea
        variant="ghost"
        placeholder="Ghost textarea..."
        label="Ghost"
        rows={3}
      />
    </div>
  );
}

export function TextareaSizesPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Textarea
        variant="neon-cyan"
        size="sm"
        placeholder="Small..."
        label="Small"
      />
      <Textarea
        variant="neon-purple"
        size="default"
        placeholder="Default..."
        label="Default"
      />
      <Textarea
        variant="neon-chartreuse"
        size="lg"
        placeholder="Large..."
        label="Large"
      />
      <Textarea
        variant="neon-pink"
        size="xl"
        placeholder="Extra large..."
        label="Extra Large"
      />
    </div>
  );
}

export function NeonTextareaVariantsPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea
        variant="neon-destructive"
        placeholder="Error textarea..."
        label="Destructive"
        rows={3}
      />
      <Textarea
        variant="neon-success"
        placeholder="Success textarea..."
        label="Success"
        rows={3}
      />
      <Textarea
        variant="neon-warning"
        placeholder="Warning textarea..."
        label="Warning"
        rows={3}
      />
      <Textarea
        variant="neon-cyan"
        maxLength={100}
        showCount
        placeholder="Type to see character count..."
        label="With Character Count"
        rows={3}
      />
    </div>
  );
}

export function TextareaFeaturesPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Textarea
        variant="neon-cyan"
        placeholder="Normal state..."
        label="Normal State"
        rows={3}
      />
      <Textarea
        variant="neon-destructive"
        error
        helperText="This field is required"
        placeholder="Error state..."
        label="Error State"
        rows={3}
      />
      <Textarea
        variant="neon-success"
        success
        helperText="Valid input!"
        placeholder="Success state..."
        label="Success State"
        rows={3}
      />
      <Textarea
        placeholder="Disabled state..."
        label="Disabled State"
        rows={3}
        disabled
      />
    </div>
  );
}
