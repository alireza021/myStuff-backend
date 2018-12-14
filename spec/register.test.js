import Controller from "./controller.js";

//testing user.register function
const user = require('./models/User.js')

const userData = {
 username: "ali",
 password: "123456",
 email: "ali@aliii.com",
 firstname: "Alireza",
 lastname: "Shafiei",
 createdAt : new Date()
};

test(`registering a new user`, (done) => {
 user.register(userData, (err, data) => {
 expect(err).toBeNull();
 done()
})
})
