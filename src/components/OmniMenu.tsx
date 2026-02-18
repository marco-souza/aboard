import { For } from "solid-js";

import { type OmniMenuState, useOmniMenu } from "~/components/OmniMenu.hooks";

function Header() {
  return (
    <div class="flex flex-col items-center px-4 pt-4 pb-2">
      <h3 class="text-lg font-bold">Omni Menu</h3>
    </div>
  );
}

function SearchBar(
  props: Pick<
    OmniMenuState,
    | "search"
    | "setSearch"
    | "setSearchRef"
    | "toggle"
    | "moveDown"
    | "moveUp"
    | "resetSelection"
    | "confirmSelection"
  >,
) {
  return (
    <div class="px-4 pb-3">
      <label class="input input-bordered w-full flex items-center gap-2">
        <svg
          class="h-4 w-4 opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <title>Search</title>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          autofocus
          ref={props.setSearchRef}
          type="text"
          class="grow"
          placeholder="Search commands..."
          value={props.search()}
          onInput={(e) => {
            props.setSearch(e.currentTarget.value);
            props.resetSelection();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              if (props.search()) {
                e.preventDefault();
                e.stopPropagation();
                props.setSearch("");
                props.resetSelection();
              } else {
                props.toggle();
              }
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              props.moveDown();
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              props.moveUp();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              props.confirmSelection();
            }
          }}
        />
      </label>
    </div>
  );
}

function Sections(
  props: Pick<
    OmniMenuState,
    "filteredSections" | "isExpanded" | "toggleSection" | "selectedEntry"
  >,
) {
  return (
    <ul class="menu w-full flex-row px-2 pb-4 max-h-72 overflow-y-auto">
      <For each={props.filteredSections().sections}>
        {(section) => {
          const sectionSelected = () => {
            const sel = props.selectedEntry();
            return sel?.type === "section" && sel.section === section.key;
          };
          return (
            <li class="w-full">
              <button
                type="button"
                class="flex items-center justify-between font-semibold w-full"
                classList={{ "menu-focus": sectionSelected() }}
                onClick={() => props.toggleSection(section.key)}
              >
                <span>
                  {section.icon} {section.label}
                </span>

                <svg
                  class="h-4 w-4 transition-transform"
                  classList={{
                    "rotate-180": props.isExpanded(section.key),
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <title>Toggle section</title>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {props.isExpanded(section.key) && (
                <ul>
                  <For each={section.items}>
                    {(item) => {
                      const selected = () => {
                        const sel = props.selectedEntry();
                        return (
                          sel?.type === "item" &&
                          sel.section === section.key &&
                          sel.item === item
                        );
                      };
                      return (
                        <li>
                          <button
                            type="button"
                            classList={{ "menu-focus": selected() }}
                          >
                            {item}
                          </button>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              )}
            </li>
          );
        }}
      </For>

      {props.filteredSections().sections.length === 0 && (
        <li class="text-center py-4 opacity-50">No results found</li>
      )}
    </ul>
  );
}

export default function OmniMenu() {
  const menu = useOmniMenu({
    onSelect: (entry) => {
      if (entry.type === "item")
        alert(`Selected: ${entry.section} > ${entry.item}`);
    },
  });

  let dialogRef!: HTMLDialogElement;

  return (
    <>
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-square opacity-50 hover:opacity-100"
        onClick={menu.toggle}
        aria-label="Open Omni Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <title>Open menu</title>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <dialog
        ref={(el) => {
          dialogRef = el;
          menu.setDialogRef(el);
        }}
        class="modal"
        onClick={(e) => {
          if (e.target === dialogRef) menu.toggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") menu.toggle();
        }}
      >
        <div class="modal-box w-full max-w-md p-0 overflow-hidden">
          <Header />
          <SearchBar
            search={menu.search}
            setSearch={menu.setSearch}
            setSearchRef={menu.setSearchRef}
            toggle={menu.toggle}
            moveDown={menu.moveDown}
            moveUp={menu.moveUp}
            resetSelection={menu.resetSelection}
            confirmSelection={menu.confirmSelection}
          />
          <Sections
            filteredSections={menu.filteredSections}
            isExpanded={menu.isExpanded}
            toggleSection={menu.toggleSection}
            selectedEntry={menu.selectedEntry}
          />
        </div>
      </dialog>
    </>
  );
}
