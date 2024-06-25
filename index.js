import express from 'express';
import httpProxy from 'http-proxy';
import http from 'http';

// Initialize Express
const app = express();
app.use(express.json()); // For parsing application/json

// Create a proxy server with http-proxy
const serverProxy = httpProxy.createProxyServer();

// Basic authentication credentials
const username = 'anthony';
const password = 'anthony';
const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

// Proxy server request event handling
serverProxy.on('proxyReq', function(proxyReq, req, res) {
    // Set the Basic Auth header
    proxyReq.setHeader('Authorization', basicAuth);

    // Handle the body of the request if present
    if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
});

// Setup endpoint to handle all dashboard related requests
app.all('/dashboard(/*)?', (req, res) => {
    console.log("Accessing Dashboard - User-Agent:", req.headers['user-agent']); // Log User-Agent
    console.log("Rewritten URL:", req.url);
    serverProxy.web(req, res, {
        target: 'http://localhost:80',
        prependPath: false
    });
});

// Proxy error handling
serverProxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
});

// Create HTTP server and listen on a port
const server = http.createServer(app);
const PORT = 3002; // Set your port number
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
