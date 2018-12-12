const bodyparser = require("body-parser");
var { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");
const User = require("./models/User.js");
const Post = require("./models/Post.js");

module.exports = function(app) {
  //-----------------------REGISTRATION---------------------------

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
        return res.json(user);
      })
      .catch(err => res.send(err));
  }
  app.post("/api/register", regValidation, register);
  app.get("/", (req, res) => res.json("sdasdsa"));

  //-----------------------LOGIN---------------------------

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
        res.send(user);
      })
      .catch(function(error) {
        console.log(error);
      });
  }
  app.post("/api/login", logValidation, loginUser);

  //--------------------------CHECK LOGIN---------------------------------

  function isLoggedIn(req, res, next) {
    if (req.session.isLoggedIn) {
      res.send(true);
    } else {
      res.send(false);
    }
  }
  app.get("/api/isloggedin", isLoggedIn);


  //-----------------------------POST VALIDATION---------------------------

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
      .withMessage("Please add a city."),
  ];

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
          res.json(post);
        })
        .catch(error => {
          res.json(error);
        });
    } else {
      return res.send({ error: "You are not logged in!" });
    }
  }
  app.post("/api/addpost", postValidation, addPost);

  //-----------------------------VOTE---------------------------

  app.post("/api/postupvote/:id", isLoggedIn, (req, res) => {
    Post.findById(req.params.id).then(function(post) {
      post.vote = post.vote + 1;
      post.save().then(function(post) {
        res.send(post);
      });
    });
  });

//-----------------------------SHOW POSTS---------------------------

  function showPosts(req, res) {
    Post.find()
      .populate("user", ["username", "email"])
      .then
      (post => {
        res.json(post)
      })
      .catch(error => {
        res.json(error);
      });
  }


  app.get("/api/categories/:category", showPosts);


//-----------------------------SHOW ITEM---------------------------
function showItem(req, res) {
  Post.find()
    .populate("user", ["username", "email"])
    .then(post => {
      res.json(post)
    })
    .catch(error => {
      res.json(error);
    });
}

app.get("/api/categories/:category/:item", showItem);


//-----------------------------SHOW USER---------------------------

function showUser(req, res) {
  User.find()
    .then(user => {
      res.json(user)
    })
    .catch(error => {
      res.json(error);
    });
}

app.get("/api/users/:user/details", showUser);

//-----------------------------CHECK LOGGED IN USER--------------------------

function checkUser(req, res, next) {
  if (req.session.isLoggedIn) {
    res.json(req.session.user.username)
  } else{
    res.send({ message: "You are not logged in!" })
  }
}
app.get("/api/profile", checkUser);

  app.get("/api/logout", (req, res) => {
    req.session.destroy();
    res.send({ message: "Logged out!" });
  });
};
