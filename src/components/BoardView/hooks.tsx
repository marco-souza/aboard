import { createMemo, createSignal } from "solid-js";

import { type BoardStore, useBoardStore } from "~/stores/board.store";

export const MAX_VISIBLE_AVATARS = 7;

export const MOCK_WATCHERS = [
  { initials: "JS", bg: "bg-primary", text: "text-primary-content" },
  { initials: "AL", bg: "bg-secondary", text: "text-secondary-content" },
  { initials: "MK", bg: "bg-accent", text: "text-accent-content" },
  { initials: "RD", bg: "bg-info", text: "text-info-content" },
  { initials: "TP", bg: "bg-success", text: "text-success-content" },
  { initials: "LN", bg: "bg-warning", text: "text-warning-content" },
  { initials: "CB", bg: "bg-error", text: "text-error-content" },
  { initials: "FG", bg: "bg-primary", text: "text-primary-content" },
  { initials: "HJ", bg: "bg-secondary", text: "text-secondary-content" },
  { initials: "WX", bg: "bg-accent", text: "text-accent-content" },
  { initials: "YZ", bg: "bg-info", text: "text-info-content" },
  { initials: "QR", bg: "bg-success", text: "text-success-content" },
  { initials: "ST", bg: "bg-warning", text: "text-warning-content" },
  { initials: "UV", bg: "bg-error", text: "text-error-content" },
  { initials: "KL", bg: "bg-primary", text: "text-primary-content" },
  { initials: "MN", bg: "bg-secondary", text: "text-secondary-content" },
  { initials: "OP", bg: "bg-accent", text: "text-accent-content" },
] as const;

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type BoardViewState = ReturnType<typeof useBoardView>;

export function useBoardView(title: string) {
  const store = useBoardStore(title);

  const visibleWatchers = MOCK_WATCHERS.slice(0, MAX_VISIBLE_AVATARS);
  const hiddenWatcherCount = MOCK_WATCHERS.length - MAX_VISIBLE_AVATARS;

  function laneCards(laneId: string) {
    return store.cardsInLane(laneId);
  }

  function isDefaultLane(laneId: string) {
    return laneId === store.defaultLaneId();
  }

  return {
    store,
    lanes: store.lanes,
    laneCards,
    isDefaultLane,
    visibleWatchers,
    hiddenWatcherCount,
  };
}

export type CardCreationState = ReturnType<typeof useCardCreation>;

export function useCardCreation(store: BoardStore, laneId: () => string) {
  let inputRef!: HTMLInputElement;
  const [creating, setCreating] = createSignal(false);
  const [newTitle, setNewTitle] = createSignal("");

  function setInputRef(el: HTMLInputElement) {
    inputRef = el;
  }

  function startCreate() {
    setCreating(true);
    setNewTitle("");
    queueMicrotask(() => inputRef?.focus());
  }

  function submitCard(e: Event) {
    e.preventDefault();
    const value = newTitle().trim();
    if (!value) return;

    store.addCard(laneId(), value);
    setNewTitle("");
    setCreating(false);
  }

  function cancelCreate() {
    setCreating(false);
    setNewTitle("");
  }

  function removeCard(cardId: string) {
    store.removeCard(cardId);
  }

  const canSubmit = createMemo(() => newTitle().trim().length > 0);

  return {
    creating,
    newTitle,
    setNewTitle,
    setInputRef,
    startCreate,
    submitCard,
    cancelCreate,
    removeCard,
    canSubmit,
  };
}
