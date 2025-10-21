# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages:
- React 18
- TypeScript
- Supabase client
- React Router
- Recharts (for charts)
- Vite (build tool)

### Step 2: Set Up Supabase

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Run the Database Migration**
   - In your Supabase dashboard, go to the SQL Editor
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click "Run" to execute

3. **Get Your API Credentials**
   - In Supabase Dashboard, go to: Settings → API
   - Copy the "Project URL"
   - Copy the "anon public" key

### Step 3: Configure Environment

1. Create a `.env` file in the project root:

```powershell
Copy-Item .env.example .env
```

2. Edit the `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Create Users in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Create a test admin user:
   - Email: `admin@appro.ae`
   - Password: (choose a password)
   - Email Confirm: Toggle OFF for testing

**Important**: The user ID in Supabase Auth must match the ID in the `sales_reps` table. The SQL migration pre-populates some sample users, so you'll need to either:
   - Use the same user IDs from the migration, OR
   - Update the `sales_reps` table with your new user IDs

### Step 5: Run the Application

```powershell
npm run dev
```

The app will open at: `http://localhost:3000`

Login with:
- Email: `admin@appro.ae`
- Password: (the password you set in Step 4)

---

## 🎯 What You'll See

### Dashboard
- KPI cards showing total leads, calls today, pending docs, conversion rate
- Charts visualizing credit types, approvals by bank, and calls by rep
- Recent leads and upcoming follow-ups

### Leads Page
- Create and manage credit product leads
- Filter by credit type, status, bank, priority
- Log calls directly from the leads table
- Track application status

### Call Logs
- View complete call history
- See call duration, outcomes, and notes
- Track follow-up dates

### Settings (Admin Only)
- View all sales representatives
- System information

---

## 🔧 Troubleshooting

### Cannot connect to Supabase?
✅ Check your `.env` file has the correct URL and key  
✅ Verify your Supabase project is active  
✅ Check browser console for errors

### Authentication fails?
✅ Ensure user exists in Supabase Auth  
✅ Disable email confirmation in Supabase → Auth → Settings  
✅ Check user ID matches between `auth.users` and `sales_reps` table

### TypeScript errors?
✅ These are expected until you run `npm install`  
✅ Errors will disappear after dependencies are installed

### Port already in use?
✅ Change port in `vite.config.ts` (line 13)

---

## 📊 Sample Data

The SQL migration includes sample data:
- 4 sales representatives (admin, manager, 2 reps)
- 3 sample leads
- Pre-configured status workflow

---

## 🎨 Customization Tips

1. **Change Colors**: Edit CSS variables in `src/index.css`
2. **Add Banks**: Update bank options in `src/pages/Leads.tsx`
3. **Modify Status Workflow**: Update in database and `src/types/index.ts`
4. **Add Fields**: Update database schema, types, and forms

---

## 📝 Next Steps

1. **Customize the system** for your specific needs
2. **Add more bank partners** to the dropdown
3. **Configure email notifications** (future enhancement)
4. **Deploy to production** (Vercel, Netlify, or your preferred host)
5. **Set up backup policies** in Supabase

---

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review Supabase documentation: https://supabase.com/docs
- Review React documentation: https://react.dev

---

**You're all set! Happy selling! 🎉**
