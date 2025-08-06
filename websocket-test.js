// Simple WebSocket test to verify the connection works
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = function () {
    console.log('✅ Test WebSocket connected to ws://localhost:3001/ws');
};

ws.onmessage = function (event) {
    console.log('📨 Test WebSocket received:', event.data);
};

ws.onerror = function (error) {
    console.error('❌ Test WebSocket error:', error);
};

ws.onclose = function () {
    console.log('🔌 Test WebSocket disconnected');
};

// Send a test message after connection
setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
        console.log('📤 Sending test message');
        ws.send(JSON.stringify({
            event: 'test',
            data: { message: 'Hello from test client' }
        }));
    }
}, 1000);

// Close after 5 seconds
setTimeout(() => {
    console.log('🔚 Closing test connection');
    ws.close();
}, 5000);
