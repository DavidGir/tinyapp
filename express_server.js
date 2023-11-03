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
const { generateRandomString, findUserByEmail, urlsForUser, urlBelongsToUser } = require("./utils/helpers");
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
// POST methods routes:

/**
 * POST /urls
 * Purpose: Create a new short URL and associate it with the user.
 * Input: 'longURL' from the request body.
 * Output: Redirects to the URL info page for the newly created short URL.
 * Authentication: User must be logged in.
 */
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
  // Redirect to the new URL's info page:
  res.redirect(`/urls/${shortURL}`);
});

/**
 * POST /login
 * Purpose: Authenticate a user and start a session.
 * Input: 'email' and 'password' from the request body.
 * Output: Redirects to the URL listing page on successful login.
 * Authentication: None, this route performs authentication.
 */
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
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
  // Set cookie:
  req.session.user_id = user.id;
  res.redirect("/urls");
});

/**
 * POST /logout
 * Purpose: Log out the user by clearing the session.
 * Input: None.
 * Output: Redirects to the login page.
 * Authentication: None, accessible to anyone.
 */
app.post("/logout", (req, res) => {
  // Clear the session user_id:
  req.session = null;
  // Redirects to login page:
  res.redirect("/login");
});

/**
 * POST /register
 * Purpose: Register a new user.
 * Input: 'email' and 'password' from the request body.
 * Output: Redirects to the URL listing page on successful registration.
 * Authentication: None, this route is for users who are not yet authenticated.
 */
app.post("/register", (req, res) => {
  // Get email and password from the request body:
  const email = req.body.email;
  const password = req.body.password;
  // Check if the email or password are empty strings:
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be left blank.");
  }
  // Check if email is already in use with help of findUserByEmail function:
  const user = findUserByEmail(email, users);
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
  // Set the user_id cookie:
  req.session.user_id = userID;
  // Redirect to url:
  res.redirect("/urls");
});

/**
 * POST /urls/:id/delete
 * Purpose: Delete a short URL.
 * Input: ':id' from the URL parameter.
 * Output: Redirects to the URL listing page after deletion.
 * Authentication: User must be logged in and own the URL.
 */
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

/**
 * POST /urls/:id
 * Purpose: Update an existing short URL.
 * Input: ':id' from the URL parameter and 'newLongURL' from the request body.
 * Output: Redirects to the URL listing page after updating.
 * Authentication: User must be logged in and own the URL.
 */
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

/**
 * GET /urls
 * Purpose: Display the URL listing page for the logged-in user.
 * Input: None.
 * Output: Renders the URL listing page with URLs belonging to the logged-in user.
 * Authentication: User must be logged in.
 */
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
  res.render("urls_index", templateVars);
});

/**
 * GET /register
 * Purpose: Display the user registration page.
 * Input: None.
 * Output: Renders the registration page.
 * Authentication: None, accessible to anyone not logged in.
 */
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

/**
 * GET /login
 * Purpose: Display the user login page.
 * Input: None.
 * Output: Renders the login page.
 * Authentication: None, accessible to anyone not logged in.
 */
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

/**
 * GET /urls/new
 * Purpose: Display the page to create a new short URL.
 * Input: None.
 * Output: Renders the page for creating a new short URL.
 * Authentication: User must be logged in.
 */
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

/**
 * GET /urls/:id
 * Purpose: Display the edit page for a specific short URL.
 * Input: ':id' from the URL parameter.
 * Output: Renders the edit page for the specified short URL.
 * Authentication: User must be logged in and own the URL.
 */
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
  res.render("urls_show", templateVars);
});

/**
 * GET /u/:id
 * Purpose: Redirect to the original URL corresponding to the short URL.
 * Input: ':id' from the URL parameter.
 * Output: Redirects to the original long URL.
 * Authentication: None, accessible to anyone.
 */
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});