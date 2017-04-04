const mongoose = require('mongoose');

// Create a token generator with the default settings:
const generateToken = require('rand-token');

// Constant values which are all used globally in other locations

var USER = 'root';
var PASS = 'high5';
var HOST = '104.155.137.246';
var PORT = '27017';

var URI = `mongodb://${USER}:${PASS}@${HOST}:${PORT}`;

// Connecting to mongodb

var connection = mongoose.connect(`${URI}/admin`);

// Generate a 16 character alpha-numeric token:
const createToken = () => generateToken.generate(20);

var EMPTY_VALUE = "@EMPTY_VALUE";

// Add channel token
const addChannelToken = function(user){
  user = Object.assign({channelToken: createToken(), socketId: EMPTY_VALUE},user);
  return user;
};

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  channelToken: {
    type: String,
    required: true
  },
  socketId: {
    type: String,
    required: true
  }
},
{
  versionKey: false // You should be aware of the outcome after set to false
});

// Static methods that aids in workflow

userSchema.statics.findUserByUserId = function(userId, callback){
  console.log("findUserByUserId");
  return this.find({userId: userId}, callback);
};

userSchema.statics.removeUserByUserId = function(userId, callback){
  console.log("removeUserByUserId")
  return this.remove({userId: userId}, callback);
};

userSchema.statics.updateUser = function(userId, updatedContent, options, callback){
  console.log("updateUser");
  return this.findOneAndUpdate({userId: userId}, updatedContent, options, callback);
}

const User = module.exports = mongoose.model("User", userSchema);


const addUser = (user, callback) => {
    User.findUserByUserId(user.userId, function(err, users){
      if(err) throw err;
      if(users.length > 0){
        console.log("UserId Already Exists", users);
        User.removeUserByUserId(user.userId, function(err, users){
          User.create(addChannelToken(user),callback);
        });
      } else {
        console.log("New UserId");
        User.create(addChannelToken(user),callback);
      }
    });
};

module.exports.addUser = addUser;
