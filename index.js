var fs = require('fs'),
    auth = require('http-auth'),
    http = require('http');
    https = require('https'),
    express = require('express'),
    socketIO = require('socket.io'),
    bodyParser = require('body-parser'),
    socketConnection = require('./server/socketConnection'),
    userController = require('./controller/userController.js'),

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
        console.log(new Date()+' : Server listening at port %d', port);
    });

    // Middlewares
    app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.json());

    try {
        app.get('/_api/user/create/:_id', userController.createUser);

        app.post('/_api/user/send_message', function(req, res){
			userController.sendMessage(req, res, io);
		});

        app.head('/_api/network', function(req, res){
            res.json({success: true});
        })

        io.on('connection', socketConnection);
    } catch(err) {
        console.log(new Date()+" : "+err);
    }

    process.on('uncaughtException', function (err) {
        console.log(new Date()+" : "+err);
        throw err;
    });
