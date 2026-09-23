// Local dev server: serves the site and the contact API.
// Production runs on GitHub Pages (static) and Vercel (static + api/contact.js).
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const contact = require('./api/contact');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

// Same handler Vercel runs from api/contact.js
app.all('/api/contact', contact);
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
