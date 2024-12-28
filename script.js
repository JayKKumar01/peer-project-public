// Clear existing cookies
document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
});

// Override document.cookie to prevent cookies from being set
Object.defineProperty(document, "cookie", {
    configurable: false,
    get: () => "",
    set: () => {
        console.warn("Attempt to set a cookie was blocked.");
    },
});

// DOM Element References
const peerIdDisplay = document.getElementById('my-peer-id');
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const connectionStatus = document.getElementById('connection-status');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesList = document.getElementById('messages');
const peerIdLog = document.getElementById('peer-id-log');

// logs for me

logMessage("fixing bug 7");

// Constants and Variables
const prefix = 'JayKKumar01-PeerJS-';
let conn;

// Utility Functions

// Generate a random 6-digit code appended to the custom prefix
function generatePeerId() {
    return prefix + Math.floor(100000 + Math.random() * 900000); // 6-digit random code
}

// Log messages with optional error styling
function logMessage(message, isError = false) {
    peerIdLog.value += `\n${message}`;
    peerIdLog.scrollTop = peerIdLog.scrollHeight; // Scroll to the latest log
    peerIdLog.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
}

// Handle incoming messages for both connected peers
function handleIncomingMessages(connection) {
    connection.on('open', () => {
        connectionStatus.textContent = 'Connected';
        logMessage('Connection established with remote peer.');
    });

    connection.on('data', (data) => {
        const li = document.createElement('li');
        li.textContent = `Peer: ${data}`;
        messagesList.appendChild(li);
        messagesList.scrollTop = messagesList.scrollHeight; // Auto-scroll to latest message
    });

    connection.on('error', (error) => logMessage(`Connection error: ${error}`, true));
    connection.on('close', () => logMessage('Connection closed.'));
}

// Initialize PeerJS
const fullPeerId = generatePeerId();
const peer = new Peer(fullPeerId);

// PeerJS Event Handlers
peer.on('open', () => {
    peerIdDisplay.textContent = fullPeerId.split('-').pop(); // Display only the 6-digit ID
    logMessage(`Your 6-digit Peer ID: ${peerIdDisplay.textContent}`);
});

peer.on('connection', (incomingConn) => {
    conn = incomingConn;
    logMessage(`Incoming connection from: ${conn.peer.split('-').pop()}`);
    handleIncomingMessages(conn);
});

peer.on('error', (error) => logMessage(`PeerJS error: ${error}`, true));
peer.on('disconnected', () => logMessage('Disconnected from PeerJS server.'));
peer.on('close', () => logMessage('Peer connection closed.'));

// Event Listeners

// Initiate connection with another peer
connectBtn.addEventListener('click', () => {
    const remotePeerId = peerIdInput.value.trim();
    if (!remotePeerId) return;

    const fullRemotePeerId = prefix + remotePeerId;
    logMessage(`Trying to connect with ID: ${remotePeerId}`);

    conn = peer.connect(fullRemotePeerId);
    handleIncomingMessages(conn);

    conn.on('error', (error) => {
        connectionStatus.textContent = 'Error connecting';
        logMessage(`Error connecting to remote peer: ${error}`, true);
    });

    conn.on('close', () => {
        connectionStatus.textContent = 'Connection closed';
        logMessage('Connection closed.');
    });
});

// Send message to the connected peer
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (!message || !conn) {
        logMessage('Message not sent. No active connection or empty message.', true);
        return;
    }

    conn.send(message);
    const li = document.createElement('li');
    li.textContent = `You: ${message}`;
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
    messageInput.value = ''; // Clear the input field
    logMessage(`Message sent to peer: ${message}`);
});
