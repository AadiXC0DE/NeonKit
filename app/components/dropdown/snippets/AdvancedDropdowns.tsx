"use client";

import { useState } from "react";
import { Dropdown, type DropdownOption } from "@/components/dropdown";
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

export default function AdvancedDropdowns() {
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
