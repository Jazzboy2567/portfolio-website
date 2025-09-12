# Portfolio Website Setup Guide

## Step 1: Install Node.js

### Download and Install
1. **Go to**: https://nodejs.org
2. **Download the LTS version** (Long Term Support)
3. **Run the installer** and follow the setup wizard
4. **Restart your command prompt/PowerShell**

### Verify Installation
Open PowerShell and run:
```bash
node --version
npm --version
```
You should see version numbers for both.

## Step 2: Install Dependencies

### Option A: Use the Setup Script (Easiest)
```bash
# Double-click setup.bat or run:
.\setup.bat
```

### Option B: Manual Installation
```bash
# Navigate to project directory
cd portfolio-website

# Install dependencies
npm install
```

## Step 3: Setup Gmail for Email Functionality

### Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process

### Generate App Password
1. In Google Account Settings → **Security**
2. Click **2-Step Verification** → **App passwords**
3. Select **Mail** as the app
4. Copy the generated password (16 characters)

## Step 4: Create .env File

### Option A: Use the Template
```bash
# Copy the template
copy env-template.txt .env
```

### Option B: Create Manually
Create a file named `.env` in the project root with:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
PORT=3000
```

### Example .env File
```env
EMAIL_USER=jazzboy2567@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
PORT=3000
```

## Step 5: Test the Server

### Start the Server
```bash
npm start
```

### Test the Website
1. Open browser to: http://localhost:3000
2. Test the contact form
3. Check that emails are sent

## Troubleshooting

### Node.js Not Found
- Restart your command prompt after installing Node.js
- Check if Node.js is in your PATH: `where node`

### npm install Fails
- Try: `npm install --force`
- Clear cache: `npm cache clean --force`

### Email Not Sending
- Verify Gmail App Password is correct
- Check .env file has no spaces around the = sign
- Ensure 2-Factor Authentication is enabled

### Port Already in Use
- Change PORT in .env file to 3001 or 8080
- Or kill the process using port 3000

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Start with auto-restart (if nodemon installed)
npm run dev
```

## File Structure After Setup
```
portfolio-website/
├── node_modules/          # Dependencies (created by npm install)
├── .env                   # Environment variables (you create this)
├── index.html
├── styles.css
├── script.js
├── server.js
├── package.json
└── ...other files
```
