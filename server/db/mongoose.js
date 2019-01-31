// Mogoose Configuration file

var mongoose = require('mongoose'); 

// Must tell Mongoose which promise library to use - in this case we are using JS built in Promises
mongoose.Promise = global.Promise;

// Connect to local DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taksIt', { useNewUrlParser: true }); 

// Export to other 
module.exports = {mongoose};