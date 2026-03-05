import * as React from "react";

export type InternationalPolicyCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
};

export default function InternationalPolicyCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
  label = "I confirm the international shipping policy",
}: InternationalPolicyCheckboxProps) {
  return (
    <label className="flex items-start gap-2 select-none">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
