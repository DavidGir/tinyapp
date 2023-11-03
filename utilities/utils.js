// This file contains all helper functions used by the express server in the aim of modularization:

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

// Helper function to filter the urlDatabase for URLs that belong to the user:
const urlsForUser = (id) => {
  // Initialize empty user URLs object:
  const userURLs = {};
  // Loop through urlDatabase object:
  for (const urlId in urlDatabase) {
    // If current user's ID exists in the urlDatabase:
    if (urlDatabase[urlId].userID === id) {
      userURLs[urlId] = urlDatabase[urlId];
    }
  }
  // Return user URLs:
  return userURLs;
};

// Helper function to check if a given URL belongs to a user:
const urlBelongsToUser = (shortURL, userID) => {
  const urlObject = urlDatabase[shortURL];
  // Returns true if URL belongs to the user and false otherwise:
  return urlObject && urlObject.userID === userID;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  urlBelongsToUser
};