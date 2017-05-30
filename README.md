
# Socket.IO as Signaling server

A simple webrtc customer service care app using socket.io

## How to use

```
$ cd webrtc
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

- Customers can connect with the registered agents.
- Each and every agent will be registered with the portal along with their skills.
- Customers can talk to the agents regarding the problems they are facing.
