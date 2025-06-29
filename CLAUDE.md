# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:check` - Run ESLint without auto-fix
- `npm run type-check` - Run TypeScript compiler check (use this to verify types before committing)

### Testing & Analysis
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run analyze` - Analyze bundle size with webpack-bundle-analyzer

### Maintenance
- `npm run clean` - Remove .next and out directories
- `npm run postbuild` - Generate sitemap (runs automatically after build)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode enabled
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Styling**: Tailwind CSS with custom components (@tailwindcss/typography, @tailwindcss/forms, @tailwindcss/aspect-ratio)
- **UI Components**: Custom components with class-variance-authority for variants
- **Icons**: Lucide React
- **Carousel**: Swiper.js
- **Markdown**: react-markdown with remark-gfm for GitHub-flavored markdown
- **Testing**: Jest with React Testing Library

### Project Structure
- `/src/app/` - Next.js 14 App Router pages and layouts
- `/src/components/` - Reusable React components (many have Client/Wrapper patterns)
- `/src/lib/` - Utilities, Supabase clients, and helper functions
- `/src/types/` - TypeScript type definitions
- `/src/config/` - Global configuration constants
- `/src/contexts/` - React contexts (Auth, etc.)
- `/src/utils/` - Utility functions for dates, images, etc.

### Key Architectural Patterns

#### Supabase Integration
- **Client Setup**: Uses both SSR client (`/src/lib/supabase/client.ts`) and singleton client (`/src/lib/supabaseClient.ts`)
- **Type Safety**: Database types are defined in `/src/lib/supabaseClient.ts` with complete table schemas
- **Auth**: Managed through `/src/contexts/AuthContext.tsx` with `useUser()` and `useAuthStatus()` hooks

#### Component Architecture
- **Client/Wrapper Pattern**: Many components use `ComponentName` + `ComponentNameWrapper` pattern to separate client and server concerns
- **Loading States**: Extensive use of `LoadingSkeleton.tsx` for better UX
- **Error Boundaries**: `ErrorBoundary.tsx` for graceful error handling

#### Data Management
- **Articles**: Central entity with slug-based routing, supports multiple image formats
- **Reactions**: 5-type reaction system (likes, sads, angrys, surpriseds, uneasys)
- **Comments**: Nested comment system with real-time updates
- **Sources**: Configurable source types in `/src/config/index.ts` with display names, icons, and categories

### Environment Variables Required
- `NEXT_PUBLIC_SITE_URL` - Site base URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_ADSENSE_CLIENT` - Google AdSense client ID

### Image Handling
- Uses Next.js Image component with optimization
- Supports Supabase Storage, Unsplash, Pexels, Cloudinary
- WebP/AVIF format conversion enabled
- 24-hour cache TTL configured

### SEO & Performance
- Comprehensive SEO setup in `/src/app/layout.tsx` with OpenGraph, Twitter Cards, JSON-LD
- ISR (Incremental Static Regeneration) with revalidation periods in `/src/config/index.ts`
- Bundle optimization for lucide-react and swiper
- DNS prefetching for external resources

### API Routes
- `/src/app/api/articles/route.ts` - Article management API with bearer token auth
- Uses Next.js 14 App Router API format

### Important Development Notes
- **Node.js Requirements**: Node >=18.0.0, npm >=8.0.0
- TypeScript is configured with strict mode and additional strict options (`noUnusedLocals`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`)
- ESLint errors are ignored during builds (see next.config.js)
- Uses Korean language content (ko-KR locale)
- Implements comprehensive security headers and CSP
- AdSense integration is built-in with auto-ads
- **Project Name**: my7-policy-support (government policy & support programs information platform)
- **Path Aliases**: Configured for clean imports (`@/` for src/, `@/components/`, `@/lib/`, etc.)
- **URL Rewrites**: Legacy `/news/` and `/posts/` routes redirect to `/article/` for SEO

### Database Schema
Key tables:
- `articles` - Main content with slug, title, body, image_url (can be string or array), source, category (adapted for policy/support content)
- `reporters` - Author information (policy writers/government officials)
- `reactions` - Article reactions with 5 types
- `comments` - Comment system

### Component Conventions
- Client components marked with 'use client' directive
- Wrapper components handle server-side logic
- Loading skeletons for all async operations
- Error boundaries for graceful failure handling
- Consistent naming: ComponentName + ComponentNameClient/Wrapper pattern

### Critical Development Rules
- **Always run `npm run type-check` before committing** - TypeScript strict mode with additional checks
- Build errors are ignored in next.config.js but should be fixed in development
- Korean language content (ko-KR locale) is the primary language
- Never commit environment files - use .env.local for local development
- Supabase client uses singleton pattern for performance optimization

### Path Aliases (configured in tsconfig.json)
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/types/*` → `./src/types/*`
- `@/config/*` → `./src/config/*`
- `@/utils/*` → `./src/utils/*`

### Image Optimization
- Next.js Image component with WebP/AVIF formats
- Supports: Supabase Storage, Unsplash, Pexels, Cloudinary, Dicebear
- 24-hour cache TTL configured
- Security: SVG sanitization enabled

### Performance Features
- Bundle optimization for lucide-react and swiper
- ISR with configurable revalidation periods in `/src/config/index.ts`
- Comprehensive security headers and CSP
- DNS prefetching for external resources