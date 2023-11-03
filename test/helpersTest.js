const { assert } = require("chai");

const { findUserByEmail } = require("../utils/helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("findUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Adding a message to describe what assertion is checking:
    assert.strictEqual(user.id, expectedUserID, "The returned ID should match the expected user ID.");
  });

  it("should return null for an email not in the database", function() {
    const user = findUserByEmail("nonexistent@example.com", testUsers);
    // Adding a message to describe what assertion is checking:
    assert.strictEqual(user, null, "The function should return null for an email not in the database.");
  });
  
  
});