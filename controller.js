const bodyparser = require("body-parser");
var { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const categoriesData = require('./data/categories.js')

module.exports = function(app) {
  //-----------------------REGISTRATION---------------------------


  //Registration validation
  const regValidation = [
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email should be an email address"),
    check("firstname")
      .not()
      .isEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2 })
      .withMessage("Name should be at least 2 letters")
      .matches(/^([A-z]|\s)+$/)
      .withMessage("Name cannot have numbers"),
    check("lastname")
      .not()
      .isEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2 })
      .withMessage("Last name should be at least 2 letters"),
    check("username")
      .not()
      .isEmpty()
      .withMessage("Username is required")
      .isLength({ min: 2 })
      .withMessage("Username should be at least 2 letters"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters"),
    check(
      "password_con",
      "Password confirmation is required and should be the same as password"
    ).custom(function(value, { req }) {
      if (value !== req.body.password) {
        throw new Error("Password don't match");
      }
      return value;
    }),
    check("email").custom(value => {
      return User.findOne({ email: value }).then(function(user) {
        if (user) {
          throw new Error("This email is already in use");
        }
      });
    }),
    check("username").custom(value => {
      return User.findOne({ username: value }).then(function(user) {
        if (user) {
          throw new Error("This username is already in use");
        }
      });
    })
  ];

  //Register user if validation is successful
  function register(req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ errors: errors.mapped() });
    }
    var user = new User(req.body);
    user.password = user.hashPassword(user.password);
    user
      .save()
      .then(user => {
        return res.status(200).json(user);
      })
      .catch(err => res.send(err));
  }
  app.post("/api/register", regValidation, register);



  //-----------------------LOGIN---------------------------

  //Login validation
  const logValidation = [
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
  ];

  //Login user if validation is successful
  function loginUser(req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ errors: errors.mapped() });
    }
    User.findOne({
      email: req.body.email
    })
      .then(function(user) {
        if (!user) {
          return res.send({ error: true, message: "User does not exist!" });
        }
        if (!user.comparePassword(req.body.password, user.password)) {
          return res.send({ error: true, message: "Wrong password!" });
        }
        req.session.user = user;
        req.session.isLoggedIn = true;
        return res.send({ message: "You are signed in" });
        console.log("you are signed in");
        res.status(200).send(user);
      })
      .catch(function(error) {
        console.log(error);
      });
  }
  app.post("/api/login", logValidation, loginUser);

  //--------------------------CHECK LOGIN---------------------------------

  //return true if user is logged in
  function isLoggedIn(req, res, next) {
    if (req.session.isLoggedIn) {
      res.send(true);
    } else {
      res.send(false);
    }
  }
  app.get("/api/isloggedin", isLoggedIn);

  //Logout
  app.get("/api/logout", (req, res) => {
    req.session.destroy();
    res.status(200).send({ message: "Logged out!" });
  });

  //-----------------------------POSTING---------------------------

  //Post validation
  const postValidation = [
    check("title")
      .not()
      .isEmpty()
      .withMessage("Please add title."),
    check("price")
      .not()
      .isEmpty()
      .withMessage("Please add a price."),
    check("category")
      .not()
      .isEmpty()
      .withMessage("Please add a category."),
    check("image")
      .not()
      .isEmpty()
      .withMessage("Please upload image before posting."),
    check("phone")
      .not()
      .isEmpty()
      .withMessage("Please add a phone number."),
    check("city")
      .not()
      .isEmpty()
      .withMessage("Please add a city.")
  ];

  //Add post if validation is successful
  function addPost(req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({ errors: errors.mapped() });
    }
    var post = new Post(req.body);
    if (req.session.user) {
      post.user = req.session.user._id;
      post
        .save()
        .then(post => {
          res.status(200).json(post);
        })
        .catch(error => {
          res.status(500).json(error);
        });
    } else {
      return res.send({ error: "You are not logged in!" });
    }
  }
  app.post("/api/addpost", postValidation, addPost);


  //Display posts from database
  function showPosts(req, res) {
    Post.find()
      .populate("user", ["username", "email"])
      .then(post => {
        res.status(200).json(post);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  }
  app.get("/api/categories/:category", showPosts);


  //Display single item from database
  function showItem(req, res) {
    Post.find()
      .populate("user", ["username", "email"])
      .then(post => {
        res.status(200).json(post);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  }

  app.get("/api/categories/:category/:item", showItem);


  //Delete post
  app.delete("api/delete/:id", function(req, res) {
    var id = req.params.id;
    Item.remove({ _id: id })
      .exec()
      .then(data => {
        res.status(200).json({ data: data, message: "Post deleted!" });
      })
      .catch(err => {
        res.status(500).json(err);
      });
    return res.status(200);
  });


  //shows all categories available
  app.get('/api/categories', function(req, res){
    res.json(categoriesData)
  })
  //-----------------------------USERS---------------------------

  //Show user details
  function showUser(req, res) {
    User.find()
      .then(user => {
        res.status(200).json(user);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  }

  app.get("/api/users/:user/details", showUser);


  //Check which user is logged in
  function checkUser(req, res, next) {
    if (req.session.isLoggedIn) {
      res.json(req.session.user.username);
    } else {
      res.send({ message: "You are not logged in!" });
    }
  }
  app.get("/api/profile", checkUser);

  app.get("/", (req, res) => res.json("Backend connected"));
};
