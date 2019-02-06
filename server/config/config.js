const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
	var config = require('./config.json');
	var envConfig = config[env];
	// Object.keys() returns all keys of object in an array
	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key]; 
	})
}