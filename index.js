var fs = require('fs'),
    // auth = require('http-auth'),
    http = require('http');
    https = require('https'),
    express = require('express'),
    socketIO = require('socket.io'),
    bodyParser = require('body-parser'),
    socketConnection = require('./socket'),
    User = require('./routes/user.js'),
    moment = require('moment'),
    now = () => moment().utcOffset(330).format(),

    // Authentication module.
    // basic = auth.basic({
    //     realm: "tringapps Inc.",
    //     file: __dirname + "/htpasswd"
    // }),

    // Setup basic express server

    app = express(),
    options = {
        key: fs.readFileSync('./ssl/server.key'),
        cert: fs.readFileSync('./ssl/server.crt')
    },
    {server,port} = (() => {
        if (process.argv.includes('--live')) {
            // app.use(auth.connect(basic));
            return { 
                server: https.createServer(options, app),
                port: 443
            };
        } else {
            return {
                server: http.createServer(app),
                port: 80
            };
        }
    })();
    
    var io = socketIO(server);

    // Redirect from port http https
    // http.createServer(function (req, res) {
    //     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    //     res.end();
    // }).listen(80);

    server.listen(port, function () {
        console.log(now()+' : Server listening at port %d', port);
    });

    // Middlewares
    // app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.json());

    try {

        app.get('/', function (req, res) {
            res.send('Channel Server is up and running!');
        })

        app.get('/_api/user/create/:_id',
            User.createUser
        );

        app.get('/_api/user/delete/:_id',
            User.deleteUser
        );

        app.post('/_api/user/send_message', function(req, res){
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true);

			User.sendMessage(req, res, io);
		});

        app.head('/_api/network', function(req, res){
            res.json({success: true});
        });

        io.on('connection', socketConnection)

    } catch(err) {
        console.log(now()+" : "+err);
    }

    process.on('uncaughtException', function (err) {
        console.log(now()+" : "+err);
    });

module.exports = server;