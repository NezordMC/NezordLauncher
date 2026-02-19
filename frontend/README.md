# React + Vite + Shadcn UI Template

A modern, performance-oriented React template built with **Vite**, **Tailwind CSS v4**, and **Shadcn UI**. This template comes pre-configured with the latest **React Compiler** for automatic memoization and optimal performance.

![License](https://img.shields.io/github/license/Drenzzz/react-vite-shadcnui-template?color=blue) ![React](https://img.shields.io/npm/v/react?logo=react&logoColor=white&label=react&color=087ea4) ![Vite](https://img.shields.io/npm/v/vite?logo=vite&logoColor=white&label=vite&color=646CFF) ![Tailwind CSS](https://img.shields.io/npm/v/tailwindcss?logo=tailwindcss&logoColor=white&label=tailwindcss&color=38B2AC)

## Features

- **[React 19](https://react.dev/)**: The latest version of React with advanced features.
- **[Vite 7](https://vitejs.dev/)**: Blazing fast build tool and development server.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: The latest utility-first CSS framework with the new Oxyge engine.
- **[Shadcn UI](https://ui.shadcn.com/)**: Beautifully designed components built with Radix UI and Tailwind CSS.
- **[React Compiler](https://react.dev/learn/react-compiler)**: Automatic memoization (no more manual `useMemo` or `useCallback`).
- **Path Aliases**: Clean imports using `@/` (e.g., `import { Button } from "@/components/ui/button"`).
- **Dependabot**: Automated dependency updates pre-configured.
- **ESLint**: Linting optimized for React 19 and Vite.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm/yarn

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Drenzzz/react-vite-shadcnui-template.git
    cd react-vite-shadcnui-template
    ```

    Or use this template to create a new repository:
    [Use this template](https://github.com/Drenzzz/react-vite-shadcnui-template/generate)

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Start development server**

    ```bash
    pnpm dev
    ```

## Usage

### Adding Components

This template is configured with `components.json`. You can add Shadcn components using the CLI:

```bash
npx shadcn@latest add button
```

or if you have pnpm:

```bash
pnpm dlx shadcn@latest add button
```

### Path Aliases

Use the `@` alias to import files from the `src` directory:

```tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### React Compiler

The `babel-plugin-react-compiler` is enabled by default in `vite.config.ts`. You don't need to do anything extra; just write standard React code and let the compiler handle memoization!

## Project Structure

```
├── .github/              # GitHub Actions & Dependabot
├── public/               # Static assets
├── src/
│   ├── components/       # UI components (Shadcn & others)
│   │   └── ui/           # Shadcn primitive components
│   ├── lib/              # Utility functions (cn, etc.)
│   ├── App.tsx           # Main application component
│   ├── index.css         # Global styles & Tailwind directives
│   └── main.tsx          # Entry point
├── components.json       # Shadcn CLI configuration
├── eslint.config.js      # ESLint configuration
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite & React Compiler configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
