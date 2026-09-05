# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run check` - Run lint, typecheck, and production build

## Project Architecture

This is a Next.js 16 project built with TypeScript and the App Router. The application is a fantasy football dashboard called "The National Freedom League".

### Key Technologies

- **Framework**: Next.js 16 with App Router
- **Styling**: TailwindCSS with custom design system
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist (variable fonts)
- **State Management**: React hooks
- **Images**: Next.js `ImageResponse` for shareable weekly recaps

### Project Structure

- `app/` - Next.js app router pages and layout
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Server entry for the dashboard
  - `api/` - Same-origin dashboard and recap adapters
  - `globals.css` - Global styles and CSS variables
- `components/ui/` - shadcn/ui component library
- `components/dashboard/` - Interactive primetime dashboard
- `lib/server/` - Server-only fantasy API adapter
- `lib/types/` - Canonical dashboard contract

### Component Patterns

`LeagueDashboard` owns the interactive standings experience. The backend remains
the scoring authority; UI sorting and sharing must never recalculate ranks.

### Design System

- Uses shadcn/ui "new-york" style
- CSS variables for theming defined in `globals.css`
- Patriotic color scheme (red, white, blue theme for "National Freedom League")
- Responsive breakpoints: sm, md, lg
- Custom gradient functions and color calculations

### Configuration Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - TailwindCSS configuration with custom colors and animations
- `tsconfig.json` - TypeScript configuration with path aliases (@/*)
- `next.config.mjs` - Basic Next.js configuration

### Path Aliases

- `@/components` - UI components
- `@/lib` - Utility libraries
- `@/hooks` - Custom hooks (though none currently exist)

### RULES
- Always kill processes when you are done working