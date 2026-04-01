'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
}

interface Props {
  value: string; // product id
  onChange: (id: string) => void;
  placeholder?: string;
}

export default function ProductAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Product[]>([]);
  const [display, setDisplay] = useState('');
  const debounce = useRef<NodeJS.Timeout | null>(null);

  // when value changes externally, load name
  useEffect(() => {
    if (value) {
      fetch(`/api/products?id=${value}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setDisplay(data.data.name);
          }
        })
        .catch(() => {});
    } else {
      setDisplay('');
    }
  }, [value]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.length === 0) {
      setOptions([]);
      return;
    }
    debounce.current = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setOptions(data.data);
        })
        .catch((e) => {
          console.error(e);
          toast.error('Failed to fetch products');
        });
    }, 300);
  }, [query]);

  const handleSelect = (p: Product) => {
    setDisplay(p.name);
    setOptions([]);
    onChange(p.id);
  };

  return (
    <div className="relative w-full">
      <Input
        value={query !== '' ? query : display}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === '') {
            // clear selection
            onChange('');
          }
        }}
        className="h-8 text-sm rounded border-slate-300 focus:border-accent"
      />
      {options.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-60 overflow-auto">
          {options.map((p) => (
            <div
              key={p.id}
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
              onClick={() => handleSelect(p)}
            >
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
