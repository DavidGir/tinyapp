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



module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  urlBelongsToUser
};