# ISPGram - Copilot Instructions

## Project Overview
ISPGram is a Next.js 16 (App Router) full-stack Education Week activity platform for De Anza College's ISP program. Students submit photo entries, vote with hearts, and see real-time leaderboards.

**Core Pattern**: One student → One entry → Multiple votes (with unique constraint per entry)

## Tech Stack Specifics
- **Next.js 16** with React 19 + Babel React Compiler enabled (`reactCompiler: true`)
- **pnpm** package manager (use `pnpm` commands, never `npm`)
- **TypeScript** with `@/*` path aliases (e.g., `@/lib/utils`)
- **Prisma ORM** with PostgreSQL (Neon recommended)
- **Clerk** for authentication (server actions use `auth()` from `@clerk/nextjs/server`)
- **Vercel Blob** for image storage (use `put()` from `@vercel/blob`)
- **Tailwind CSS v4** with shadcn/ui components + custom `bg-linear-to-r/bg-linear-to-br` utility patterns
- **Custom fonts**: Plus Jakarta Sans (UI) + DM Mono (code) via `/lib/fonts.ts`

## Critical Architecture Patterns

### Authentication Flow
- All API routes use `const { userId } = await auth()` from Clerk server SDK
- Student records link via `clerkId` (unique) + required `studentId` (De Anza 8-digit ID)
- Use `getOrCreateStudent()` helper from `/lib/db.ts` to sync Clerk → Prisma
- Protected routes require checking `userId` existence (401 if missing)
- **Note**: No `middleware.ts` exists—auth checks are inline in API routes

### Database Constraints (Critical!)
1. **One entry per student**: `Entry.studentId` is `@unique` (check before POST)
2. **One vote per student per entry**: `@@unique([studentId, entryId])` constraint
3. **Cascade deletes**: Deleting student removes entries + votes (`onDelete: Cascade`)
4. **Student ID validation**: Must be exactly 8 numeric digits (`/^\d{8}$/`)

### Data Fetching Patterns
- **Custom hooks** for client data: `useEntries()`, `useVotes()`, `useStudent()` (all in `/hooks/`)
- **Server helpers** in `/lib/db.ts`: `getEntriesWithVotes()`, `getEntryById()`, `getStudentByClerkId()`
- Always include vote counts: `entry.votes.length` mapped to `voteCount` field
- Entries ordered by `createdAt: 'desc'` (newest first)

### API Route Patterns
```typescript
// Standard response pattern (see /app/api/entries/route.ts)
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json()
  // Validate, get student via getOrCreateStudent(), perform action
  return NextResponse.json(data)
}
```

### Image Upload Workflow (Critical Path)
1. Client validates file: JPEG/PNG only, max 5MB, NO `.heic` support (explicitly rejected)
2. POST to `/api/upload` with `FormData` containing file
3. **NSFW Detection** (Improved Model - Oct 2025):
   - **Primary**: Uses Hugging Face API if `HUGGINGFACE_API_KEY` is set (96-98% accuracy)
   - **Fallback**: Local NSFWJS model with improved thresholds (92-95% accuracy)
   - **Thresholds**: Porn: 50%, Hentai: 55%, Sexy: 65% (stricter than default)
   - **Multi-pass validation**: Checks multiple criteria + safe content score
   - Implementation: `/lib/nsfw-filter-improved.ts`
   - Blocks images classified as Porn, Sexy, or Hentai above thresholds
   - Returns detailed error with category, confidence, and all scores
   - Logs all results (approved and rejected) with detection method used
4. Vercel Blob stores with path: `education-week/${userId}-${Date.now()}.jpg`
5. Returns `{ url: blob.url }` for use in entry creation
6. Next.js Image component uses `remotePatterns` for `vercel-storage.com` domain

### Optimistic UI Updates
- **Vote buttons** (see `/components/vote-button.tsx`): Immediately update local state, revert on error
- Use `useState` for `voteCount` and `voted` state with try/catch rollback
- Example: Toggle vote → update UI → call API → revert if failed

## Database Scripts (pnpm)
```bash
pnpm db:push        # Push schema changes (no migration)
pnpm db:migrate     # Create + run migration
pnpm db:generate    # Generate Prisma Client (auto on postinstall)
pnpm db:studio      # Open Prisma Studio GUI
pnpm db:seed        # Run seed.js (if needed)
```

## Component Architecture

### shadcn/ui Conventions
- Components in `/components/ui/` are generated via shadcn CLI (don't manually create)
- Use `cn()` utility from `/lib/utils.ts` for className merging
- Variants via `class-variance-authority` (see `button.tsx` for pattern)
- All UI components use `data-slot` attributes for debugging

### Custom Components
- **EntryCard** (`/components/entry-card.tsx`): Displays entry with rank medals (🥇🥈🥉), vote button, optimistic updates
- **VoteButton**: Handles toggle voting with loading/disabled states, heart fill animation
- **MobileNav** (`/components/mobile-nav.tsx`): Bottom navigation with glassmorphism, gradient accents, safe area padding
- **Leaderboard**: Shows top entries sorted by `voteCount` descending

## Styling Conventions
- **Education Week theme**: Sky/indigo gradients (`from-sky-50 via-indigo-50 to-slate-50`)
- **Custom gradient utilities**: `bg-linear-to-r`, `bg-linear-to-br` (not standard Tailwind)
- **Responsive breakpoints**: Mobile-first, hide desktop nav with `md:hidden`, show mobile nav only below `md`
- **Safe area support**: Use `env(safe-area-inset-bottom)` for iOS notch/home indicator
- **Animations**: `hover:scale-105`, `active:scale-95` for interactive elements

## Environment Variables (Required)
```env
DATABASE_URL                         # PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    # Clerk public key
CLERK_SECRET_KEY                     # Clerk secret (server-only)
BLOB_READ_WRITE_TOKEN                # Vercel Blob token
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
HUGGINGFACE_API_KEY                  # Optional: HF API for 96-98% NSFW accuracy (free tier available)
```

## Common Development Tasks

### Adding a New API Endpoint
1. Create `/app/api/[name]/route.ts`
2. Import `auth()` from `@clerk/nextjs/server` and `prisma` from `@/lib/prisma`
3. Export async `GET`/`POST`/`PATCH`/`DELETE` functions
4. Always check `userId` existence first (return 401 if missing)
5. Use `NextResponse.json()` for responses
6. Handle errors with try/catch and 500 status

### Modifying Prisma Schema
1. Edit `/prisma/schema.prisma`
2. Run `pnpm db:push` (dev) or `pnpm db:migrate` (production)
3. Restart dev server to pick up new Prisma types
4. Update TypeScript interfaces in `/hooks/` or `/lib/db.ts` as needed

### Adding shadcn/ui Component
1. Install if missing: `npx shadcn@latest add [component-name]`
2. Component appears in `/components/ui/`
3. Import and use: `import { Button } from '@/components/ui/button'`

## Testing & Debugging
- **Prisma Studio**: `pnpm db:studio` to inspect DB visually
- **API Testing**: Use browser DevTools Network tab or `curl`/Postman
- **Clerk Testing**: Use Clerk Dashboard to manage test users
- **Image Upload**: Verify `remotePatterns` in `next.config.ts` match Vercel Blob hostname

## Known Quirks & Gotchas
1. **No `.heic` support**: iOS users must change camera settings to JPEG (explicitly documented in UI)
2. **NSFW filtering** (Improved Model - Oct 2025):
   - All uploaded images analyzed with TensorFlow.js or Hugging Face before storage
   - **Improved accuracy**: 92-95% (local) or 96-98% (with HF API key)
   - **Stricter thresholds**: Porn 50%, Hentai 55%, Sexy 65%
   - **Multi-criteria validation**: Checks safe content score + multiple conditions
   - Inappropriate content blocked with detailed error messages
   - See `/docs/NSFW_MODELS_2025.md` for model comparison
3. **Student ID is immutable**: After first entry, cannot change 8-digit student ID (update logic exists but constrained)
4. **One entry limit**: Students cannot submit multiple entries (UI blocks after first submission)
5. **Vote on own entry**: Allowed (students can heart their own submissions)
6. **Font loading**: Uses Next.js `next/font/google`, CSS variables in `/lib/fonts.ts`, applied in `layout.tsx`
7. **NSFW model loading**: First upload after server restart may take 2-3 seconds longer due to model initialization
8. **HF API enhancement**: Adding `HUGGINGFACE_API_KEY` enables cloud-based detection with highest accuracy (optional but recommended)

## Documentation References
- **Mobile Nav**: `/docs/MOBILE_NAV.md`, `/docs/MOBILE_NAV_VISUAL.md`
- **Profile Editing**: `/docs/EDIT_PROFILE.md`, `/docs/EDIT_PROFILE_VISUAL.md`
- **Font System**: `/docs/FONTS.md` + `/lib/fonts.examples.ts`
- **Feature Checklist**: `/docs/CHECKLIST.md`

## When Making Changes
<!-- - **Database changes**: Always run `pnpm db:push` after schema edits -->
- **Component changes**: Restart dev server if Next.js cache issues appear
- **API changes**: Test both authenticated and unauthenticated flows
- **UI changes**: Verify mobile responsive behavior (use DevTools mobile view)
- **Image changes**: Ensure Vercel Blob URLs work in production (check `remotePatterns`)





Don't use "npm run dev" or other command to run website, i don't need that, instead just run lint error check

Don't ever do ```npx prisma db push``` command, YOU MUST NOT DO THAT or mess with database related migrations



!!! YOU MUST KEEP DATABASE SAFE !!!

LLM System Prompt: Command Execution Safety Protocol
You are a highly capable AI assistant with access to a shell or command-line interface. Your primary directive is to assist the user while ensuring the absolute safety and integrity of their system, data, and code. You must operate under the following strict set of safety protocols and blacklisted command patterns. These rules are non-negotiable.

<DatabaseOperations>
This category prevents you from wiping, resetting, or destructively altering any database schema or data.

Schema & Migration Commands:

* db:push (e.g., npm run db:push, npx prisma db push)

* db:reset

* migrate:reset

* migrate:rollback

* schema:drop

* db:drop

Direct Database CLI Commands:

mysql * --execute="DROP *"

psql * --command="DROP *"

psql * --command="TRUNCATE *"

sqlite3 * "DROP *"

mongo * --eval "db.dropDatabase()"

redis-cli FLUSHALL

redis-cli FLUSHDB
</DatabaseOperations>

<VersionControl>
This category prevents you from losing commit history, force-pushing over team members' work, or deleting branches.

History Alteration & Force Pushes:

git push --force

git push --force-with-lease

git reset --hard *

Data Deletion:

git clean -fdx

git clean -f

Branch & Tag Deletion:

git branch -D *

git push * --delete *

git tag -d *

git push origin :<branch_name>

History Rewriting:

git rebase *

git filter-branch *

git commit --amend
</VersionControl>

<PackageManagement>
This category prevents you from publishing packages, altering global configurations, or managing user authentication for package registries.

npm publish

yarn publish

npm unpublish *

npm owner add/rm *

npm adduser / npm login

npm logout

npm config delete *
</PackageManagement>

<FilesystemOperations>
This category prevents the deletion or destructive modification of source code, environment files, or other critical system files.

Recursive & Wildcard Deletion:

rm -rf *

rm -r *

find . -delete

Overwriting Critical Files:

> .env

> *config.json

mv * .env

Moving Core Directories:

mv node_modules/* *

mv .git/* *
</FilesystemOperations>

<CloudInfrastructureDeployment>
This category prevents you from destroying cloud resources, running up huge bills, or deploying untested code to production environments.

Infrastructure as Code:

terraform destroy

pulumi destroy

Cloud Provider CLIs:

aws * terminate-*

aws * delete-*

aws * remove-*

gcloud * delete

gcloud * disable

az * delete

Deployment Scripts:

sls remove / serverless remove

Any script with :prod or :production suffix (e.g., npm run deploy:prod)
</CloudInfrastructureDeployment>

<SystemPermissionsSecrets>
This category prevents you from escalating privileges, changing file permissions insecurely, or exposing sensitive secrets.

Privilege Escalation:

sudo *

su

Permissions & Ownership:

chmod -R *

chown -R *

Exposing Secrets:

cat .env

printenv

cat ~/.ssh/id_rsa

cat ~/.aws/credentials

history

System Commands:

shutdown

reboot

halt

kill *

pkill *
</SystemPermissionsSecrets>

<CoreSafetyPrinciples>
Beyond specific commands, you must adhere to these guiding principles.

Confirmation First: For any action that modifies the filesystem, network state, or system configuration (even if not explicitly blacklisted), you must first state the exact command you intend to run and ask the user for explicit confirmation (y/n) before proceeding.

Assume Least Privilege: Operate as if you are in a sandboxed environment. Do not attempt actions that require elevated permissions.

Prioritize Reversibility: When possible, prefer non-destructive commands over destructive ones. For example, favor renaming a file (mv old new) over deleting it (rm old).
</CoreSafetyPrinciples>

Final Instruction: If a user requests a command that matches or resembles any pattern on this blacklist, you must refuse and explain that the action is restricted for safety reasons. Prioritize data integrity and system stability above all else.
