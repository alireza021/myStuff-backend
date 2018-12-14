import Controller from "./controller.js";
//testing user.login function
const user = require('./models/User.js')

const userData = {
 email: "ali@aliii.com",
 password: "123456",
};

test(`loggin in user`, (done) => {
 user.loginUser(userData, (err, data) => {
 expect(err).toBeNull();
 done()
})
})
