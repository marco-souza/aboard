import { createMemo, createSignal } from "solid-js";

const sections = [
  {
    key: "boards",
    label: "Boards",
    icon: "📋",
    // TODO: to load async
    items: ["Playground", "Sprint 1", "Backlog"],
  },
  {
    key: "users",
    label: "Users",
    icon: "👥",
    items: ["Board Members", "Invite"],
  },
  {
    key: "settings",
    label: "Settings",
    icon: "⚙️",
    items: ["General", "Appearance", "Integrations", "Notifications"],
  },
] as const;

type Key = (typeof sections)[number]["key"];

export type OmniMenuEntry =
  | { type: "section"; section: string }
  | { type: "item"; section: string; item: string };

export type OmniMenuState = ReturnType<typeof useOmniMenu>;

interface UseOmniMenuOptions {
  onSelect?: (entry: OmniMenuEntry) => void;
}

export function useOmniMenu(options: UseOmniMenuOptions = {}) {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [expanded, setExpanded] = createSignal<Record<Key, boolean>>({
    boards: true,
    settings: false,
    users: false,
  });

  let dialogRef!: HTMLDialogElement;
  let searchRef!: HTMLInputElement;

  function setDialogRef(el: HTMLDialogElement) {
    dialogRef = el;
  }

  function setSearchRef(el: HTMLInputElement) {
    searchRef = el;
  }

  function toggle() {
    if (open()) {
      dialogRef.close();
      setOpen(false);
    } else {
      dialogRef.showModal();
      setOpen(true);
      updateSearch("");
      resetSelection();
      searchRef?.focus();
    }
  }

  const [searchCollapsed, setSearchCollapsed] = createSignal(new Set<string>());

  function updateSearch(value: string) {
    setSearch(value);
    setSearchCollapsed(new Set());
  }

  function toggleSection(key: string) {
    const { matchedKeys } = filteredSections();
    if (matchedKeys.size > 0) {
      setSearchCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    } else {
      setExpanded((prev) => ({ ...prev, [key]: !prev[key as Key] }));
    }
  }

  const filteredSections = createMemo(() => {
    const q = search().toLowerCase();
    if (!q) return { sections, matchedKeys: new Set<string>() };

    const matched = sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.toLowerCase().includes(q)),
      }))
      .filter((section) => section.items.length > 0);

    return {
      sections: matched,
      matchedKeys: new Set(matched.map((s) => s.key)),
    };
  });

  const isExpanded = (key: string) => {
    const { matchedKeys } = filteredSections();
    if (matchedKeys.size > 0) {
      return matchedKeys.has(key as Key) && !searchCollapsed().has(key);
    }
    return !!expanded()[key as Key];
  };

  const visibleEntries = createMemo<OmniMenuEntry[]>(() => {
    const result: OmniMenuEntry[] = [];
    for (const section of filteredSections().sections) {
      result.push({ type: "section", section: section.key });
      if (!isExpanded(section.key)) continue;
      for (const item of section.items) {
        result.push({ type: "item", section: section.key, item });
      }
    }
    return result;
  });

  const [selectedIndex, setSelectedIndex] = createSignal(-1);

  function moveDown() {
    const entries = visibleEntries();
    if (entries.length === 0) return;
    setSelectedIndex((i) => (i + 1) % entries.length);
  }

  function moveUp() {
    const entries = visibleEntries();
    if (entries.length === 0) return;
    setSelectedIndex((i) => (i <= 0 ? entries.length - 1 : i - 1));
  }

  function resetSelection() {
    setSelectedIndex(-1);
  }

  const selectedEntry = () => {
    const entries = visibleEntries();
    const idx = selectedIndex();
    return idx >= 0 && idx < entries.length ? entries[idx] : null;
  };

  function confirmSelection() {
    const entry = selectedEntry();
    if (!entry) return;
    if (entry.type === "section") {
      toggleSection(entry.section);
      return;
    }
    options.onSelect?.(entry);
    if (search()) {
      updateSearch("");
      resetSelection();
    } else {
      toggle();
    }
  }

  return {
    open,
    search,
    setSearch: updateSearch,
    toggle,
    toggleSection,
    filteredSections,
    isExpanded,
    setDialogRef,
    setSearchRef,
    selectedIndex,
    selectedEntry,
    visibleEntries,
    moveDown,
    moveUp,
    resetSelection,
    confirmSelection,
  };
}
