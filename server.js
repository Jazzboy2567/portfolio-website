// Local dev server: serves the built site (dist/) and the API functions.
// Production runs on Vercel (dist/ + api/) and GitHub Pages (dist/ only).
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'style-src': ["'self'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
  })
);
app.use(express.json({ limit: '200kb' }));

// Same handlers Vercel runs from api/
for (const name of ['contact']) {
  app.all(`/api/${name}`, require(`./api/${name}`));
}
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
