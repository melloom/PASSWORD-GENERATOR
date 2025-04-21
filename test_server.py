#!/usr/bin/env python3
"""
Simple HTTP server for the password vault
"""

import http.server
import socketserver
import json

# Set the port
PORT = 5001  # Using 5001 to avoid conflicts

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'status': 'ok',
                'message': 'Password vault server is running'
            }

            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(post_data)
        except json.JSONDecodeError:
            data = {}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path == '/api/users/register':
            response = {
                'success': True,
                'userId': 1,
                'message': 'User registered successfully'
            }
        elif self.path == '/api/users/login':
            response = {
                'success': True,
                'userId': 1,
                'sessionId': 'demo-session-id-12345',
                'vaultKey': 'demo-vault-key-abcdef1234567890',
                'requiresMfa': False,
                'message': 'Login successful'
            }
        else:
            response = {
                'success': False,
                'message': 'Unknown endpoint'
            }

        self.wfile.write(json.dumps(response).encode('utf-8'))

def main():
    with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

if __name__ == '__main__':
    main()