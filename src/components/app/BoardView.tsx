import { createSignal, For, Show } from "solid-js";
import type { Card, Lane } from "~/domain/board/schema";
import { type BoardStore, useBoardStore } from "~/stores/board.store";

const MAX_VISIBLE_AVATARS = 7;

const MOCK_WATCHERS = [
  { initials: "JS", color: "bg-primary" },
  { initials: "AL", color: "bg-secondary" },
  { initials: "MK", color: "bg-accent" },
  { initials: "RD", color: "bg-info" },
  { initials: "TP", color: "bg-success" },
  { initials: "LN", color: "bg-warning" },
  { initials: "CB", color: "bg-error" },
  { initials: "FG", color: "bg-primary" },
  { initials: "HJ", color: "bg-secondary" },
  { initials: "WX", color: "bg-accent" },
  { initials: "YZ", color: "bg-info" },
  { initials: "QR", color: "bg-success" },
  { initials: "ST", color: "bg-warning" },
  { initials: "UV", color: "bg-error" },
  { initials: "KL", color: "bg-primary" },
  { initials: "MN", color: "bg-secondary" },
  { initials: "OP", color: "bg-accent" },
];

function LaneControlCard(props: { onCreateCard: () => void }) {
  const visible = MOCK_WATCHERS.slice(0, MAX_VISIBLE_AVATARS);
  const hiddenCount = MOCK_WATCHERS.length - MAX_VISIBLE_AVATARS;

  return (
    <div class="card card-compact bg-base-200 border border-base-300 shadow-sm">
      <div class="card-body gap-4">
        <div class="flex justify-center">
          <button
            type="button"
            class="btn btn-primary btn-sm gap-2"
            onClick={props.onCreateCard}
          >
            Create Card
            <kbd class="kbd kbd-xs">C</kbd>
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold text-center">
            Watching for new cards
          </p>
          <div class="divider my-0" />
          <div class="flex justify-center -space-x-2">
            <For each={visible}>
              {(watcher) => (
                <div
                  class={`avatar placeholder ${watcher.color} w-8 h-8 rounded-full ring-2 ring-base-200 flex items-center justify-center`}
                >
                  <span class="text-[10px] text-white font-bold">
                    {watcher.initials}
                  </span>
                </div>
              )}
            </For>
            <Show when={hiddenCount > 0}>
              <div class="avatar placeholder bg-base-300 w-8 h-8 rounded-full ring-2 ring-base-200 flex items-center justify-center">
                <span class="text-[10px] font-bold">+{hiddenCount}</span>
              </div>
            </Show>
          </div>
        </div>

        <div class="flex justify-center">
          <button
            type="button"
            class="btn btn-ghost btn-sm uppercase tracking-wider opacity-60 gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <title>Stop watching</title>
              <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
              <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
              <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
              <path d="m2 2 20 20" />
            </svg>
            Stop Watching
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CardItem(props: { card: Card; onRemove: (id: string) => void }) {
  return (
    <div class="card card-compact bg-base-100 shadow-sm group">
      <div class="card-body gap-2">
        <div class="flex items-start justify-between gap-2">
          <h2 class="card-title text-sm">{props.card.title}</h2>
          <button
            type="button"
            class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => props.onRemove(props.card.id)}
            aria-label="Remove card"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <title>Remove</title>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <Show when={props.card.description}>
          <p class="text-xs opacity-60">{props.card.description}</p>
        </Show>

        <Show when={props.card.assignee}>
          {(assignee) => (
            <div class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-5 h-5 rounded-full">
                  <img src={assignee().avatar} alt={assignee().name} />
                </div>
              </div>
              <span class="text-xs font-medium truncate">
                {assignee().name}
              </span>
            </div>
          )}
        </Show>

        <div class="flex items-center gap-3 text-[10px] opacity-40 mt-1">
          <span title="Created at">
            Created {formatDate(props.card.createdAt)}
          </span>
          <span title="Updated at">
            Updated {formatDate(props.card.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ExpandedLane(props: {
  lane: Lane;
  cards: Card[];
  isDefault: boolean;
  store: BoardStore;
}) {
  let inputRef!: HTMLInputElement;
  const [creating, setCreating] = createSignal(false);
  const [newTitle, setNewTitle] = createSignal("");

  function startCreate() {
    setCreating(true);
    setNewTitle("");
    queueMicrotask(() => inputRef?.focus());
  }

  function submitCard(e: Event) {
    e.preventDefault();
    const value = newTitle().trim();
    if (!value) return;

    props.store.addCard(props.lane.id, value);
    setNewTitle("");
    setCreating(false);
  }

  function cancelCreate() {
    setCreating(false);
    setNewTitle("");
  }

  return (
    <div class="h-full max-w-96 flex-1 flex flex-col">
      <div class="uppercase tracking-widest text-xs text-center font-bold mb-4">
        {props.lane.title}
      </div>

      <div class="flex flex-col gap-4 flex-1 overflow-y-auto">
        <Show when={props.isDefault}>
          <LaneControlCard onCreateCard={startCreate} />

          <Show when={creating()}>
            <form
              onSubmit={submitCard}
              class="card card-compact bg-base-100 shadow-sm"
            >
              <div class="card-body gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  class="input input-bordered input-sm w-full"
                  placeholder="Card title..."
                  value={newTitle()}
                  onInput={(e) => setNewTitle(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelCreate();
                  }}
                />
                <div class="flex gap-2 justify-end">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs"
                    onClick={cancelCreate}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary btn-xs"
                    disabled={!newTitle().trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          </Show>
        </Show>

        <For each={props.cards}>
          {(card) => <CardItem card={card} onRemove={props.store.removeCard} />}
        </For>
      </div>
    </div>
  );
}

function CollapsedLane(props: { lane: Lane; count: number }) {
  return (
    <div class="h-full flex flex-col items-center gap-4 min-w-[60px]">
      <div class="bg-base-200 rounded-full w-10 h-10 flex items-center justify-center mb-4 text-xs font-bold shadow-inner">
        {props.count}
      </div>

      <div class="writing-vertical-rl rotate-90 uppercase tracking-widest text-xs font-bold text-base-content/40 whitespace-nowrap">
        {props.lane.title}
      </div>
    </div>
  );
}

export default function BoardView(props: { title: string }) {
  const store = useBoardStore(props.title);

  return (
    <div class="flex-1 w-full h-full p-4 overflow-auto">
      <div class="flex items-center justify-center gap-4 h-full max-w-7xl mx-auto">
        <For each={store.lanes()}>
          {(lane) => {
            const cards = () => store.cardsInLane(lane.id);
            const isDefault = () => lane.id === store.defaultLaneId();

            return (
              <Show
                when={isDefault()}
                fallback={<CollapsedLane lane={lane} count={cards().length} />}
              >
                <ExpandedLane
                  lane={lane}
                  cards={cards()}
                  isDefault={isDefault()}
                  store={store}
                />
              </Show>
            );
          }}
        </For>
      </div>
    </div>
  );
}
