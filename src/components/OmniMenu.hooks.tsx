import { createSignal } from "solid-js";

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

export type OmniMenuState = ReturnType<typeof useOmniMenu>;

export function useOmniMenu() {
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
      searchRef?.focus();
    }
  }

  function toggleSection(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key as Key] }));
  }

  const filteredSections = () => {
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
  };

  const isExpanded = (key: string) => {
    const { matchedKeys } = filteredSections();
    if (matchedKeys.size > 0) return matchedKeys.has(key as Key);
    return !!expanded()[key as Key];
  };

  return {
    open,
    search,
    setSearch,
    toggle,
    toggleSection,
    filteredSections,
    isExpanded,
    setDialogRef,
    setSearchRef,
  };
}
