import Controller from "./controller.js";

//testing user.register function
const post = require('./models/Post.js')

const userData = {
 title: "iPhone X",
 price: "699",
 city: "Coventry",
 category: "Electronics",
 phone: "32949824",
 condition : "used",
 user: 544939938,
 createdAt: new Date(),
 url: "https://cnet4.cbsistatic.com/img/knVcFvL9RVPKDKE9kJqJy5L0gQM=/830x467/2017/10/31/312b3b6e-59b7-499a-aea4-9bc5f9721a21/iphone-x-54.jpg"

};

test(`adding new post`, (done) => {
 post.addPost(postData, (err, data) => {
 expect(err).toBeNull();
 done()
})
})
