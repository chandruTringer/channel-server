// Setup basic express server
var fs = require('fs'),
    auth = require('http-auth'),
    http = require('http');
    https = require('https'),
    express = require('express'),
    socketIO = require('socket.io'),
    bodyParser = require('body-parser'),
    socketConnection = require('./server/socketConnection'),
    userController = require('./controller/userController.js');

    // Authentication module.
    basic = auth.basic({
        realm: "tringapps Inc.",
        file: __dirname + "/htpasswd"
    }),

    // Setup basic express server

    app = express(),
    options = {
        key: fs.readFileSync('./ssl/server.key'),
        cert: fs.readFileSync('./ssl/server.crt')
    },
    {server,port} = (() => {
        if (process.argv.includes('--live')) {
            app.use(auth.connect(basic));
            return { 
                server: https.createServer(options, app),
                port: 443
            };
        } else {
            return {
                server: http.createServer(app),
                port: 8080
            };
        }
    })();
    
    var io = socketIO(server,{'pingInterval': 2000, 'pingTimeout': 30000});

    server.listen(port, function () {
        console.log('Server listening at port %d', port);
    });

    // Routing
    app.use(express.static(__dirname + '/public'));

    try {
        app.get('/_api/user/create/:_id', userController.createUser);

        app.post('/_api/user/send_message', userController.sendMessage);

        io.on('connection', socketConnection);
    } catch(err) {
        console.log(err);
        throw err;
    }

    process.on('uncaughtException', function (err) {
        console.log(err);
        throw err;
    });
