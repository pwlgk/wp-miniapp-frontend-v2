// components/home/SearchBar.tsx
"use client";

import { Search } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="p-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Искать аксессуары..."
          value={value}
          onChange={onChange}
          className="w-full h-12 pl-12 pr-4 rounded-lg bg-gray-100 dark:bg-dark-secondary border-transparent focus:border-light-accent dark:focus:border-dark-accent focus:ring-0 text-light-text dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>
    </div>
  );
}