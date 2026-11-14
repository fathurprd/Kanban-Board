import { useMemo, useState } from "react";
import {
  DEFAULT_FILTERS,
  collectLabels,
  isFiltering,
  matchesFilters,
} from "@/utils/filters";

/** State pencarian + filter, dan helper untuk menyaring kartu. */
export default function useFilters(boards) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const labels = useMemo(() => collectLabels(boards), [boards]);

  // Buang label terpilih yang sudah tidak ada lagi di kartu mana pun
  const activeLabels = filters.labels.filter((k) =>
    labels.some((l) => l.key === k)
  );
  const effective =
    activeLabels.length === filters.labels.length
      ? filters
      : { ...filters, labels: activeLabels };

  const setQuery = (query) => setFilters((f) => ({ ...f, query }));
  const setDue = (due) => setFilters((f) => ({ ...f, due }));
  const toggleLabel = (key) =>
    setFilters((f) => ({
      ...f,
      labels: f.labels.includes(key)
        ? f.labels.filter((k) => k !== key)
        : [...f.labels, key],
    }));
  const reset = () => setFilters(DEFAULT_FILTERS);

  const filtering = isFiltering(effective);
  const matches = (card) => matchesFilters(card, effective);

  const matchedCount = filtering
    ? boards.reduce((n, b) => n + b.card.filter(matches).length, 0)
    : null;

  return {
    filters: effective,
    labels,
    filtering,
    matches,
    matchedCount,
    setQuery,
    setDue,
    toggleLabel,
    reset,
  };
}
