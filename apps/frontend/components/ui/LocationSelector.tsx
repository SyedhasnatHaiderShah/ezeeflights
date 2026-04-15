'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Command } from 'cmdk';
import { apiFetch } from '@/lib/api/client';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface LocationOption { id: string; name: string; city: string }

export function LocationSelector({ value, onChange, placeholder = 'Select location', endpoint }: { value: string; onChange: (id: string, label: string) => void; placeholder?: string; endpoint: string }) {
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
        <button type="button" role="combobox" aria-label={placeholder} aria-expanded={open} className="flex w-full items-center justify-between rounded border p-2">
          <span className="truncate">{label ? `${label.name}, ${label.city}` : placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <Command.Input value={term} onValueChange={setTerm} placeholder="Search location..." className="w-full border-b p-2 outline-none" />
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
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm"
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
