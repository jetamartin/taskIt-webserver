// Mongoose Configuration file

var mongoose = require('mongoose'); 

// Must tell Mongoose which promise library to use - in this case we are using JS built in Promises
mongoose.Promise = global.Promise;

// Needed to prevent Deprecation warning to user createIndexes instead of depricated collection.ensureIndex
mongoose.set('useCreateIndex', true);

// Connect to local DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskIt', { useNewUrlParser: true }); 

// Export to other 
module.exports = {mongoose};