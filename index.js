
const PythonShell = require('python-shell')['PythonShell'];
const static = require('node-static');
const http = require('http');
const fs = require('fs');

var static_serve = new(static.Server)('./static');

const server = http.createServer(function (req, res) {
    static_serve.serve(req, res);
})

const io = require('socket.io')(server);
io.on('connection', (socket) => {
    console.log("Socket Connected"); 
    console.log("CREDS: ", process.env.CREDS);

    fs.writeFile('creds.json', process.env.CREDS);
    let pyshell = new PythonShell('run.py');


    socket.on('disconnect', () =>  {
        console.log("Socket Disconnected")
        pyshell.end();
    });

    socket.on('command_entered', (command) =>  {
        console.log("Socket Command: ", command)
        pyshell.send(command);
    });


    // sends a message to the Python script via stdin

    pyshell.on('message',  (message) => {
        // received a message sent from the Python script (a simple "print" statement)
        console.log('process Out: ', message);
        socket.emit("console_output", "Out: " + message);
    });

    pyshell.on('close', () => {
        console.log('Process ended');
        socket.emit("console_output", "Process ended: ");
    });

    pyshell.on('error', (message) => {
        console.log('Process error:', message);
        socket.emit("console_output", "Process error: " + message);
    });

});


console.log('Starting node on port', process.env.PORT);
server.listen(process.env.PORT);
