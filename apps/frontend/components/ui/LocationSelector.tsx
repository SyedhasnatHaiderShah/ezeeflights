'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Command } from 'cmdk';
import { apiFetch } from '@/lib/api/client';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface LocationOption { id: string; name: string; city: string }

interface LocationSelectorProps {
  value: string;
  onChange: (id: string, label: string) => void;
  placeholder?: string;
  endpoint: string;
  className?: string;
}

export function LocationSelector({ value, onChange, placeholder = 'Select location', endpoint, className }: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<LocationOption[]>([]);
  const label = useMemo(() => options.find((o) => o.id === value), [options, value]);

  useEffect(() => {
    if (term.trim().length < 2) {
      setOptions([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await apiFetch<LocationOption[]>(`${endpoint}?q=${encodeURIComponent(term)}`);
        setOptions(rows);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [endpoint, term]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-label={placeholder}
          aria-expanded={open}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background transition-all duration-200 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            className,
          )}
        >
          <span className="truncate">{label ? `${label.name}, ${label.city}` : placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) rounded-md border border-border p-0">
        <Command>
          <Command.Input
            value={term}
            onValueChange={setTerm}
            placeholder="Search location..."
            className="w-full border-b border-border bg-background px-3 py-2 text-sm outline-none"
          />
          <Command.List className="max-h-64 overflow-auto p-1">
            {loading && <div className="flex items-center gap-2 p-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
            {!loading && options.length === 0 && <Command.Empty className="p-2 text-sm">No locations found</Command.Empty>}
            {options.map((option) => (
              <Command.Item
                key={option.id}
                value={`${option.name} ${option.city}`}
                onSelect={() => {
                  onChange(option.id, `${option.name}, ${option.city}`);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-muted"
              >
                <Check className={`h-4 w-4 ${value === option.id ? 'opacity-100' : 'opacity-0'}`} />
                <span>{option.name}, {option.city}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
