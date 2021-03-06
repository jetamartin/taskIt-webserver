const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
// algorithm bcryptjs use to has password
const bcrypt = require('bcryptjs');

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
		process.env.JWT_SECRET
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

// Instance method
UserSchema.methods.removeToken = function (token) {
	var user = this;
	return user.updateOne({
		// $pull is a mongodb operator that removes items from an array that matches certain criteria 
		$pull: {  
			tokens: {token}
		}
	})
};


// Model method 
UserSchema.statics.findByToken = function (token) {
	// 'this' returns the associated model
	var User = this;
	var decoded;
	
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET)
	} catch (e) {
		return Promise.reject('Authenticaton Failed');	
	}
	
	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	})
	
};

/* Model Method:
	 First check to see if there is a user with the matching email address in the signin request 
	 If so then check to see if the password provided in the signin request matches the 
	 encrypted and salted password in the DB for that user. If there is a match
	 then return the user otherwise reject the promise so that the calling method 
	 can handle things in a catch (e.g., send back a 400 response)
*/

UserSchema.statics.findByCredentials = function (email, password) {
	var User = this;
	return User.findOne({email}).then((user) => {
		// If no matching document found with the email then no need to compare password
		if (!user) {
			return Promise.reject();
		}
	
		/* If the users password matches the one encrypted & salted on file then return the user otherwise
			 simply reject the promise and this will be handled by the calling method.
		*/
		return bcrypt.compare(password, user.password).then((res) => {
			if (!res) {
				return Promise.reject();
			} else {
				return user;
			}
		});
	});
};


// Mongoose Middleware
UserSchema.pre('save', function(next) {
	var user = this;
	// Only want to hash password if it has changed otherwise don't hash it
	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

var User = mongoose.model('User', UserSchema);


module.exports = {User};