const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return username & authenticatedUser(username,'')
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    console.log(`AUTHENTICATEDUSERS::: username: ${username} and password: ${password}`)
    return (password.length != 0 & userswithsamename[0].password !== password) ? false: true;
  } else {
    console.log(`username: ${username} doesnt exist`)
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here    
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }else if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });
    // Store access token and username in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  let validBook = books[isbn];
  if (validBook) {
    console.log("ISBN is valid")
    const reviews = validBook.reviews;
    const existingReview = reviews[username];
    reviews[username] = review;

    if (existingReview) {
      console.log("Existing Review successfully updated")
      return res.status(200).send("Review successfully updated");
    } else {
      console.log("Review successfully added")
      return res.status(200).send("Review successfully added");
    }
  } else {
    console.log("Provided book does not exist")
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  let validBook = books[isbn];

  if (validBook) {
    const existingReview = validBook.reviews[username];
    if (existingReview) {
      delete validBook.reviews[username];
    }
    return res
      .status(200)
      .send(
        `Review from User, ${username} removed successfully from Book (ISBN: ${isbn}).`
      );
  } else {
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;