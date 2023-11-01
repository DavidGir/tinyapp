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
// GET routes for URL manipulation:
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

//Second route; Route parameter. SHows the details of a specific shortURL:
app.get("/urls/:id", (req, res) => {
  // Contain the shortURL from the route parameter:
  const shortURL = req.params.id;
  // Look up the longURL using the shortURL:
  const longURL = urlDatabase[shortURL];
  const templateVars = { id: shortURL, longURL: longURL };
  console.log("templateVars:", templateVars);
  res.render("urls_show", templateVars);
});
//-----------------------------------------------------------------------------

// GET route for URL redirection:

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
// Event handlers:

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});