const WebSocket = require('ws');
const net = require('net');

const WS_PORT = 8080;
const WATERING_HOST = '192.168.200.103';
const WATERING_PORT = 9898;
const TCP_TIMEOUT = 5000; // 5 second timeout for TCP connections

const wss = new WebSocket.Server({ port: WS_PORT });

console.log(`WebSocket server started on port ${WS_PORT}`);

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    let tcpSocket = null;

    ws.on('message', (message) => {
        const command = message.toString();
        console.log(`Received command: ${command}`);

        // Create new TCP connection
        tcpSocket = new net.Socket();
        tcpSocket.setTimeout(TCP_TIMEOUT);

        // Handle TCP socket errors
        tcpSocket.on('error', (error) => {
            console.error('TCP Socket error:', error);
            ws.send(JSON.stringify({
                status: 'NOK',
                data: `Connection error: ${error.message}`
            }));
            tcpSocket.destroy();
        });

        // Handle TCP timeout
        tcpSocket.on('timeout', () => {
            console.error('TCP Socket timeout');
            ws.send(JSON.stringify({
                status: 'NOK',
                data: 'Connection timeout'
            }));
            tcpSocket.destroy();
        });

        let buffer = '';
        
        // Handle data from TCP server
        tcpSocket.on('data', (data) => {
            buffer += data.toString();
            console.log('Received data:', buffer);

            // Check if we have a complete response
            if (buffer.includes('OK') || buffer.includes('NOK')) {
                ws.send(JSON.stringify({
                    status: buffer.startsWith('OK') ? 'OK' : 'NOK',
                    data: buffer.trim()
                }));
                tcpSocket.end();
            }
        });

        // Connect to watering server
        tcpSocket.connect(WATERING_PORT, WATERING_HOST, () => {
            console.log('Connected to watering server');
            tcpSocket.write(command + '\n');
        });
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        if (tcpSocket) {
            tcpSocket.destroy();
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (tcpSocket) {
            tcpSocket.destroy();
        }
    });
}); 