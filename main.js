const { app, BrowserWindow } = require('electron');

const fs = require('fs');
const path = require('path');
const http = require("http");
const url = require("url");

const host = '0.0.0.0';
const port = 80;

const { Server } = require("socket.io");
const io = new Server({ /* options */ });

const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/x-font-ttf',
  };

const FrmMain = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences:{
        nodeIntegration: true,
      }
    })
    win.loadFile('main.html');
}

app.whenReady().then(() => {
    FrmMain()
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0){
            FrmMain();
        }     
    })
});

io.on("connection", (socket) => {  
    socket.emit("log", "Conexão de: " + socket.handshake.address);
    socket.on("alertar",function(data){
        socket.broadcast.emit('alertar',data);
     });
});
io.listen(3000);

const requestListener = function (req, res) {

    const parsedUrl = url.parse(req.url);

    const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname, sanitizePath);

    fs.exists(pathname, function (exist) {
        if(!exist) {
        
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
        }

       // if (fs.statSync(pathname).isDirectory()) {
        //    pathname += 'painel.html';
        //}

        if(pathname == "/"){
            pathname += 'index.html';
        }
        

        fs.readFile(pathname, function(err, data){
        if(err){
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
        } else {
            const ext = path.parse(pathname).ext;
            res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
            res.end(data);
        }
        });
    });


};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Servidor web em http://${host}:${port}`);
});