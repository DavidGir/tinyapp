//  This file contains helper functions to be used by the server file:

// Generates a string of 6 random alphanumeric characters:
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Finds a user by email:
const findUserByEmail = (email, database) => {
  for (let userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Filters URLs for a specific user:
const urlsForUser = (id, database) => {
  const userURLs = {};
  for (const urlId in database) {
    if (database[urlId].userID === id) {
      userURLs[urlId] = database[urlId];
    }
  }
  return userURLs;
};

// Checks if a URL belongs to a user:
const urlBelongsToUser = (shortURL, userID, database) => {
  const urlObject = database[shortURL];
  return urlObject && urlObject.userID === userID;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  urlBelongsToUser
};