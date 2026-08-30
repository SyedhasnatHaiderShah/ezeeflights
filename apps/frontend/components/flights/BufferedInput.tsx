"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface BufferedInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
}

export function BufferedInput({ value, onChange, ...props }: BufferedInputProps) {
  const [localValue, setLocalValue] = React.useState(value);

  // Sync with parent value if it changes externally
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) {
          onChange(localValue);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}
