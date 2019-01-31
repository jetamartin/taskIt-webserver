var express = require('express');
// bodyParser - converts JSON body in http request into JS object 
var bodyParser = require('body-parser');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js'); 
var {User} = require('./models/user'); 

var app = express();
app.use(bodyParser.json());

// create application/json parser
//var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: false });

const port = process.env.PORT || 3000;

app.set('port', process.env.PORT || 3000);

app.post('/user', (req, res) => {
	var user = new User({
		email: req.body.email,
		password: req.body.password
	})
	
	user.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`)
});