const express = require("express");
const app = express();
const PORT = 8080;
// Tells Express app to use EJS as its templating engine:
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Middleware:
//Parses incoming requests with URL-encoded request body from a Buffer into a string that is readable before any route handlers try to access it:
app.use(express.urlencoded({ extended: true }));

//generateRandomString function:
const generateRandomString = function() {
  //Initialize variable to contain generated string result:
  let result = "";
  // Contain alphabetical letters and numerics:
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  // Select random character from the "characters" string:
  const randomCharacter = characters.charAt(Math.floor(Math.random() * charactersLength));
  //Loop six times to return six random alphanumeric characters:
  for (let i = 0; i < 6; i++) {
    // Add six random alphanumeric characters to the result:
    result += randomCharacter;
  }
  // Return result:
  return result;
};



// Routing for paths:

// POST route:
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// GET routes:
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  // outputs the urlDatabase object on the web client:
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// Render urls_new.ejs template in the browser:
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Second route; Route parameter:
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { id: shortURL, longURL: longURL };
  console.log("templateVars:", templateVars);
  res.render("urls_show", templateVars);
});



// Event handlers:

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});