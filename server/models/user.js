const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// Must use schemas to add on custom instance and model methods
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
// The .toJSON method is called behind the scenes when you invoke Express's send method to send user model.
// Here we are overriding the standard .toJSON method so that we can restrict what values get returned in the http response (i.e., just return id and email)
UserSchema.methods.toJSON = function () {
	var user = this;
	// Take mongoose variable user and converting it into regular object that only includes the values that we want
	var userObject = user.toObject();
	
	return _.pick(userObject, ['_id', 'email']);
};




// Instance method to create auth token and save it as part of the user record (document)

UserSchema.methods.generateAuthToken = function ( ) {
	// Need to use reg function rather than arrow function because arrow functions don't bind a 'this' to it. And access to the specific user nstance is needed.
	// 'this' references user instance
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

// Model method 
UserSchema.statics.findByToken = function (token) {
	// 'this' returns the associated model
	var User = this;
	var decoded;
	
	try {
		decoded = jwt.verify(token, 'abc123')
	} catch (e) {
		return Promise.reject('Authenticaton Failed');	
	}
	
	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	})
	
};

var User = mongoose.model('User', UserSchema);


module.exports = {User};