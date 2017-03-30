const mongoose = require('mongoose');

// Create a token generator with the default settings:
const generateToken = require('rand-token');

// Generate a 16 character alpha-numeric token:
const createToken = () => generateToken.generate(20);

// Add channel token
const addChannelToken = function(user){
  user = Object.assign({channelToken: createToken()},user);
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
    type: String
  }
},
{
  versionKey: false // You should be aware of the outcome after set to false
});

// Static methods that aids in workflow

userSchema.statics.findUserByUserId = function(userId, callback){
  console.log(this);
  return this.find({userId: userId}, callback);
};

userSchema.statics.removeUserByuserId = function(userId, callback){
  return this.remove({userId: userId}, callback);
};

userSchema.static.updateUser = function(userId, updatedContent, options, callback){
  return this.findOneAndUpdate({userId: userId}, updatedContent, options, callback);
}

const User = module.exports = mongoose.model("User", userSchema);


const addUser = (user, callback) => {
    User.findUserByUserId(user.userId, function(err, users){
      if(err) throw err;
      if(users){
        User.removeUserByuserId(user.userId, function(err, users){
          User.create(addChannelToken(user),callback);
        });
      } else {
        User.create(addChannelToken(user),callback);
      }
    });
};

module.exports.addUser = addUser;
