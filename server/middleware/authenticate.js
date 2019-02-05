var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
	// Just specify key for value you need from incoming request
	var token = req.header('x-auth');
	
	User.findByToken(token).then((user) => {
		if (!user) {
			// If no matching user found then we want to send response with status (401). Rejecting promise will cause this to fall into catch block below 
			return Promise.reject(); 
		}
		req.user = user;
		req.token = token;
		next();
	}).catch((e) =>  {
		res.status(401).send();
	})
}

module.exports = {authenticate};