"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type Props = {
  placeholder?: string;
  onFilter: (query: string) => void;
  initialQuery?: string;
  value?: string;
};

export function ProductSearch({
  placeholder = "Search medicines by name, composition...",
  onFilter,
  initialQuery = "",
  value,
}: Props) {
  const [localQuery, setLocalQuery] = useState(value ?? initialQuery ?? "");

  // When controlled value prop changes (e.g. from URL/direct link), sync local state.
  // When typing, we keep local state responsive; parent manages URL separately.
  const controlled = value !== undefined ? value : localQuery;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocalQuery(next);
    // Only update parent filter state when explicitly submitted (Enter/Clear);
    // typing stays local until submission.
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onFilter(controlled);
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    onFilter("");
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground" />
        <Input
          type="text"
          value={controlled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 transition-all focus:ring-2 ring-primary/20"
        />
        {controlled && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 hover:text-foreground text-muted-foreground transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <X className="size-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
