const mongoose = require('mongoose');
var moment = require('moment');
var now = () => moment().utcOffset(330).format();
const Rx = require('rxjs');

// Constant values which are all used globally in other locations

var USER = 'root';
var PASS = 'handlwithease';
var HOST = '104.198.196.76';
var PORT = '27017';

var URI = `mongodb://${USER}:${PASS}@${HOST}:${PORT}`;

// Connecting to mongodb

var connection = mongoose.connect(`${URI}/admin`);

// Generate a 16 character alpha-numeric token:

var EMPTY_VALUE = "@EMPTY_VALUE";

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
  },
  active: {
    type: Boolean,
    required: true,
    default: false
  }
},
{
  versionKey: false // You should be aware of the outcome after set to false
});

// Static methods that aids in workflow

userSchema.statics.findUserByUserId = (userId) => {
    return Rx.Observable.fromPromise(new Promise((done, reject) => {
        User.find({userId}, (err, data) => {
            if(err) reject(err);
            return done(data);
        });
      })
    );
}

userSchema.statics.updateUserBySocketId = function(socketId, updatedContent, options){
    return Rx.Observable.fromPromise(new Promise((done, reject) => {
      User.findOneAndUpdate({"socketId": socketId}, updatedContent, options, (err, data) => {
            if(err) reject(err);
            return done(data);
        });
      })
    );
}

userSchema.statics.findUserByChannelToken = function(channelToken){
    return Rx.Observable.fromPromise(new Promise((done, reject) => {
      User.find({channelToken}, (err, data) => {
            if(err) reject(err);
            return done(data);
        });
      })
    );
}

userSchema.statics.removeUserByUserId = function(userId){
    return Rx.Observable.fromPromise(new Promise((done, reject) => {
      User.remove({userId}, (err, data) => {
            if(err) reject(err);
            return done(data);
        });
      })
    );
}


userSchema.statics.removeUserByChannelToken = function(channelToken){
    return Rx.Observable.fromPromise(new Promise((done, reject) => {
      User.remove({channelToken}, (err, data) => {
            if(err) reject(err);
            return done(data);
        });
      })
    );
}

userSchema.statics.updateUser = function(channelToken, updatedContent, options){
    return Rx.Observable.fromPromise(new Promise((done, reject) => {
      User.findOneAndUpdate({"channelToken": channelToken}, updatedContent, options, (err, data) => {
            if(err) reject(err);
            return done(data);
        });
      })
    );
}
const User = module.exports = mongoose.model("User", userSchema);
