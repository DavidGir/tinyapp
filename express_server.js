// Import Express library and initialize an application instance:
const express = require("express");
const app = express();
// Import cookieParser middleware:
const cookieParser = require("cookie-parser");
// Import morgan middleware:
const morgan = require("morgan");
// Config:
const PORT = 8080;
// Tells Express app to use EJS as its templating engine:
app.set("view engine", "ejs");
// In-memory database object:
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// In-memory data store used to store and access users in the app:
const users = {
  AAAAAA: {
    id: "aaaaaa",
    email: "a@a.com",
    password: "1234",
  },
  BBBBBB: {
    id: "bbbbbb",
    email: "b@b.com",
    password: "5678",
  },
};

// MIDDLEWARE:

//Parses incoming requests with URL-encoded request body from a Buffer into a string that is readable before any route handlers try to access it:
app.use(express.urlencoded({ extended: true }));
// Use of cookieParser in the app to parse incoming cookies off the req object:
app.use(cookieParser());
// Use the logger middleware:
app.use(morgan("dev"));


// UTILITY FUNCTIONS:

//generateRandomString function; generates random string to be used as a short URL identifier:
const generateRandomString = function() {
  // Initialize variable to generate random six alphanumeric characters:
  const randomString = Math.random().toString(36).substring(2, 8);
  // Return result:
  return randomString;
};

// Helper function to handle registration errors:
const findUserByEmail = (email) => {
  // Loop through users object:
  for (let userID in users) {
    const user = users[userID];
    // If user email is in our users data store (exists):
    if (user.email === email) {
      // Return user object for match found:
      return user;
    }
  }
  // Return null if no match exists:
  return null;
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

// Sets a cookie named user_id with the value submitted in the request body via the login form. Redirects to url page.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.email;
  // Using the helper function to get user object:
  const user = findUserByEmail(email);
  // If no user is found, or the passwords don't match, we send 403:
  if (!user) {
    return res.status(403).send("User cannot be found.");
  }
  // Set cookie:
  res.cookie("username", username);
  // console.log("req.cookies", req.cookies); // test
  res.redirect("/urls");
});

// Clear the user_id cookie and redirect the user back to urls page:
app.post("/logout", (req, res) => {
  // Clear the user_id cookie:
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Handles the registration form data:
app.post("/register", (req, res) => {
  // Get email and password from the request body:
  const email = req.body.email;
  const password = req.body.password;
  // Check if the email or password are empty strings:
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be left blank.");
  }
  // Check if email is already in use with help of findUserByEmail function:
  const user = findUserByEmail(email);
  if (user) {
    return res.status(400).send("A user with that email already exists.");
  }
  // Generate a random userID:
  const userID = generateRandomString();
  // Create new user object:
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  // Testing if users object appends correctly:
  console.log(users);
  // Set the user_id cookie:
  res.cookie("user_id", userID);
  // Redirect to url:
  res.redirect("/urls");
});

// Deletes a URL from urlDatabase object based on the :id param and redirects back to URL list:
app.post("/urls/:id/delete", (req, res) => {
  // Extract the :id parameter from the URL:
  const id = req.params.id;
  // Use delete operator to remove URL:
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

// Renders the urls_index.ejs template.
// This will display a list urls and userIDs:
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    // Pass the user object:
    user: user
  };
  res.render("urls_index", templateVars);
});

// Get Route for the registration page:
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user: user };
  res.render("register", templateVars);
});

// Get route for the login page:
app.get("/login", (req, res) => {
  res.render("login");
});


// Renders the urls_new.ejs template, which contains a form for creating new short URLs:
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

// Renders the urls_show.ejs template for a specific short URL.
// The short URL is obtained from the route parameter :id.
// The corresponding long URL is looked up in the urlDatabase:
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    id: shortURL,
    longURL: longURL,
    user: user
  };
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