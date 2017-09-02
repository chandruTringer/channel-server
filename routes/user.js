const User = require('../models/user');
const moment = require('moment');
const now = () => moment().utcOffset(330).format();

// Create a token generator with the default settings:
const generateToken = require('rand-token');
const EMPTY_VALUE = "@EMPTY_VALUE";
const APP_SERVER = "http://gabbytalk.com/api/v1/";
const createToken = () => generateToken.generate(32);

const addChannelToken = (user) => Object.assign(
    {
        channelToken: createToken(), 
        socketId: EMPTY_VALUE
    },
    user
);

const addSuccessResponse = (obj) => {
    return {
        success: true,
        message: obj
    };
};

const addFailureResponse = (obj, cause) => {
    return {
        success: false,
        message: obj,
        cause: cause
    };
};

const createUser = ( request, response, io ) => {

    // Website you wish to allow to connect
    response.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    response.setHeader('Access-Control-Allow-Credentials', true);

    var userId = request.params._id;
    
    var userObject = addChannelToken(
        {
            userId
        }
    );

    User.create(userObject, (err, successResponse) => {
        if(err) response.json(addFailureResponse(err));
        console.log(now()+" : CREATED USER_ID: "+userId);
        response.json(successResponse);
    });
};

const deleteUser = ( request, response, io ) => {
    // Website you wish to allow to connect
    response.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    response.setHeader('Access-Control-Allow-Credentials', true);

    var userId = request.params._id;
    var channelToken = request.query.channelToken;
    if(channelToken){
        User.removeUserByChannelToken(channelToken)
            .subscribe(
                successResponse => {
                    console.log(now()+" : REMOVED USER_ID: "+userId+" CHANNEL_TOKEN: "+channelToken);     
                    response.json(addSuccessResponse("Deleted Successfully!"));
                },
                err => response.json(addFailureResponse(err))
            );
    } else {
        // Considered to be as logout from all the sessions
         User.removeUserByUserId(userId)
            .subscribe(
                successResponse => {
                    console.log(now()+" : REMOVED USER_ID: "+userId);     
                    response.json(addSuccessResponse("Deleted Successfully!"));
                },
                err => response.json(addFailureResponse(err))
            );
    }
   
};

const sendToSocket = (sendTo, data, io) => {
    var sockets = io.sockets;
    if(sendTo && sockets.connected[sendTo]){
        sockets.connected[sendTo].send(data.message);
        return true;
    } else {
        console.log(now()+" : Failed socket : "+sendTo);
        return false;
    }
};

const findUserAndSendMessage = (sendTo, data, io, response) => {
    User.findUserByUserId(sendTo)
        .subscribe(
            (users) => {
                var sentSockets = [];
                // console.log(users);
                var active = users.filter(user => {
                    return user.active;
                });
                console.log(active);
                let sentToAll = active.every( user => {
                    console.log(user.socketId)
                    sentSockets.push(user.socketId);
                    return sendToSocket(user.socketId, data, io);
                });
                if(sentToAll){
                    response.json(addSuccessResponse(data));
                } else {
                     response.json(addFailureResponse(data, "Some of the channel not in connection"));
                }
                console.log(now()+" : Sent "+sentSockets);
            },
            (err) => {
                console.log('Something went wrong: '+err.message);
            }
        );
}

const sendMessage = ( request, response, io ) => {
    var data = request.body;
    console.log("REQUEST_BODY", data);
    
    if(data.sendTo){
        var senders = data.sendTo;
        if(typeof senders === "string"){
            // if((/::(agent|admin)/).test(senders)){
            //     io.broadcast.to(senders).send(data);
            // } else if((/::(administrator)/).test(senders)){
            //     var senders = senders.split("::");
            //     var orgId = senders[0];
            //     io.broadcast.to(`${ordId}::agent`).send(data);
            //     io.broadcast.to(`${ordId}::admin`).send(data);
            // } else {
                findUserAndSendMessage(senders, data, io, response);
            // }
        } else {
            for(let sender in senders){
                findUserAndSendMessage(senders[sender], data, io, response);        
            }
        }
        
    } else {
         console.log(now()+" : SendTo Not Sendable");
    }
   
}

module.exports = {
    createUser,
    deleteUser,
    sendMessage
}