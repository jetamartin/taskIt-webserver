var express = require('express');
var _ = require('lodash');
// bodyParser - converts JSON body in http request into JS object 
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js'); 
var {User} = require('./models/user'); 
var {authenticate} = require('./middleware/authenticate');

var app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.set('port', process.env.PORT || 3000);

//**************************************
// Sign-in
//**************************************

app.post('/users', (req, res) => {
	// Use lodash .pick method to ensure we only get the params we need (and avoid any that may have been added maliciously)
	var body = _.pick(req.body, ['email', 'password' ])
	// Note because of prior line we can just pass in body because it has object w/email & password
	var user = new User(body);
	//Save user record in Db including token[]
	user.save().then(() => {
		// Create token & add to User record
		return user.generateAuthToken();
	}).then((token) => {
		// Send token back in header
		// x-auth used to create custom header
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e); 
	})
});



//**************************************
// Get Profile
//**************************************
app.get('/users/profile', authenticate, (req, res) => {
	res.send(req.user);
})


app.listen(port, () => {
  console.log(`Server is up on port ${port}`)
});