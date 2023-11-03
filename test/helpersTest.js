const { assert } = require("chai");

const { findUserByEmail } = require("./utils/helpers");

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
    assert.strictEqual(user.id, expectedUserID, "The returned ID should match the expected user ID.");
  });

  it("should return undefined for an email not in the database", function() {
    const user = findUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user, "The function should return undefined for an email not in the database.");
  });

  // If your function returns null instead of undefined for non-existent emails, use this test case:
  it("should return null for an email not in the database", function() {
    const user = findUserByEmail("nonexistent@example.com", testUsers);
    assert.isNull(user, "The function should return null for an email not in the database.");
  });

  // Add more test cases if needed
});