const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const controller = require("./controller");
const categoriesData = require('./data/categories.js')
const citiesData = require('./data/cities.js')
const itemsData = require('./data/items.js')

const app = express();

app.use(bodyparser.json());
mongoose.connect('mongodb://alireza:alireza1@ds115874.mlab.com:15874/mystuff-webapi');

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://webapi-frontend.herokuapp.com"
    ],
    methods: ["GET", "HEAD", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: true //allow setting of cookies
  })
);


app.use(
  session({
    secret: "supersecretstring12345!",
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 60000 * 30 }
  })
);
controller(app);


//api
//shows all categories available
app.get('/api/categories', function(req, res){
  res.json(categoriesData)
})






app.listen(process.env.PORT || 8000, () => console.log('Listening...'));
