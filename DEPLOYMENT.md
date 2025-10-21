# Deployment Guide

This guide covers deploying the Appro Credit Sales Calling System to production.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is optimized for React/Vite applications and offers zero-config deployment.

#### Steps:

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy**
   ```powershell
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

5. **Redeploy**
   ```powershell
   vercel --prod
   ```

Your app will be live at: `https://your-project.vercel.app`

---

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**
   ```powershell
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```powershell
   npm run build
   ```

3. **Deploy**
   ```powershell
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add your Supabase credentials

---

### Option 3: Traditional Web Server (Apache/Nginx)

#### Steps:

1. **Build the project**
   ```powershell
   npm run build
   ```

2. **Configure your web server**

   **For Nginx** (`/etc/nginx/sites-available/appro-sales`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/appro-sales/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

   **For Apache** (`.htaccess` in dist folder):
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </IfModule>
   ```

3. **Upload the `dist` folder** to your server

4. **Set environment variables** on your server before building

---

## 🔒 Production Checklist

### Before Deployment

- [ ] Update `.env` with production Supabase credentials
- [ ] Review and update RLS policies in Supabase
- [ ] Test all user roles (rep, manager, admin)
- [ ] Verify all CRUD operations work
- [ ] Test authentication flow
- [ ] Check responsive design on mobile devices
- [ ] Run production build locally: `npm run build && npm run preview`
- [ ] Review console for any errors
- [ ] Test with real data

### Security

- [ ] Enable email verification in Supabase Auth (Production)
- [ ] Set up password policies in Supabase
- [ ] Review RLS policies for data access
- [ ] Enable HTTPS (handled by Vercel/Netlify automatically)
- [ ] Set up CORS policies in Supabase if needed
- [ ] Rotate API keys regularly
- [ ] Set up monitoring and logging

### Database

- [ ] Review database indexes for performance
- [ ] Set up automated backups in Supabase
- [ ] Configure database connection pooling
- [ ] Monitor database performance
- [ ] Set up point-in-time recovery

### Performance

- [ ] Enable caching headers
- [ ] Optimize images (if added later)
- [ ] Enable compression (gzip/brotli)
- [ ] Test page load times
- [ ] Monitor Lighthouse scores
- [ ] Set up CDN if needed

---

## 📊 Monitoring & Analytics

### Supabase Monitoring

- Dashboard → Database → Performance
- Monitor query performance
- Check connection pool usage
- Review error logs

### Application Monitoring (Optional)

Consider adding:
- **Sentry** for error tracking
- **Google Analytics** for user analytics
- **LogRocket** for session replay
- **Hotjar** for user behavior

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🗄 Database Migration Strategy

### For Updates

1. **Create new migration file**: `supabase/migrations/002_your_changes.sql`
2. **Test locally** with your local Supabase instance
3. **Run in production** via Supabase SQL Editor
4. **Verify changes** in production

### Rollback Strategy

- Always keep backup of previous schema
- Test migrations in staging environment first
- Use Supabase point-in-time recovery if needed

---

## 🌍 Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

### Netlify

1. Go to Domain Settings
2. Add custom domain
3. Configure DNS
4. Enable HTTPS (automatic)

---

## 📱 Progressive Web App (PWA) - Future Enhancement

To make the app installable on mobile devices:

1. Add `manifest.json`
2. Configure service worker
3. Add app icons
4. Test with Lighthouse PWA audit

---

## 🆘 Troubleshooting Production Issues

### Issue: White screen after deployment
- Check browser console for errors
- Verify environment variables are set
- Check if build completed successfully
- Ensure routing is configured (SPA fallback)

### Issue: API calls fail
- Verify Supabase URL and key in production
- Check CORS settings in Supabase
- Review network tab for failed requests
- Verify RLS policies allow operations

### Issue: Authentication not working
- Check Supabase Auth URL configuration
- Verify redirect URLs in Supabase settings
- Test with incognito/private browsing
- Clear browser cache and cookies

---

## 📈 Scaling Considerations

As your user base grows:

1. **Database**: Upgrade Supabase plan for more resources
2. **CDN**: Add CloudFlare for global distribution
3. **Caching**: Implement Redis for session management
4. **API**: Consider rate limiting
5. **Monitoring**: Set up alerts for downtime
6. **Backup**: Increase backup frequency

---

## 🎯 Post-Deployment

- [ ] Test all functionality in production
- [ ] Monitor error logs for 24 hours
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Document production URLs and credentials
- [ ] Train users on the system
- [ ] Collect feedback
- [ ] Plan for iterative improvements

---

**Your application is now live! 🚀**

For support: support@appro.ae
