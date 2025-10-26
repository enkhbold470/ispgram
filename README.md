# 🎓 ISPGram - Education Week Activity Hub

A full-stack Education Week activity platform built for De Anza College's ISP program. International students can share their favorite highlights, cheer for one another, and track the friendly leaderboard presented by the De Anza ISP Office.

## ✨ Features

- **Entry Sharing**: Upload Education Week photos with captions
- **Cheer System**: Send hearts to multiple highlights and celebrate peers
- **Friendly Leaderboard**: Real-time rankings with top 3 highlighting
- **Student Authentication**: Secure sign-in with Clerk
- **Photo Storage**: Vercel Blob for reliable image hosting
- **Email Notifications**: Winner notifications via Zoho email
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **File Storage**: Vercel Blob
- **Email**: Zoho ZeptoMail
- **Package Manager**: pnpm

## 📁 Project Structure

```
ispgram/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/         # Clerk sign-in page
│   │   └── sign-up/         # Clerk sign-up page
│   ├── api/
│   │   ├── entries/         # Entry CRUD endpoints
│   │   ├── votes/           # Voting endpoint
│   │   ├── upload/          # Image upload endpoint
│   │   ├── notify/          # Winner notification endpoint
│   │   └── student/         # Student data endpoint
│   ├── submit/              # Education Week entry submission page
│   ├── vote/                # Cheering and voting page
│   ├── results/             # Friendly leaderboard page
│   ├── layout.tsx           # Root layout with navigation
│   └── page.tsx             # Landing page
├── components/
│   ├── entry-card.tsx       # Education Week entry display card
│   ├── vote-button.tsx      # Heart vote button component
│   └── leaderboard.tsx      # Leaderboard rankings component
├── hooks/
│   ├── use-entries.ts       # Entries data fetching hook
│   ├── use-votes.ts         # Voting logic hook
│   └── use-student.ts       # Student data hook
├── lib/
│   ├── db.ts                # Database helper functions
│   ├── email.ts             # Email sending utilities
│   ├── prisma.ts            # Prisma client instance
│   └── utils.ts             # General utility functions
├── prisma/
│   └── schema.prisma        # Database schema
└── middleware.ts            # Clerk authentication middleware
```

## 🗄️ Database Schema

### Student
- `id`: Unique identifier (cuid)
- `clerkId`: Clerk user ID (unique)
- `studentId`: De Anza student ID (unique, required)
- `name`: Student name
- `email`: Email address
- Relations: One entry, many votes

### Entry
- `id`: Unique identifier
- `studentId`: Foreign key to Student (unique - one entry per student)
- `description`: Optional highlight description
- `photoUrl`: Vercel Blob URL for the shared moment
- Relations: Belongs to student, has many votes

### Vote
- `id`: Unique identifier
- `studentId`: Who voted
- `entryId`: Which entry they voted for
- Constraint: One vote per student per entry (unique compound)
- Relations: Belongs to student and entry

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (Neon recommended)
- Clerk account
- Vercel Blob storage
- Zoho ZeptoMail account (optional, for emails)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Zoho Email (Optional)
ZOHO_API_KEY="your_zoho_api_key"
ZOHO_FROM_EMAIL="noreply@deanza.edu"
```

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up the database:
```bash
pnpm prisma generate
pnpm prisma db push
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 📝 Usage

### For Students

1. **Sign Up/Sign In**: Use your email to create an account via Clerk
2. **Share Entry**: Navigate to `/submit` and upload the Education Week photo you want to highlight along with your De Anza Student ID
3. **Cheer**: Go to `/vote` to see all entries and send hearts to your favorites (must share an entry first)
4. **Check Rankings**: Visit `/results` to see the live leaderboard

### For Admins

- Trigger winner notification: `POST /api/notify`
- Winner receives email with congratulations and vote count

## 🎨 Design Features

- **Education Week Theme**: Sky and indigo gradients with uplifting accents
- **Responsive Grid**: Adapts to mobile, tablet, and desktop screens
- **Smooth Animations**: Hover effects and transitions throughout
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: User-friendly error messages
- **Optimistic Updates**: Instant UI feedback on votes

## 🔒 Security Features

- Clerk authentication for all protected routes
- Middleware protection for API routes
- Student ID verification
- One entry per student constraint
- One vote per entry per student constraint
- Cascade deletes for data integrity

## 🧪 API Endpoints

### Entries
- `GET /api/entries` - List all entries with vote counts
- `POST /api/entries` - Create new entry (requires student ID)
- `GET /api/entries/[id]` - Get single entry
- `PATCH /api/entries/[id]` - Update entry (owner only)
- `DELETE /api/entries/[id]` - Delete entry (owner only)

### Votes
- `POST /api/votes` - Toggle vote on entry

### Upload
- `POST /api/upload` - Upload image to Vercel Blob

### Student
- `GET /api/student` - Get current student data

### Notify
- `POST /api/notify` - Send winner notification email

## 📦 Dependencies

Key packages:
- `next` - React framework
- `@clerk/nextjs` - Authentication
- `@prisma/client` - Database ORM
- `@vercel/blob` - File storage
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `clsx` & `tailwind-merge` - Class name utilities

## 🤝 Contributing

This is a student project for De Anza College ISP program. For issues or suggestions, please contact the ISP department.

## 📄 License

MIT License - Feel free to use this project for educational purposes.

## 🎓 Credits

Developed for De Anza College ISP Education Week Activity 2025.

---

Made with 💙 by the De Anza ISP Team
