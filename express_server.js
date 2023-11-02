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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
// In-memory data store used to store and access users in the app:
const users = {
  aaaaaa: {
    id: "aaaaaa",
    email: "a@a.com",
    password: "1234",
  },
  bbbbbb: {
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
  // Adding cookie user_id and user:
  const userID = req.cookies["user_id"];
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
  // Using the helper function to get user object:
  const user = findUserByEmail(email);
  // If no user is found, or the passwords don't match, we send 403:
  if (!user) {
    return res.status(403).send("User cannot be found.");
  }
  if (user.password !== password) {
    return res.status(403).send("Password does not match.");
  }
  console.log('User found, setting cookie and redirecting:', user);
  // Set cookie:
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Clear the user_id cookie and redirect the user back to urls page:
app.post("/logout", (req, res) => {
  // Clear the user_id cookie:
  res.clearCookie("user_id");
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
  // Initialize variable to contain user_id cookie to identify logged in user:
  const userID = req.cookies["user_id"];
  // Extract the :id (shortURL ID) parameter from the URL:
  const shortURL = req.params.id;
  // If the short URL exists in the database and belongs to the logged in user:
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userID) {
    // Use delete operator to delete URL from the database:
    delete urlDatabase[shortURL];
    // Redirect to urls page:
    res.redirect("/urls");
  } else {
    // Else return 404:
    return res.status(404).send("URL not found");
  }
});

// Updates an existing URL in urlDatabase based on :id param and redirects back to URL list page:
app.post("/urls/:id", (req, res) => {
  // Initialize variable to contain user_id cookie to identify logged in user:
  const userID = req.cookies["user_id"];
  // Extract the :id (shortURL ID) parameter from the URL:
  const shortURL = req.params.id;
  // If the short URL exists in the database and belongs to the logged in user:
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userID) {
    // Update the long URL associated with that short URL:
    urlDatabase[shortURL].longURL = req.body.newLongURL;
    // After updating, redirect to urls page:
    res.redirect("/urls");
  } else {
    // If the short URL does not exist or not belong to user send message:
    return res.status(404).send("URL not found");
  }
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
  // Initialize an empty object to store URLs that belong to the logged in user:
  const userURLs = {};
  // Loop through each key (shortURL ID) in the urlDatabase:
  for (const id in urlDatabase) {
    // CHeck if userID associated with current URL matches logged in user's ID:
    if (urlDatabase[id].userID === userID) {
      // If match add URLs to the userURLs object:
      userURLs[id] = urlDatabase[id];
    }
  }
  const templateVars = {
    urls: userURLs,
    // Pass the user object:
    user: user
  };
  res.render("urls_index", templateVars);
});

// Get Route for the registration page:
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
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
  const userID = req.cookies["user_id"];
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
  const userID = req.cookies["user_id"];
  const user = users[userID];
  // If user is not logged in; redirect to login page:
  if (!user) {
    res.redirect("/login");
  }
  // If user is logged in, render the page to create new URLs:
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