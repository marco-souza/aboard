import { For, Show } from "solid-js";

import type { Card, Lane } from "~/domain/board/schema";

import {
  type BoardViewState,
  type CardCreationState,
  formatDate,
  useCardCreation,
  useBoardView,
} from "./hooks";

function LaneControlCard(props: {
  onCreateCard: () => void;
  visibleWatchers: BoardViewState["visibleWatchers"];
  hiddenWatcherCount: number;
}) {
  return (
    <div class="card bg-base-200 border border-base-300 shadow-sm">
      <div class="card-body gap-4">
        <div class="flex justify-center">
          <button
            type="button"
            class="btn btn-primary rounded-full btn-sm gap-2 px-4"
            onClick={props.onCreateCard}
          >
            Create Card
            <kbd class="kbd kbd-xs bg-primary-content/20 text-primary-content border-primary-content/30">
              C
            </kbd>
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold text-center">
            Watching for new cards
          </p>
          <div class="divider my-0" />
          <div class="flex justify-center -space-x-2">
            <For each={[...props.visibleWatchers]}>
              {(watcher) => (
                <div
                  class={`avatar placeholder ${watcher.bg} w-8 h-8 rounded-full ring-2 ring-base-200 flex items-center justify-center`}
                >
                  <span class={`text-[10px] font-bold ${watcher.text}`}>
                    {watcher.initials}
                  </span>
                </div>
              )}
            </For>
            <Show when={props.hiddenWatcherCount > 0}>
              <div class="avatar placeholder bg-base-300 w-8 h-8 rounded-full ring-2 ring-base-200 flex items-center justify-center">
                <span class="text-[10px] font-bold">
                  +{props.hiddenWatcherCount}
                </span>
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

function CardCreationForm(props: { creation: CardCreationState }) {
  const { creation } = props;
  return (
    <form
      onSubmit={creation.submitCard}
      class="card card-compact bg-base-100 border border-base-300 shadow-sm"
    >
      <div class="card-body gap-2">
        <input
          ref={creation.setInputRef}
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Card title..."
          value={creation.newTitle()}
          onInput={(e) => creation.setNewTitle(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") creation.cancelCreate();
          }}
        />
        <div class="flex gap-2 justify-end">
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            onClick={creation.cancelCreate}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-xs"
            disabled={!creation.canSubmit()}
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}

function CardItem(props: { card: Card }) {
  return (
    <div class="card card-compact bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-2">
        <h2 class="card-title text-sm">{props.card.title}</h2>

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
  view: BoardViewState;
}) {
  const creation = useCardCreation(props.view.store, () => props.lane.id);

  return (
    <div class="h-full max-w-96 flex-1 flex flex-col">
      <div class="uppercase tracking-widest text-xs text-center font-bold mb-4">
        {props.lane.title}
      </div>

      <div class="flex flex-col gap-4 flex-1 overflow-y-auto">
        <Show when={props.isDefault}>
          <LaneControlCard
            onCreateCard={creation.startCreate}
            visibleWatchers={props.view.visibleWatchers}
            hiddenWatcherCount={props.view.hiddenWatcherCount}
          />

          <Show when={creation.creating()}>
            <CardCreationForm creation={creation} />
          </Show>
        </Show>

        <For each={props.cards}>{(card) => <CardItem card={card} />}</For>
      </div>
    </div>
  );
}

function CollapsedLane(props: { lane: Lane; count: number }) {
  return (
    <div class="h-full flex flex-col items-center gap-4 min-w-[60px]">
      <div class="bg-base-200 border border-base-300 rounded-full w-10 h-10 flex items-center justify-center mb-4 text-xs font-bold shadow-inner">
        {props.count}
      </div>

      <div class="writing-vertical-rl rotate-90 uppercase tracking-widest text-xs font-bold text-base-content/40 whitespace-nowrap">
        {props.lane.title}
      </div>
    </div>
  );
}

export default function BoardView(props: { title: string }) {
  const view = useBoardView(props.title);

  return (
    <div class="flex-1 w-full h-full p-4 overflow-auto">
      <div class="flex items-center justify-center gap-4 h-full max-w-7xl mx-auto">
        <For each={view.lanes()}>
          {(lane) => {
            const cards = () => view.laneCards(lane.id);
            const isDefault = () => view.isDefaultLane(lane.id);

            return (
              <Show
                when={isDefault()}
                fallback={<CollapsedLane lane={lane} count={cards().length} />}
              >
                <ExpandedLane
                  lane={lane}
                  cards={cards()}
                  isDefault={isDefault()}
                  view={view}
                />
              </Show>
            );
          }}
        </For>
      </div>
    </div>
  );
}
