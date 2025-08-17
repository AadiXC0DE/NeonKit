"use client";

import { Dropdown, DropdownOption } from "@/components/dropdown";
import {
  User,
  Settings,
  Palette,
  Globe,
  Shield,
  Zap,
  Heart,
  Star,
  Folder,
  FileText,
  Image,
} from "lucide-react";
import { useState } from "react";

const basicOptions: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4" },
];

const iconOptions: DropdownOption[] = [
  { value: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  {
    value: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
  { value: "theme", label: "Theme", icon: <Palette className="w-4 h-4" /> },
  { value: "language", label: "Language", icon: <Globe className="w-4 h-4" /> },
  {
    value: "security",
    label: "Security",
    icon: <Shield className="w-4 h-4" />,
  },
];

const detailedOptions: DropdownOption[] = [
  {
    value: "premium",
    label: "Premium Plan",
    description: "Access to all features",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    value: "pro",
    label: "Pro Plan",
    description: "Advanced features included",
    icon: <Star className="w-4 h-4" />,
  },
  {
    value: "basic",
    label: "Basic Plan",
    description: "Essential features only",
    icon: <Heart className="w-4 h-4" />,
  },
];

const fileTypeOptions: DropdownOption[] = [
  { value: "folder", label: "Folder", icon: <Folder className="w-4 h-4" /> },
  {
    value: "document",
    label: "Document",
    icon: <FileText className="w-4 h-4" />,
  },
  { value: "image", label: "Image", icon: <Image className="w-4 h-4" /> },
  { value: "disabled", label: "Disabled Option", disabled: true },
];

export function NeonDropdownsPreview() {
  const [selectedNeonValue, setSelectedNeonValue] = useState("");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        variant="neon-cyan"
        options={basicOptions}
        placeholder="Select cyan option..."
        label="Cyan Dropdown"
        value={selectedNeonValue}
        onChange={setSelectedNeonValue}
      />
      <Dropdown
        variant="neon-purple"
        options={iconOptions}
        placeholder="Select purple option..."
        label="Purple Dropdown"
      />
      <Dropdown
        variant="neon-chartreuse"
        options={detailedOptions}
        placeholder="Select chartreuse option..."
        label="Chartreuse Dropdown"
      />
      <Dropdown
        variant="neon-pink"
        options={basicOptions}
        placeholder="Select pink option..."
        label="Pink Dropdown"
      />
    </div>
  );
}

export function AdvancedDropdownsPreview() {
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [searchableValue, setSearchableValue] = useState("");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        variant="neon-cyan"
        options={iconOptions}
        placeholder="Select with icons..."
        label="With Icons"
        searchable
      />
      <Dropdown
        variant="neon-purple"
        options={detailedOptions}
        placeholder="Select with descriptions..."
        label="With Descriptions"
        clearable
      />
      <Dropdown
        variant="neon-chartreuse"
        options={fileTypeOptions}
        placeholder="Multi-select options..."
        label="Multi-Select"
        multiple
        values={multiSelectValues}
        onMultipleChange={setMultiSelectValues}
      />
      <Dropdown
        variant="neon-pink"
        options={iconOptions}
        placeholder="Searchable dropdown..."
        label="Searchable"
        searchable
        clearable
        value={searchableValue}
        onChange={setSearchableValue}
      />
    </div>
  );
}

export function BasicDropdownsPreview() {
  const [selectedValue, setSelectedValue] = useState("");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        options={basicOptions}
        placeholder="Default dropdown..."
        label="Default"
        value={selectedValue}
        onChange={setSelectedValue}
      />
      <Dropdown
        variant="filled"
        options={basicOptions}
        placeholder="Filled dropdown..."
        label="Filled"
      />
      <Dropdown
        variant="ghost"
        options={basicOptions}
        placeholder="Ghost dropdown..."
        label="Ghost"
      />
      <Dropdown
        options={basicOptions}
        placeholder="Clearable dropdown..."
        label="Clearable"
        clearable
      />
    </div>
  );
}

export function StatusDropdownsPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        variant="neon-destructive"
        options={basicOptions}
        placeholder="Error state..."
        label="Error State"
        error
        helperText="Please select a valid option"
      />
      <Dropdown
        variant="neon-success"
        options={basicOptions}
        placeholder="Success state..."
        label="Success State"
        success
        helperText="Great choice!"
      />
      <Dropdown
        variant="neon-warning"
        options={basicOptions}
        placeholder="Loading state..."
        label="Loading State"
        loading
        helperText="Loading options..."
      />
      <Dropdown
        options={basicOptions}
        placeholder="Disabled state..."
        label="Disabled State"
        disabled
        helperText="This dropdown is disabled"
      />
    </div>
  );
}

export function SizeDropdownsPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <Dropdown
        variant="neon-cyan"
        options={basicOptions}
        placeholder="Small dropdown..."
        label="Small (sm)"
        size="sm"
      />
      <Dropdown
        variant="neon-purple"
        options={basicOptions}
        placeholder="Default dropdown..."
        label="Default"
        size="default"
      />
      <Dropdown
        variant="neon-chartreuse"
        options={basicOptions}
        placeholder="Large dropdown..."
        label="Large (lg)"
        size="lg"
      />
      <Dropdown
        variant="neon-pink"
        options={basicOptions}
        placeholder="Extra large dropdown..."
        label="Extra Large (xl)"
        size="xl"
      />
    </div>
  );
}
