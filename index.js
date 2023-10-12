const express = require('express');
const db = require('./config/connection');
const routes = require('./routes');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Other middlewares
app.use(cors());

// Logging Middleware for development environment
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

app.use(express.static(path.join(__dirname, 'public')));
// app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(routes);

// 404 Handler
app.use((req, res) => {
  // Generate a random number between 1 and 4
  const randomImageNumber = Math.floor(Math.random() * 4) + 1;

  // Send a random error image
  res.status(404).send(`<img src="/assets/img/error404-${randomImageNumber}.jpg" alt="404" style="width: 700px">`);
});


// Global Error Handling
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    message: isProduction ? "An error occurred while fetching the thought" : err.message})
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
