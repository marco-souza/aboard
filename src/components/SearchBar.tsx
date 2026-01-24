export default function SearchBar() {
  return (
    <div class="flex itens-center py-0">
      <label class="input rounded-full mx-auto">
        <svg
          role="img"
          aria-label="Search Icon"
          class="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>

        <input
          type="search"
          class="grow"
          placeholder="Filter these cards [F]"
        />

        <kbd class="kbd kbd-sm">⌘</kbd>
        <kbd class="kbd kbd-sm">K</kbd>
      </label>

      {/* TODO: Menu */}
    </div>
  );
}
