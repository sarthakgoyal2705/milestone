"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Target, FolderOpen, Briefcase, X, Command } from "lucide-react";
import { globalSearchAction, type SearchResult } from "@/actions/search";

const TYPE_ICONS = {
  employee: Users,
  goal: Target,
  document: FolderOpen,
  job: Briefcase,
} as const;

const TYPE_LABELS = {
  employee: "People",
  goal: "Goals",
  document: "Documents",
  job: "Jobs",
} as const;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearchAction(query);
        setResults(data);
        setSelectedIndex(0);
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelect(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  }

  // Group results by type
  const grouped = results.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  let flatIndex = -1;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-hairline-strong hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-2 hidden rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          <Command className="inline size-2.5" />K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-hairline bg-surface shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          <Search className="size-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search people, goals, documents, jobs…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isPending && (
            <p className="px-3 py-6 text-center text-sm text-muted">Searching…</p>
          )}

          {!isPending && query.length >= 2 && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {!isPending && query.length < 2 && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Type at least 2 characters to search…
            </p>
          )}

          {Object.entries(grouped).map(([type, items]) => {
            const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS];
            const label = TYPE_LABELS[type as keyof typeof TYPE_LABELS];

            return (
              <div key={type} className="mb-1">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                  <Icon className="size-3.5" />
                  {label}
                </div>
                {items.map((result) => {
                  flatIndex++;
                  const isSelected = flatIndex === selectedIndex;
                  const idx = flatIndex;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        isSelected ? "bg-surface-hover" : "hover:bg-surface-hover"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{result.title}</p>
                        <p className="truncate text-xs text-muted">{result.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
