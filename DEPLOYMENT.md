# Portfolio Website Deployment Guide

## Quick Start - Static Deployment (Recommended)

### Option 1: Vercel (5 minutes)
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial portfolio website"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Deploy!

3. **For Contact Form (Optional):**
   - Replace `script.js` with `static-contact.js` in your HTML
   - Update the email address in `static-contact.js`

### Option 2: Netlify (3 minutes)
1. **Drag & Drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag your `portfolio-website` folder to the deploy area
   - Done!

2. **GitHub Integration:**
   - Connect your GitHub repository
   - Auto-deploys on every push

## Full-Stack Deployment (With Email)

### Prerequisites
- Node.js installed
- Gmail account with App Password

### Steps
1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment:**
   ```bash
   cp env-template.txt .env
   # Edit .env with your Gmail credentials
   ```

3. **Test Locally:**
   ```bash
   npm start
   # Visit http://localhost:3000
   ```

4. **Deploy to Vercel:**
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables:
     - `EMAIL_USER`: your-gmail@gmail.com
     - `EMAIL_PASS`: your-app-password

## Gmail App Password Setup
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use this password in your `.env` file

## Custom Domain (Optional)
- Vercel: Add domain in project settings
- Netlify: Add domain in site settings
- Update DNS records as instructed

## Troubleshooting
- **Contact form not working?** Use `static-contact.js` for mailto functionality
- **Styling issues?** Check browser console for CSS errors
- **Deployment failed?** Check `vercel.json` configuration

## Live Demo
Your portfolio will be available at:
- Vercel: `https://your-project-name.vercel.app`
- Netlify: `https://your-project-name.netlify.app`
