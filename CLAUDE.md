# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run Next.js ESLint

## Project Architecture

This is a Next.js 14 project built with TypeScript, using the App Router architecture. The application is a fantasy football dashboard called "The National Freedom League".

### Key Technologies

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom design system
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist (variable fonts)
- **State Management**: React hooks (useState, useRef)
- **Form Handling**: React Hook Form with Zod validation
- **Canvas/Image**: html2canvas for sharing functionality

### Project Structure

- `app/` - Next.js app router pages and layout
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Main dashboard page (fantasy football standings)
  - `globals.css` - Global styles and CSS variables
- `components/ui/` - shadcn/ui component library
- `lib/utils.ts` - Utility functions (cn function for className merging)

### Component Patterns

The main page component (`app/page.tsx`) is a comprehensive fantasy football dashboard that demonstrates:
- Complex state management with multiple useState hooks
- Responsive design patterns (desktop table, mobile cards)
- Data visualization (sparklines, trends, gradients)
- Modal dialogs and sharing functionality
- Accessibility features (ARIA labels, keyboard navigation)
- Loading and error states

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