# TinyApp Project

TinyApp is a full-stack web application built with Node.js and Express that allows users to shorten long URLs (à la bit.ly). 

## Purpose
This project was published for learning purposes as part of my learnings at Lighthouse Labs (LHL).

## Features

- Shorten URLs
- Personal URL Dashboard
- URL Editing
- URL Deletion
- User Registration and Authentication
- Encrypted Cookies
- Responsive Design

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- body-parser
- cookie-session

## Getting Started

1. Install all dependencies (using the `npm install` command).
2. Run the development web server using the `node express_server.js` command.
3. Visit `http://localhost:8080/` in your browser to start using TinyApp.

## File Structure

- `express_server.js`: Server setup and route definitions.
- `views/`: Directory for EJS templates.
- `public/`: Static files like stylesheets and client-side scripts.
- `utils/`: Helper functions.
- `test/`: Assertion tests for helper function.

## Security

TinyApp uses bcryptjs for hashing passwords and cookie-session for encrypted session management.

## Credits

Developed by David Giroux. Special thanks to LHL mentors and instructors.

