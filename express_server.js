// Import Express library and initialize an application instance:
const express = require("express");
const app = express();
// Config:
const PORT = 8080;
// Tells Express app to use EJS as its templating engine:
app.set("view engine", "ejs");
// In-memory database object:
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// MIDDLEWARE:
//Parses incoming requests with URL-encoded request body from a Buffer into a string that is readable before any route handlers try to access it:
app.use(express.urlencoded({ extended: true }));

// UTILITY FUNCTIONS:
//generateRandomString function; generates random string to be used as a short URL identifier:
const generateRandomString = function() {
  //Initialize variable to contain generated string result:
  let result = "";
  // Contain alphabetical letters and numerics:
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  //Loop six times to return six random alphanumeric characters:
  for (let i = 0; i < 6; i++) {
    // Select random character from the "characters" string:
    const randomCharacter = characters.charAt(Math.floor(Math.random() * charactersLength));
    // Add six random alphanumeric characters to the result:
    result += randomCharacter;
  }
  // Return result:
  return result;
};

// --------------------------------------------------------------------------

// ROUTE METHODS:

// POST methods routes:

// Handles form submissions to create new short URLs:
app.post("/urls", (req, res) => {
  // To generate a random string for the shortURL:
  const shortURL = generateRandomString();
  // Getting the long URL from the form submission:
  const longURL = req.body.longURL;
  // Save the short and long URL to the database:
  urlDatabase[shortURL] = longURL;
  // console.log(req.body);
  // Redirect to the new URL's info page:
  res.redirect(`/urls/${shortURL}`);
});

// Deletes a URL from urlDatabase object based on the :id param and redirects back to URL list:
app.post("/urls/:id/delete", (req, res) => {
  // Extract the :id parameter from the URL:
  const id = req.params.id;
  // Use delete operator:= to remove URL:
  if (urlDatabase[id]) {
    delete urlDatabase[id];
  } else {
    return res.status(404).send("URL not found");
  }
  // Redirect back to the urls_index page:
  res.redirect("/urls");
});

// Updates an existing URL in urlDatabase based on :id param and redirects back to URL list page:
app.post("/urls/:id", (req, res) => {
  // Extract the :id parameter from the URL:
  const id = req.params.id;
  // Extract the new long URL from the request body:
  const newLongURL = req.body.newLongURL;
  // Update the long URL associated with the given short URL id:
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
  } else {
    return res.status(404).send("URL not found");
  }
  // Redirect to urls page:
  res.redirect("/urls");
});

// ----------------------------------------------------------------------------

// GET method routes for URL manipulation:

// When a client navigates to http://localhost:8080/, they'll receive the text "Hello!":
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Outputs the urlDatabase object as JSON when a client navigates to http://localhost:8080/urls.json:
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Sends a simple HTML response when a client navigates to http://localhost:8080/hello:
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Renders the urls_index.ejs template, passing in the urlDatabase object as a variable.
// This will display a list of all short URLs and their corresponding long URLs:
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Renders the urls_new.ejs template, which contains a form for creating new short URLs:
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Renders the urls_show.ejs template for a specific short URL.
// The short URL is obtained from the route parameter :id.
// The corresponding long URL is looked up in the urlDatabase:
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { id: shortURL, longURL: longURL };
  console.log("templateVars:", templateVars);
  res.render("urls_show", templateVars);
});
//-----------------------------------------------------------------------------

// GET method route for URL redirection:

app.get("/u/:id", (req, res) => {
  // Contain in variable the shortURL from the route parameter:
  const shortURL = req.params.id;
  // Look up the longURL using the shortURL:
  const longURL = urlDatabase[shortURL];
  // Check if the longURL exists:
  if (longURL) {
    // Redirect to the longURL:
    res.redirect(longURL);
  } else {
    // Handle the case where the shortURL does not exist:
    res.status(404).send("Short URL not found");
  }
});

//-----------------------------------------------------------------------------

// EVENT HANDLERS:

// Start the Express server to listen on specific port:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});