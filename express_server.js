// Import Express library and initialize an application instance:
const express = require("express");
const app = express();
// Import cookieSession middleware:
const cookieSession = require("cookie-session");
// Import morgan middleware:
const morgan = require("morgan");
// Import bcrypt:
const bcrypt = require("bcryptjs");
// Import helper functions:
const { generateRandomString, findUserByEmail, urlsForUser, urlBelongsToUser } = require('./utils/helperFunctions');
// Config:
const PORT = 8080;
// Tells Express app to use EJS as its templating engine:
app.set("view engine", "ejs");
// In-memory database object:
const urlDatabase = {
  aaaaaa: {
    longURL: "https://www.tsn.ca",
    userID: "aaaaaa",
  },
  bbbbbb: {
    longURL: "https://www.google.ca",
    userID: "bbbbbb",
  },
};
// In-memory data store used to store and access users in the app:
const users = {
  aaaaaa: {
    id: "aaaaaa",
    email: "a@a.com",
    password: "$2a$10$TjHOq2r4GIjKTvTL5NPfuun/yzFwt5UkTzd5L5lrnHU2BEXHM6/ja",
  },
  bbbbbb: {
    id: "bbbbbb",
    email: "b@b.com",
    password: "$2a$10$gzYAJBlhcAAqcMDJbE6sCu.D1To4nIuA.HJJOQYI4dnwDjE.bM8fu",
  },
};
// Hash existing user passwords by iterating over users object:
for (const userID in users) {
  const plainTextPassword = users[userID].password;
  // Hash the plain text password:
  const hashedPassword = bcrypt.hashSync(plainTextPassword, 10);
  // Replace plain text password with hashed one:
  users[userID].password = hashedPassword;
}
// console.log(users);

// MIDDLEWARE:

//Parses incoming requests with URL-encoded request body from a Buffer into a string that is readable before any route handlers try to access it:
app.use(express.urlencoded({ extended: true }));
// Use of cookieSession in the app to parse incoming cookies off the req object:
app.use(cookieSession({
  name: "session",
  keys: ["asdfghjkl"],
}));
// Use the logger middleware:
app.use(morgan("dev"));

// --------------------------------------------------------------------------

// ROUTE METHODS:

// POST methods routes:

// Handles form submissions to create new short URLs:
app.post("/urls", (req, res) => {
  // Adding cookie user_id and user:
  const userID = req.session.user_id;
  const user = users[userID];
  // If the user is not logged in; send a message, 401 unauthorized code:
  if (!user) {
    return res.status(401).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Not Authorized</title>
    </head>
    <body>
      <p>You must be logged in to be able to shorten URLs.</p>
    </body>
    </html>
  `);
  }
  // If the user is logged in; can proceed with creating new short URL:
  // To generate a random string for the shortURL:
  const shortURL = generateRandomString();
  // Getting the long URL from the form submission:
  const longURL = req.body.longURL;
  // Store a new object with longURL and userID:
  urlDatabase[shortURL] = { longURL, userID };
  // console.log(req.body);
  // Redirect to the new URL's info page:
  res.redirect(`/urls/${shortURL}`);
});

// POST /login route: Authenticates the user and sets a session cookie.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log('Attempting to log in with email:', email);
  // Using the helper function by passing users database:
  const user = findUserByEmail(email, users);
  // If no user is found, or the passwords don't match, we send 403:
  if (!user) {
    return res.status(403).send("User cannot be found.");
  }
  // Using bcrypt to compare the provided password with the hashed password and match previous logic:
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password does not match.");
  }
  console.log("User found:", user);
  // Set cookie:
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Clear the user_id cookie and redirect the user back to urls page:
app.post("/logout", (req, res) => {
  // Clear the session user_id:
  req.session = null;
  // Redirects to login page:
  res.redirect("/login");
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
  // Hash password:
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Generate a random userID:
  const userID = generateRandomString();
  // Create new user object:
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  // Testing if users object appends correctly:
  console.log(users);
  // Set the user_id cookie:
  req.session.user_id = userID;
  // Redirect to url:
  res.redirect("/urls");
});

// Deletes a URL from urlDatabase object based on the :id param and redirects back to URL list:
app.post("/urls/:id/delete", (req, res) => {
  // Initialize variable to contain user_id cookie to identify logged in user:
  const userID = req.session.user_id;
  // Extract the :id (shortURL ID) parameter from the URL:
  const shortURL = req.params.id;
  // Check if user is not logged in and the URL does not belongs to the user (with helper function):
  if (!userID || !urlBelongsToUser(shortURL, userID, urlDatabase)) {
    return res.status(403).send("You do not have permission to delete this URL");
  }
  // Use delete operator to delete URL from the database:
  delete urlDatabase[shortURL];
  // Redirect to urls page:
  res.redirect("/urls");
});

// Updates an existing URL in urlDatabase based on :id param and redirects back to URL list page:
app.post("/urls/:id", (req, res) => {
  // Initialize variable to contain user_id cookie to identify logged in user:
  const userID = req.session.user_id;
  // Extract the :id (shortURL ID) parameter from the URL:
  const shortURL = req.params.id;
  // If short URL does not exist return 404 message:
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("The requested URL was not found on this server");
  }
  // Check if the user is logged in and if the URL belongs to the user (helper function):
  if (!userID || !urlBelongsToUser(shortURL, userID, urlDatabase)) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }
  // Update the long URL associated with that short URL:
  urlDatabase[shortURL].longURL = req.body.newLongURL;
  // After updating, redirect to urls page:
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

// Renders the urls_index.ejs template to display the URLs belonging to the logged-in user:
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  // If user is not logged in:
  if (!userID) {
    // Return error message 401 (Unauthorized):
    return res.status(401).send(`
    <html>
      <body>
        <p>You must be <a href="/login">logged in</a> to view this page.</p>
      </body>
    </html>
    `);
  }
  // Initialize variable to retrieve URLs specific to the logged in user using the urlsForUser helper function:
  const userURLs = urlsForUser(userID, urlDatabase);
  const user = users[userID];
  const templateVars = {
    urls: userURLs,
    user: user
  };
  // console.log(userURLs);
  res.render("urls_index", templateVars);
});

// Get Route for the registration page:
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  // Check if user_id cookie corresponds with valid user in users obj (meaning user is in login state):
  if (userID && users[userID]) {
    // Redirect to /urls:
    res.redirect("/urls");
  } else {
    // Render the registration page if not already logged in:
    // Rendering assuming there is no logged in user:
    const templateVars = { user: null };
    res.render("register", templateVars);
  }
});

// Get route for the login page:
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  // Check if user_id cookie corresponds with valid user in users obj (meaning user is in login state):
  if (userID && users[userID]) {
    // Redirect to /urls:
    res.redirect("/urls");
  } else {
    // Render the login page if not already logged in:
    // Rendering assuming there is no logged in user:
    const templateVars = { user: null };
    res.render("login", templateVars);
  }
});


// Renders the urls_new.ejs template, which contains a form for creating new short URLs:
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  // If user is not logged in; redirect to login page:
  if (!user) {
    res.redirect("/login");
  }
  // If user is logged in, render the page to create new URLs:
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

// Get route to display the dit page for a specific URL:
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlObject = urlDatabase[shortURL];
  const userID = req.session.user_id;
  const user = users[userID];
  // If the shortURL does not exist in the database:
  if (!urlObject) {
    return res.status(404).send("The requested URL was not found on this server.");
  }
  // If user not logged in:
  if (!userID) {
    return res.status(401).send(`
    <html>
      <body>
        <p>You must be <a href="/login">logged in</a> to view this page.</p>
      </body>
    </html>
    `);
  }
  // Use of helper function to check if the URL belongs to the logged in user:
  if (!urlBelongsToUser(shortURL, userID, urlDatabase)) {
    return res.status(403).send("You do not have permission to view this page");
  }
  // If URL exists and belongs to the user, proceed with rendering:
  const templateVars = {
    id: shortURL,
    longURL: urlObject.longURL,
    user: user
  };
    // console.log("templateVars:", templateVars);
  res.render("urls_show", templateVars);
});

//-----------------------------------------------------------------------------

// GET method route for URL redirection:

app.get("/u/:id", (req, res) => {
  // Contain in variable the shortURL from the route parameter:
  const shortURL = req.params.id;
  // Check if the short URL exists in the urlDatabase:
  if (urlDatabase[shortURL]) {
    // Initialize variable to contain the long URL from the urlDatabase:
    const longURL = urlDatabase[shortURL].longURL;
    // Redirect client to the long URL:
    res.redirect(longURL);
  } else {
    // Handle the case where the shortURL does not exist; message in HTML:
    res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 Not Found</title>
      <style>
        body { text-align: center; padding: 50px; font-family: 'Arial', sans-serif; }
        h1 { color: #333; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <h1>404 - Not Found</h1>
      <p>The short URL you are trying to access does not exist.</p>
    </body>
    </html>
  `);
  }
});

//-----------------------------------------------------------------------------

// EVENT HANDLERS:

// Start the Express server to listen on specific port:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});