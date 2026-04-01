import * as React from 'react';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

interface CommandSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CommandSelect({ value, options, onChange, placeholder }: CommandSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-[170px] items-center justify-between rounded-md border border-input bg-white px-3 text-xs shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>{selected ? selected.label : placeholder || 'Select'}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[170px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex items-center gap-2 text-xs"
              >
                {opt.label}
                {value === opt.value && <CheckIcon className="ml-auto h-4 w-4 text-blue-600" />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
