# Appro Credit Sales Calling System

A comprehensive credit sales calling progress tracking system built for Appro Onboarding Solutions FZ LLC. This system enables sales teams to manage credit product leads (credit cards, personal loans, car loans, home loans), track call progress, and monitor conversion metrics.

## 🏢 Company

**Appro Onboarding Solutions FZ LLC**  
Website: [https://appro.ae](https://appro.ae)

## 🎯 Features

### Core Functionality
- **Lead Management** - Create, update, and track credit product leads
- **Call Logging** - Record sales calls with detailed notes and outcomes
- **Status Tracking** - Monitor leads through the entire credit application pipeline
- **Follow-up Scheduling** - Set reminders for future follow-ups
- **Dashboard Analytics** - Real-time metrics and visualizations
- **Reports & Export** - Export leads data to CSV format
- **Role-Based Access** - Different permissions for reps, managers, and admins

### Credit Types Supported
- Credit Cards
- Personal Loans
- Car Loans
- Home Loans

### Application Status Workflow
1. New
2. Contacted
3. Pre-qualified
4. Docs Collected
5. Submitted
6. Approved/Rejected
7. Closed

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Build Tool**: Vite
- **Styling**: Custom CSS with CSS Variables

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account ([https://supabase.com](https://supabase.com))

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Sales Calling System"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Run the SQL migration in the Supabase SQL Editor:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy and paste the entire contents into the Supabase SQL Editor
   - Run the migration

### 4. Configure environment variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Find these values in Supabase Dashboard → Project Settings → API

### 5. Set up Authentication in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Create users manually or enable email authentication
3. The sample SQL migration creates these default users:
   - `admin@appro.ae` (admin role)
   - `sarah.manager@appro.ae` (manager role)
   - `john.rep@appro.ae` (rep role)
   - `jane.rep@appro.ae` (rep role)

4. Set passwords for these users in the Supabase Auth panel

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 👥 User Roles & Permissions

| Role | View Leads | Edit Leads | Assign Leads | Delete Leads | Export Data | Settings |
|------|------------|------------|--------------|--------------|-------------|----------|
| **Rep** | Their assigned leads | Their assigned leads | ❌ | ❌ | ❌ | ❌ |
| **Manager** | All leads | All leads | ✅ | ❌ | ✅ | ❌ |
| **Admin** | All leads | All leads | ✅ | ✅ | ✅ | ✅ |

## 📊 Database Schema

### Tables

1. **sales_reps** - Sales representatives and users
2. **leads** - Credit product leads
3. **calls** - Call logs and history
4. **status_history** - Audit trail for status changes

### Key Features
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Status change tracking via triggers
- Foreign key relationships with CASCADE deletes
- Indexed columns for performance

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only view/edit leads based on their role
- Supabase authentication with secure sessions
- Environment variables for sensitive data
- Data encryption at rest (Supabase default)

## 📱 Pages

### Dashboard (`/dashboard`)
- KPI cards (Total Leads, Calls Today, Pending Docs, Conversion Rate)
- Charts (Leads by Credit Type, Approvals by Bank, Calls by Rep)
- Recent leads table
- Upcoming follow-ups

### Leads (`/leads`)
- Full leads management with CRUD operations
- Advanced filtering (credit type, status, search)
- Inline call logging
- Status updates
- Priority management

### Call Logs (`/calls`)
- Complete call history
- Detailed view of each call
- Filter by date, outcome, rep

### Settings (`/settings`)
- User management (Admin only)
- System information
- Sales representatives list

## 🎨 Customization

### Colors
Edit CSS variables in `src/index.css`:

```css
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --danger: #ef4444;
  /* ... more colors */
}
```

### Bank Partners
Update the bank list in the Lead creation form or add a separate banks table.

## 📊 Reports & Analytics

The system provides:
- Real-time dashboard metrics
- Conversion rate tracking
- Bank-wise approval analysis
- Credit type distribution
- Sales rep performance
- CSV export functionality

## 🐛 Troubleshooting

### Issue: Cannot connect to Supabase
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Ensure RLS policies are properly set up

### Issue: Authentication not working
- Verify users exist in Supabase Auth
- Check if email confirmation is required (disable for testing)
- Ensure user IDs match between `auth.users` and `sales_reps` table

### Issue: TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` is properly configured

## 📝 Future Enhancements

- [ ] Email notifications for follow-ups
- [ ] SMS integration
- [ ] WhatsApp Business API integration
- [ ] Advanced reporting with filters
- [ ] PDF generation for lead reports
- [ ] Document upload for credit applications
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Arabic/English)
- [ ] Integration with bank APIs
- [ ] Automated lead scoring

## 📄 License

Proprietary - Appro Onboarding Solutions FZ LLC

## 🤝 Support

For support and questions, contact:
- Email: support@appro.ae
- Website: https://appro.ae

---

**Built with ❤️ for Appro Onboarding Solutions FZ LLC**
