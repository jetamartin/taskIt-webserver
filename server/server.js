
// Core nodejs packages
// const path = require('path');
const http = require('http');

// "Non-core" nodejs packages
const express = require('express');

// Create PORT variable for Heroku
const port = process.env.PORT || 5000
var app = express();

app.get('/', (req, res) => {
  res.send("Hello from the root");
})

app.post('/login', (req, res) => {
  res.send("You are logged in");
})

app.post('/register', (req, res) => {
  res.send("You are registered");
})

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
