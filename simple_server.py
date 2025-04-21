#!/usr/bin/env python3
"""
Simple Flask server for the password vault
"""

import os
import logging
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Routes for testing
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Password vault backend is running'
    })

@app.route('/api/users/register', methods=['POST'])
def register():
    data = request.json
    logger.info(f"Registering user: {data.get('username')}")
    # In a real implementation, this would create a user
    return jsonify({
        'success': True,
        'userId': 1,
        'message': 'User registered successfully'
    })

@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    logger.info(f"Login attempt for user: {data.get('username')}")
    # In a real implementation, this would authenticate a user
    return jsonify({
        'success': True,
        'userId': 1,
        'sessionId': 'demo-session-id-12345',
        'vaultKey': 'demo-vault-key-abcdef1234567890',
        'message': 'Login successful'
    })

@app.route('/api/vaults', methods=['GET'])
def get_vaults():
    return jsonify({
        'success': True,
        'vaults': [
            {
                'id': 1,
                'name': 'Personal',
                'description': 'Personal passwords',
                'created_at': 1619712000
            },
            {
                'id': 2,
                'name': 'Work',
                'description': 'Work-related passwords',
                'created_at': 1619712000
            }
        ]
    })

if __name__ == "__main__":
    logger.info("Starting backend server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)