# 🚀 Quick Reference Card

## Installation (First Time Only)

```powershell
# 1. Install dependencies
npm install

# 2. Copy environment file
Copy-Item .env.example .env

# 3. Edit .env with your Supabase credentials
# Get them from: https://supabase.com → Your Project → Settings → API
```

## Daily Development

```powershell
# Start development server
npm run dev

# Open browser at: http://localhost:3000
```

## Common Commands

```powershell
# Development
npm run dev              # Start dev server

# Building
npm run build           # Create production build
npm run preview         # Preview production build

# Code Quality
npm run lint            # Check for code issues
```

## Default Login

- Email: `admin@appro.ae`
- Password: (set in Supabase Auth)

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Documentation**: See README.md
- **Setup Guide**: See SETUP_GUIDE.md
- **Deployment**: See DEPLOYMENT.md

## File Locations

| What | Where |
|------|-------|
| Database Schema | `supabase/migrations/001_initial_schema.sql` |
| Environment Config | `.env` |
| Main App | `src/App.tsx` |
| Dashboard | `src/pages/Dashboard.tsx` |
| Leads Page | `src/pages/Leads.tsx` |
| API Functions | `src/utils/api.ts` |
| Types | `src/types/index.ts` |
| Styles | `src/index.css` |

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot connect to DB | Check `.env` file |
| Login fails | Create user in Supabase Auth |
| TypeScript errors | Run `npm install` |
| Port in use | Change port in `vite.config.ts` |
| White screen | Check browser console for errors |

## Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React contexts (Auth)
├── pages/          # Page components
├── types/          # TypeScript types
├── utils/          # Helper functions
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## User Roles

| Role | Can Do |
|------|--------|
| **Rep** | View & edit their leads, log calls |
| **Manager** | View all leads, assign leads, export data |
| **Admin** | Everything + manage users, settings |

## Tech Stack

- React 18 + TypeScript
- Supabase (PostgreSQL + Auth)
- Vite (Build tool)
- React Router (Routing)
- Recharts (Charts)

## Support

- Email: support@appro.ae
- Website: https://appro.ae
- Documentation: PROJECT_SUMMARY.md

---

**Keep this card handy! 📌**
