# 🚀 Deployment Checklist for FastSwype

## 📋 Pre-Deployment Steps

### 1. Update Environment Variables

When deploying to production (Vercel, Netlify, etc.), update these environment variables:

**In your hosting platform's environment variables:**
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://upphblfmgwqzjzunlhli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_PAYMENT_AMOUNT=250
NEXT_PUBLIC_IBAN_NUMBER=PK83JCMA1410923311204621
NEXT_PUBLIC_PAYMENT_WHATSAPP=+923311204621
```

⚠️ **Never commit `.env.local` to git!** It's in `.gitignore` for security.

---

## 🔧 Supabase Configuration Changes

### Go to: [Supabase Dashboard](https://supabase.com/dashboard/project/upphblfmgwqzjzunlhli/auth/url-configuration)

### 1. **Update Site URL**
- Navigate: `Authentication` → `URL Configuration`
- Change **Site URL** from `http://localhost:3000` to `https://your-domain.com`

### 2. **Update Redirect URLs**
- Add your production domain:
  - `https://your-domain.com/**`
  - `https://your-domain.com/login`
- Keep localhost for development:
  - `http://localhost:3000/**`

### 3. **Email Templates** (Optional but Recommended)
- Go to: `Authentication` → `Email Templates`
- Update the "Confirm signup" template if needed
- Make sure links point to production domain

### 4. **SMTP Settings** (Recommended for Production)
- Go to: `Project Settings` → `Auth` → `SMTP Settings`
- Configure custom SMTP (Gmail, SendGrid, etc.) for reliable email delivery
- Supabase's built-in email works but has limitations

---

## 🌐 Deployment Platforms

### **Vercel (Recommended)**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

**Environment Variables in Vercel:**
- Go to: Project Settings → Environment Variables
- Add all variables from `.env.local`
- Make sure to update `NEXT_PUBLIC_SITE_URL` to your Vercel URL

### **Netlify**

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. New site from Git
4. Add environment variables in Site Settings
5. Deploy!

---

## ✅ Post-Deployment Checklist

### Test These Features:

- [ ] **Signup Flow**
  - Create new account
  - Check if verification email is received
  - Click confirmation link
  - Verify redirect to login page
  - Login with new account

- [ ] **Login**
  - Try logging in with existing account
  - Check if redirected to correct page

- [ ] **Profile**
  - Check if profile loads correctly
  - Test profile edit functionality

- [ ] **Swipe Page**
  - Verify cards load
  - Test swiping functionality
  - Check proposal sending

- [ ] **Payment**
  - Test payment modal
  - Verify payment instructions

---

## 🐛 Troubleshooting

### Email Verification Not Working?
1. Check Supabase Site URL matches your domain
2. Verify Redirect URLs are correct
3. Check email spam folder
4. Review Supabase logs: `Authentication` → `Logs`

### Profile Not Creating?
1. Check browser console for errors
2. Verify Supabase RLS policies allow profile creation
3. Check user metadata in Supabase dashboard

### 404 Errors After Deployment?
1. Make sure `next.config.ts` doesn't have conflicting settings
2. Clear Vercel/Netlify cache and redeploy

---

## 📝 Custom Domain Setup

### If using a custom domain (e.g., fastswype.com):

1. **Update DNS records** with your hosting provider
2. **Update in Vercel/Netlify**:
   - Add custom domain in dashboard
   - Configure DNS settings

3. **Update Supabase**:
   - Site URL: `https://fastswype.com`
   - Redirect URLs: `https://fastswype.com/**`

4. **Update Environment Variable**:
   - `NEXT_PUBLIC_SITE_URL=https://fastswype.com`

---

## 🔒 Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Keep all environment variables in your hosting platform, not in code
- Enable RLS (Row Level Security) policies in Supabase for all tables
- Review Supabase security settings before going live

---

## 📧 Support

If you need help:
1. Check Vercel/Netlify build logs
2. Check browser console for errors
3. Review Supabase logs
4. Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)

---

**Good luck with your deployment! 🚀**
