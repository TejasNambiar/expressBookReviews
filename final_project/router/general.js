const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    console.log(`/REGISTER::: username: ${username} and password: ${password}`)
    // Check if the user does not already exist
    if (!isValid(username)) {
        console.log("User successfully registered. Now you can login")
        // Add the new user to the users array
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Invalid details. Please check"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  const retrieveList = () =>{
    return new Promise((res,rej) =>{
      res(books)
    })
  }
  retrieveList.then(books =>{
    return res.status(200).json({books: books})
  }, (error) => {
    return res.status(404).json({message: "Error occurred while retirieving books"})
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const retrieveIsbn = ()=>{
    return new Promise((res,rej)=>{
      let book = books[req.params.isbn]
      if(book){
        res(book)
      }else{
        rej(new Error('ISBN doesnt exist'))
      }
    })
  }

  retrieveIsbn().then(
    (book) =>{
      return res.status(200).json({book: book})
    },
    (err)=>{
      return res.status(404).json({message: err.message})
    })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  let author = req.params.author
  const retrieveAuthorBooks = () =>{
    return new Promise((res,rej)=>{
      let validBooks = [];
      for (let book in books) {
        const bookAuthor = books[book].author;
        if (bookAuthor === author) {
          validBooks.push(books[book]);
        }
      }
      if (validBooks.length > 0) {
        res(validBooks);
      } else {
        rej(new Error("Author not found"));
      }
    })
  }
  retrieveAuthorBooks().then(
    (bookList) => res.status(200).json({books: bookList}),
    (err) => res.status(404).send({message: err.message})
  )
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  let title = req.params.title

  const retrieveTitle = () =>{
    return new Promise((res,rej)=>{
      for(let isbn in books){
        let bookTitle = books[isbn].title
        if(bookTitle === title){     
          console.log("Title found")  
          res(books[isbn])
        }
      }
      console.log("Title NOT found")  
      rej(new Error("Title not found"));
    })
  }

  retrieveTitle().then(
    (book) => res.status(200).json({book: book}),
    (err) => res.status(404).send({message: err.message})
  )
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn
  if(books[isbn]){
    return res.status(200).json({book: book})
  }
  return res.status(404).json({message: "Invalid ISBN"});
});

module.exports.general = public_users;