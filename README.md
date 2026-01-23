# Aboard

A kanban-style board application designed to help you focus on what matters. Organize your tasks, visualize your workflow, and maintain focus on your priorities.

## Features

- **Kanban Board** - Visualize your workflow with drag-and-drop columns
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Clean UI** - Distraction-free interface for maximum focus
- **Fast Performance** - Built with Astro for lightning-fast load times
- **Tailwind CSS** - Modern styling with utility-first CSS

## Tech Stack

- **Astro** - Static site generation framework
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Vitest** - Unit testing framework
- **Biome** - Code linter and formatter
- **Lefthook** - Git hooks manager

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Your favorite code editor

### Installation

```sh
bun install
```

### Development

Start the development server:

```sh
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Building

Build for production:

```sh
bun run build
```

Preview the production build:

```sh
bun run preview
```

## Commands

| Command            | Action                                       |
| ------------------ | -------------------------------------------- |
| `bun run dev`      | Start development server at `localhost:4321` |
| `bun run build`    | Build for production to `./dist/`            |
| `bun run preview`  | Preview production build locally             |
| `bun run lint`     | Lint and fix code with Biome                 |
| `bun run lint:fix` | Check and fix code issues                    |
| `bun run test`     | Run unit tests with Vitest                   |
| `bun run test:ui`  | Run tests with visual UI dashboard           |

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images and SVGs
│   ├── components/     # Astro components
│   ├── layouts/        # Layout components
│   ├── pages/          # Route pages
│   └── styles/         # Global styles
├── vitest.config.ts    # Vitest configuration
├── lefthook.yml        # Git hooks configuration
└── package.json        # Dependencies and scripts
```

## Git Hooks

This project uses Lefthook for automated quality checks:

- **pre-commit** - Auto-formats code with Biome
- **pre-push** - Runs linting and tests before pushing

## Testing

Run tests with Vitest:

```sh
# Run all tests
bun run test

# Run tests with UI dashboard
bun run test:ui

# Run tests in watch mode
bun run test -- --watch
```

## Code Quality

Maintain code quality with Biome:

```sh
# Lint and auto-fix
bun run lint

# Check for issues
bun run lint:fix
```

## Contributing

Contributions are welcome! Please ensure:

1. Code passes linting (`bun run lint`)
2. All tests pass (`bun run test`)
3. Commit messages are clear and descriptive

## License

MIT - Feel free to use this project for personal or commercial purposes.

## Learn More

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vitest Documentation](https://vitest.dev)
