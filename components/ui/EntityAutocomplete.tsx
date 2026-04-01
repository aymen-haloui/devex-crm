'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { toast } from 'sonner';

interface Entity {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  endpoint: string; // e.g. '/api/products'
}

export default function EntityAutocomplete({ value, onChange, placeholder, endpoint }: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Entity[]>([]);
  const [display, setDisplay] = useState('');
  const debounce = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value) {
      fetch(`${endpoint}?id=${value}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setDisplay(data.data.name ?? data.data.title ?? '');
          }
        })
        .catch(() => {});
    } else {
      setDisplay('');
    }
  }, [value, endpoint]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.length === 0) {
      setOptions([]);
      return;
    }
    debounce.current = setTimeout(() => {
      fetch(`${endpoint}?search=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setOptions(data.data);
        })
        .catch((e) => {
          console.error(e);
          toast.error('Failed to fetch');
        });
    }, 300);
  }, [query, endpoint]);

  const handleSelect = (ent: Entity) => {
    setDisplay(ent.name);
    setOptions([]);
    onChange(ent.id);
  };

  return (
    <div className="relative w-full">
      <Input
        value={query !== '' ? query : display}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === '') {
            onChange('');
          }
        }}
        className="h-8 text-sm rounded border-slate-300 focus:border-accent"
      />
      {options.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-60 overflow-auto">
          {options.map((ent) => (
            <div
              key={ent.id}
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
              onClick={() => handleSelect(ent)}
            >
              {ent.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
