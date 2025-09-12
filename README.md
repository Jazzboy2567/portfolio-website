# Portfolio Website

A modern, responsive portfolio website built with HTML5, CSS3, JavaScript, and Node.js.

## Features

- 🌙 Dark/Light theme toggle
- 📱 Fully responsive design
- ✨ Smooth animations and transitions
- 📧 Contact form with email integration
- 🎨 Modern UI/UX design
- ⚡ Fast loading and optimized

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer
- **Security**: Helmet.js, CORS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gmail account for email functionality

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit `http://localhost:3000`

## Project Structure

```
portfolio-website/
├── index.html          # Main HTML file
├── styles.css          # CSS styles with theme support
├── script.js           # JavaScript functionality
├── server.js           # Node.js server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
└── README.md          # Project documentation
```

## Customization

### Personal Information
- Update the name, title, and description in `index.html`
- Replace the placeholder image with your actual photo
- Update project information in the projects section

### Styling
- Modify CSS variables in `styles.css` to change colors and themes
- Add your own animations and effects
- Customize the responsive breakpoints

### Contact Form
- Configure email settings in `server.js`
- Add additional form fields if needed
- Customize the email template

## Deployment

### Option 1: Static Deployment (Easiest)
For a simple static portfolio without backend functionality:

1. **Vercel Static Deployment:**
   - Push your code to GitHub
   - Connect repository to Vercel
   - Deploy as static site (no backend needed)
   - Replace `script.js` with `static-contact.js` for mailto functionality

2. **Netlify Static Deployment:**
   - Drag and drop the portfolio-website folder to Netlify
   - Or connect your GitHub repository
   - No configuration needed

### Option 2: Full-Stack Deployment (With Email)
For full functionality including email contact form:

1. **Vercel Full-Stack:**
   - Install Node.js locally
   - Run `npm install` to install dependencies
   - Create `.env` file with your Gmail credentials
   - Push to GitHub and connect to Vercel
   - Add environment variables in Vercel dashboard:
     - `EMAIL_USER`: your-gmail@gmail.com
     - `EMAIL_PASS`: your-app-password

2. **Heroku:**
   - Install Heroku CLI
   - Run `heroku create your-portfolio-name`
   - Set environment variables: `heroku config:set EMAIL_USER=your-email EMAIL_PASS=your-password`
   - Deploy: `git push heroku main`

### Gmail Setup for Email Functionality
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in your `.env` file

## License

MIT License - feel free to use this template for your own portfolio!

## Contact

- GitHub: [Jazzboy2567](https://github.com/Jazzboy2567)
- Email: [Your Email]

---

Built with ❤️ by Jazzboy2567
