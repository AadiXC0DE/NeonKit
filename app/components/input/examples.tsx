"use client";

import { Input } from "@/components/input";
import { User, Mail } from "lucide-react";

export function NeonInputsPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Input
        variant="neon-cyan"
        placeholder="Neon cyan input..."
        label="Cyan Input"
      />
      <Input
        variant="neon-purple"
        placeholder="Neon purple input..."
        label="Purple Input"
      />
      <Input
        variant="neon-chartreuse"
        placeholder="Neon chartreuse input..."
        label="Chartreuse Input"
      />
      <Input
        variant="neon-pink"
        placeholder="Neon pink input..."
        label="Pink Input"
      />
    </div>
  );
}

export function BasicInputsPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Input placeholder="Default input..." label="Default" />
      <Input variant="filled" placeholder="Filled input..." label="Filled" />
      <Input variant="ghost" placeholder="Ghost input..." label="Ghost" />
      <Input variant="search" placeholder="Search..." label="Search" />
    </div>
  );
}

export function InputSizesPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Input
        variant="neon-cyan"
        size="sm"
        placeholder="Small..."
        label="Small"
      />
      <Input
        variant="neon-purple"
        size="default"
        placeholder="Default..."
        label="Default"
      />
      <Input
        variant="neon-chartreuse"
        size="lg"
        placeholder="Large..."
        label="Large"
      />
      <Input
        variant="neon-pink"
        size="xl"
        placeholder="Extra large..."
        label="Extra Large"
      />
    </div>
  );
}

export function NeonInputVariantsPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Input
        variant="neon-destructive"
        placeholder="Error input..."
        label="Destructive"
      />
      <Input
        variant="neon-success"
        placeholder="Success input..."
        label="Success"
      />
      <Input
        variant="neon-warning"
        placeholder="Warning input..."
        label="Warning"
      />
      <Input
        variant="neon-cyan"
        loading
        placeholder="Loading..."
        label="Loading"
      />
    </div>
  );
}

export function InputsWithIconsPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Input
        variant="neon-purple"
        startIcon={<User className="h-4 w-4" />}
        placeholder="Username..."
        label="With Start Icon"
      />
      <Input
        variant="neon-cyan"
        type="password"
        placeholder="Password..."
        label="Password Input"
      />
      <Input
        variant="neon-chartreuse"
        clearable
        placeholder="Type to see clear..."
        label="Clearable Input"
      />
      <Input
        variant="neon-pink"
        startIcon={<Mail className="h-4 w-4" />}
        placeholder="Email..."
        label="Email Input"
      />
    </div>
  );
}
