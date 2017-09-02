
# Socket.IO as Signaling server

A Channel Service application that make use of socket.io, express, mongoose for the course.
## How to use

```
$ cd webrtc_ui
$ npm install
$ npm run liveServer / devServer
```

## While launching 

- As liveServer

```
$ sudo npm run liveServer 
```

This will make the server to run on default https port(443). 

- As devServer
```
$ sudo npm run devServer 
```

And point your browser to `http://localhost:8080`. Optionally, specify
a port by supplying the `PORT` env variable.

## Features

- Customers can connect with the registerd agents.
- Each and every agent will be registred with the portal along with their skills.
- Customers can talk to the agents regarding the problems they are facing.
