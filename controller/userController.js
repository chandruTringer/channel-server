var User = require('../models/user.js');

var addSuccessResponse = (obj) => {
    return {
        success: true,
        message: obj
    };
};

var addFailureResponse = (obj, cause) => {
    return {
        success: false,
        message: obj,
        cause: cause
    };
};

exports.createUser = ( request, response ) => {
    var id = request.params._id;
    User.addUser({userId : id}, (err, successResponse) => {
<<<<<<< HEAD
        console.log(new Date()+" :"+err);
        if(err){
            throw err;
        }
        console.log(new Date()+" : "+successResponse);
        console.log(new Date()+" : CREATED: "+id);
=======
        console.log(err);
        if(err){
            throw err;
        }
        console.log(successResponse);
        console.log("CREATED: "+id);
>>>>>>> c4c7e66602cb1dd7ce3bea830e8f92fe7d7ed253
        response.json(successResponse);
    });
};

exports.sendMessage = ( request, response, io ) => {
    var data = request.body;
    User.findUserByUserId(data.sendTo, function(err, user){
<<<<<<< HEAD
        console.log(new Date()+" : "+data);
        if(err) throw err;

        if(user.length > 0){
            console.log(new Date()+" :IN SEND MESSAGE API","Sending To: "+user[0].userId, data.type);
=======
        console.log(data);
        if(err) throw err;

        if(user.length > 0){
            console.log("IN SEND MESSAGE API","Sending To: "+user[0].userId, data.type);
>>>>>>> c4c7e66602cb1dd7ce3bea830e8f92fe7d7ed253
            var user = user[0];
            var userId = user.userId;
            var sendTo = user.socketId;
            var message = data.message;
            var sockets = io.sockets;
            if(sendTo && sockets.connected[sendTo]){
                sockets.connected[sendTo].send(data);
                response.json(addSuccessResponse(data));
            } else {
<<<<<<< HEAD
                console.log(new Date()+" : Currently user not in connection");
                response.json(addFailureResponse(data, "Currently user not in connection"));
            }
        } else {
            console.log(new Date()+" :Throw unknown user error");
=======
                console.log("Currently user not in connection");
                response.json(addFailureResponse(data, "Currently user not in connection"));
            }
        } else {
            console.log("Throw unknown user error");
>>>>>>> c4c7e66602cb1dd7ce3bea830e8f92fe7d7ed253
            response.json(addFailureResponse(data, "Unknow userId"));
        }
    });
}