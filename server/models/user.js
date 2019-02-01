const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// Must use schemas to add on custom methods
var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate:  {
			validator: (value) => {
				return validator.isEmail(value);
			},
			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 1
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function () {
	var user = this;
	// Take mongoose variable user and converting it into regular object that only includes the values that we want
	var userObject = user.toObject();
	
	return _.pick(userObject, ['_id', 'email']);
};




// Use below to create instance methods
// Need to use reg function rather than arrow function because arrow functions don't bind a this to it. And access to the specific user is needed.
UserSchema.methods.generateAuthToken = function ( ) {
	var user = this;
	var access = 'auth';
	
	// Create the token 
	var token = jwt.sign(
		{_id: user._id.toHexString(), access },
		'abc123'
	).toString();
	
	// Update the users token array
	// Not using array push method because there are some inconsistencies with how push works across versions of mongoDb and this can create "issues"
	user.tokens = user.tokens.concat([{access, token}]);
	// Need to return it so that server can chain onto promise 
	return user.save().then(() => {
		// token will be passed as the success  argument for the next then call (in the server)
		return token;
	});
};


var User = mongoose.model('User', UserSchema);


module.exports = {User};