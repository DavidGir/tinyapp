const express = require("express");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Routing for paths:

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  // outputs the urlDatabase object on the web client:
  res.json(urlDatabase);
});

// Event handlers:

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});