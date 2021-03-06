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
        console.log(new Date()+" :"+err);
        if(err){
            throw err;
        }
        console.log(new Date()+" : "+successResponse);
        console.log(new Date()+" : CREATED: "+id);
        response.json(successResponse);
    });
};

exports.sendMessage = ( request, response, io ) => {
    var data = request.body;
    User.findUserByUserId(data.sendTo, function(err, user){
        console.log(new Date()+" : "+data);
        if(err) throw err;

        if(user.length > 0){
            console.log(new Date()+" :IN SEND MESSAGE API","Sending To: "+user[0].userId, data.type);
            var user = user[0];
            var userId = user.userId;
            var sendTo = user.socketId;
            var message = data.message;
            var sockets = io.sockets;
            if(sendTo && sockets.connected[sendTo]){
                sockets.connected[sendTo].send(data);
                response.json(addSuccessResponse(data));
            } else {
                console.log(new Date()+" : Currently user not in connection");
                response.json(addFailureResponse(data, "Currently user not in connection"));
            }
        } else {
            console.log(new Date()+" :Throw unknown user error");
            response.json(addFailureResponse(data, "Unknow userId"));
        }
    });
}