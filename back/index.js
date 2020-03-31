const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const {nanoid} = require('nanoid');
const app = express();
const port = 8000;

expressWs(app);
app.use(cors());
app.use(express.json());
const connections = {};
const circles = [];
app.ws('/paint', function (ws, req) {
    console.log('client connected');

    const id = nanoid();
    connections[id] = ws;

    console.log('total clients', Object.keys(connections).length);

    ws.send(JSON.stringify({
        type: 'LAST_CIRCLES',
        circles
    }));

    ws.on('message', (msg) => {
        console.log('Incoming message from ', id, ': ' , msg);

        const parsed = JSON.parse(msg);
        switch (parsed.type) {
            case 'CREATE_CIRCLE':
                const newCircle = {
                    x: parsed.x,
                    y: parsed.y
                };
                Object.keys(connections).forEach(c => {
                    connections[c].send(JSON.stringify({
                        type: 'CREATE_CIRCLE',
                        ...newCircle
                    }));
                });
                circles.push(newCircle);
                if(circles.length > 30){
                    circles.splice(0, 1);
                }
                break;
            default:
                console.log('NO TYPE: ', parsed.type);
        }

    });

    ws.on('close', (msg) => {
        console.log('client disconnected', id);

        delete connections[id];
    })
});

app.listen(port, () => {
    console.log('Server is running on port: ', port);
});

