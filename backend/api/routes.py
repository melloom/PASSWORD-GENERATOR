"""
API endpoints for the password vault
"""

import json
import time
import logging
from functools import wraps
from flask import Flask, request, jsonify, abort

from backend.auth.authentication import AuthManager
from backend.auth.mfa import MFAManager
from backend.models.user import UserModel
from backend.models.vault import VaultModel
from backend.models.entry import EntryModel
from backend.utils.security import MemoryProtection


# Create Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Globals for dependency injection
db_manager = None
auth_manager = None
mfa_manager = None
user_model = None
vault_model = None
entry_model = None


def setup_api(database_manager):
    """
    Set up the API with the provided database manager

    Args:
        database_manager: The database manager instance

    Returns:
        The Flask app
    """
    global db_manager, auth_manager, mfa_manager, user_model, vault_model, entry_model

    # Set up dependencies
    db_manager = database_manager
    auth_manager = AuthManager(db_manager)
    mfa_manager = MFAManager(db_manager)
    user_model = UserModel(db_manager)
    vault_model = VaultModel(db_manager)
    entry_model = EntryModel(db_manager)

    return app


# Authentication decorator
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Get authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Missing or invalid authorization header'}), 401

            # Extract token
            session_id = auth_header[7:]  # Remove 'Bearer ' prefix

            # Verify session
            user_id = auth_manager.verify_session(session_id)

            # Add user_id to request
            request.user_id = user_id
            request.session_id = session_id

            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': str(e)}), 401
        except Exception as e:
            logging.error(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 500

    return decorated


# Error handler
@app.errorhandler(Exception)
def handle_error(e):
    """Handle API errors"""
    logging.error(f"API error: {str(e)}")
    code = 500
    if hasattr(e, 'code'):
        code = e.code
    return jsonify({'error': str(e)}), code


# CORS support
@app.after_request
def add_cors_headers(response):
    """Add CORS headers to response"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


# Options handler for CORS
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    """Handle preflight CORS requests"""
    return '', 204


# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': int(time.time())
    })


# User routes
@app.route('/api/users/register', methods=['POST'])
def register_user():
    """Register a new user"""
    try:
        data = request.json

        # Validate input
        if not data or 'username' not in data or 'masterPassword' not in data:
            return jsonify({'error': 'Username and master password are required'}), 400

        # Register user
        user_id = auth_manager.register_user(
            data['username'],
            data['masterPassword']
        )

        return jsonify({
            'success': True,
            'userId': user_id,
            'message': 'User registered successfully'
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500


@app.route('/api/users/login', methods=['POST'])
def login_user():
    """Login a user"""
    try:
        data = request.json

        # Validate input
        if not data or 'username' not in data or 'masterPassword' not in data:
            return jsonify({'error': 'Username and master password are required'}), 400

        # Authenticate user
        user_id, vault_key, session_id, mfa_enabled = auth_manager.authenticate(
            data['username'],
            data['masterPassword']
        )

        # Convert vault key to hex for transport
        vault_key_hex = vault_key.hex()

        # Check if MFA is required
        if mfa_enabled:
            return jsonify({
                'success': True,
                'requiresMfa': True,
                'userId': user_id,
                'sessionId': session_id,
                'message': 'MFA verification required'
            }), 200

        # Return successful login
        return jsonify({
            'success': True,
            'requiresMfa': False,
            'userId': user_id,
            'sessionId': session_id,
            'vaultKey': vault_key_hex,
            'message': 'Login successful'
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500


@app.route('/api/users/mfa/verify', methods=['POST'])
def verify_mfa():
    """Verify MFA token"""
    try:
        data = request.json

        # Validate input
        if not data or 'userId' not in data or 'sessionId' not in data or 'token' not in data:
            return jsonify({'error': 'User ID, session ID, and token are required'}), 400

        # Get user info
        user = user_model.get_user_by_id(data['userId'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Verify session first
        try:
            auth_manager.verify_session(data['sessionId'])
        except ValueError:
            return jsonify({'error': 'Invalid or expired session'}), 401

        # Verify MFA token
        if mfa_manager.verify_mfa(data['userId'], data['token']):
            # Get user's master key
            # Note: In a real implementation, we'd need the master password again
            # but for simplicity, we'll assume it's cached in the session
            # This is a security compromise made for the example

            # Get user's encryption details
            user_data = user_model.get_user_encryption_data(data['userId'])

            # We'd normally derive the key here, but for the example
            # we'll just return a success message
            # In real life, never reveal the key via API

            return jsonify({
                'success': True,
                'message': 'MFA verification successful',
                'vaultKey': 'VAULT_KEY_WOULD_BE_HERE_IN_REAL_IMPLEMENTATION'
            }), 200
        else:
            return jsonify({'error': 'Invalid MFA token'}), 401
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        logging.error(f"MFA verification error: {str(e)}")
        return jsonify({'error': 'MFA verification failed'}), 500


@app.route('/api/users/logout', methods=['POST'])
@require_auth
def logout_user():
    """Logout a user"""
    try:
        # End session
        auth_manager.end_session(request.session_id)

        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
    except Exception as e:
        logging.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed'}), 500


@app.route('/api/users/password', methods=['PUT'])
@require_auth
def change_password():
    """Change master password"""
    try:
        data = request.json

        # Validate input
        if not data or 'currentPassword' not in data or 'newPassword' not in data:
            return jsonify({'error': 'Current and new passwords are required'}), 400

        # Change password
        auth_manager.change_master_password(
            request.user_id,
            data['currentPassword'],
            data['newPassword']
        )

        return jsonify({
            'success': True,
            'message': 'Password changed successfully. Please login again.'
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Password change error: {str(e)}")
        return jsonify({'error': 'Password change failed'}), 500


# MFA routes
@app.route('/api/users/mfa/setup', methods=['GET'])
@require_auth
def setup_mfa():
    """Set up MFA for a user"""
    try:
        # Get user
        user = user_model.get_user_by_id(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if MFA is already enabled
        if user.get('mfa_enabled'):
            return jsonify({'error': 'MFA is already enabled for this user'}), 400

        # Set up TOTP
        mfa_data = mfa_manager.setup_totp(request.user_id, user['username'])

        return jsonify({
            'success': True,
            'secret': mfa_data['secret'],
            'qrCode': mfa_data['qr_code'],
            'uri': mfa_data['uri'],
            'message': 'MFA setup initiated. Verify with token to enable.'
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"MFA setup error: {str(e)}")
        return jsonify({'error': 'MFA setup failed'}), 500


@app.route('/api/users/mfa/enable', methods=['POST'])
@require_auth
def enable_mfa():
    """Enable MFA after setup"""
    try:
        data = request.json

        # Validate input
        if not data or 'secret' not in data or 'token' not in data:
            return jsonify({'error': 'Secret and token are required'}), 400

        # Enable MFA
        mfa_manager.enable_mfa(request.user_id, data['secret'], data['token'])

        return jsonify({
            'success': True,
            'message': 'MFA enabled successfully'
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"MFA enable error: {str(e)}")
        return jsonify({'error': 'Failed to enable MFA'}), 500


@app.route('/api/users/mfa/disable', methods=['POST'])
@require_auth
def disable_mfa():
    """Disable MFA"""
    try:
        data = request.json

        # Validate input
        if not data or 'token' not in data:
            return jsonify({'error': 'Token is required'}), 400

        # Verify current token before disabling
        if mfa_manager.verify_mfa(request.user_id, data['token']):
            # Disable MFA
            mfa_manager.disable_mfa(request.user_id)

            return jsonify({
                'success': True,
                'message': 'MFA disabled successfully'
            }), 200
        else:
            return jsonify({'error': 'Invalid token'}), 401
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"MFA disable error: {str(e)}")
        return jsonify({'error': 'Failed to disable MFA'}), 500


# Vault routes
@app.route('/api/vaults', methods=['GET'])
@require_auth
def get_vaults():
    """Get all vaults for a user"""
    try:
        # Get vaults
        vaults = vault_model.get_vaults(request.user_id)

        return jsonify({
            'success': True,
            'vaults': vaults
        }), 200
    except Exception as e:
        logging.error(f"Get vaults error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve vaults'}), 500


@app.route('/api/vaults', methods=['POST'])
@require_auth
def create_vault():
    """Create a new vault"""
    try:
        data = request.json

        # Validate input
        if not data or 'name' not in data:
            return jsonify({'error': 'Vault name is required'}), 400

        # Create vault
        vault_id = vault_model.create_vault(
            request.user_id,
            data['name'],
            data.get('description', '')
        )

        return jsonify({
            'success': True,
            'vaultId': vault_id,
            'message': 'Vault created successfully'
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Create vault error: {str(e)}")
        return jsonify({'error': 'Failed to create vault'}), 500


@app.route('/api/vaults/<int:vault_id>', methods=['GET'])
@require_auth
def get_vault(vault_id):
    """Get a specific vault"""
    try:
        # Check vault ownership
        if not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Vault not found or access denied'}), 404

        # Get vault
        vault = vault_model.get_vault(vault_id)

        return jsonify({
            'success': True,
            'vault': vault
        }), 200
    except Exception as e:
        logging.error(f"Get vault error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve vault'}), 500


@app.route('/api/vaults/<int:vault_id>', methods=['PUT'])
@require_auth
def update_vault(vault_id):
    """Update a vault"""
    try:
        data = request.json

        # Check vault ownership
        if not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Vault not found or access denied'}), 404

        # Update vault
        vault_model.update_vault(
            vault_id,
            data.get('name'),
            data.get('description'),
            data.get('icon'),
            data.get('color')
        )

        return jsonify({
            'success': True,
            'message': 'Vault updated successfully'
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Update vault error: {str(e)}")
        return jsonify({'error': 'Failed to update vault'}), 500


@app.route('/api/vaults/<int:vault_id>', methods=['DELETE'])
@require_auth
def delete_vault(vault_id):
    """Delete a vault"""
    try:
        # Check vault ownership
        if not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Vault not found or access denied'}), 404

        # Delete vault
        vault_model.delete_vault(vault_id)

        return jsonify({
            'success': True,
            'message': 'Vault deleted successfully'
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Delete vault error: {str(e)}")
        return jsonify({'error': 'Failed to delete vault'}), 500


# Password entry routes
@app.route('/api/vaults/<int:vault_id>/entries', methods=['GET'])
@require_auth
def get_entries(vault_id):
    """Get all entries in a vault"""
    try:
        # Check vault ownership
        if not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Vault not found or access denied'}), 404

        # Get entries
        entries = entry_model.get_entries(vault_id)

        return jsonify({
            'success': True,
            'entries': entries
        }), 200
    except Exception as e:
        logging.error(f"Get entries error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve entries'}), 500


@app.route('/api/vaults/<int:vault_id>/entries', methods=['POST'])
@require_auth
def create_entry(vault_id):
    """Create a new password entry"""
    try:
        data = request.json

        # Check vault ownership
        if not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Vault not found or access denied'}), 404

        # Validate input
        if not data or 'title' not in data or 'password' not in data:
            return jsonify({'error': 'Title and password are required'}), 400

        # Create entry
        entry_id = entry_model.create_entry(
            vault_id,
            data['title'],
            data.get('username', ''),
            data['password'],
            data.get('url', ''),
            data.get('notes', ''),
            data.get('category', ''),
            data.get('tags', ''),
            data.get('icon', ''),
            data.get('favorite', False),
            data.get('expires_at')
        )

        return jsonify({
            'success': True,
            'entryId': entry_id,
            'message': 'Entry created successfully'
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Create entry error: {str(e)}")
        return jsonify({'error': 'Failed to create entry'}), 500


@app.route('/api/entries/<int:entry_id>', methods=['GET'])
@require_auth
def get_entry(entry_id):
    """Get a specific password entry"""
    try:
        # Check entry ownership
        vault_id = entry_model.get_vault_id_for_entry(entry_id)
        if not vault_id or not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Entry not found or access denied'}), 404

        # Get entry
        entry = entry_model.get_entry(entry_id)

        return jsonify({
            'success': True,
            'entry': entry
        }), 200
    except Exception as e:
        logging.error(f"Get entry error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve entry'}), 500


@app.route('/api/entries/<int:entry_id>', methods=['PUT'])
@require_auth
def update_entry(entry_id):
    """Update a password entry"""
    try:
        data = request.json

        # Check entry ownership
        vault_id = entry_model.get_vault_id_for_entry(entry_id)
        if not vault_id or not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Entry not found or access denied'}), 404

        # Update entry
        entry_model.update_entry(
            entry_id,
            data.get('title'),
            data.get('username'),
            data.get('password'),
            data.get('url'),
            data.get('notes'),
            data.get('category'),
            data.get('tags'),
            data.get('icon'),
            data.get('favorite'),
            data.get('expires_at')
        )

        return jsonify({
            'success': True,
            'message': 'Entry updated successfully'
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Update entry error: {str(e)}")
        return jsonify({'error': 'Failed to update entry'}), 500


@app.route('/api/entries/<int:entry_id>', methods=['DELETE'])
@require_auth
def delete_entry(entry_id):
    """Delete a password entry"""
    try:
        # Check entry ownership
        vault_id = entry_model.get_vault_id_for_entry(entry_id)
        if not vault_id or not vault_model.check_vault_ownership(request.user_id, vault_id):
            return jsonify({'error': 'Entry not found or access denied'}), 404

        # Delete entry
        entry_model.delete_entry(entry_id)

        return jsonify({
            'success': True,
            'message': 'Entry deleted successfully'
        }), 200
    except Exception as e:
        logging.error(f"Delete entry error: {str(e)}")
        return jsonify({'error': 'Failed to delete entry'}), 500


# Search endpoints
@app.route('/api/search', methods=['GET'])
@require_auth
def search_entries():
    """Search for password entries"""
    try:
        # Get query parameter
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        # Search entries
        results = entry_model.search_entries(request.user_id, query)

        return jsonify({
            'success': True,
            'results': results
        }), 200
    except Exception as e:
        logging.error(f"Search error: {str(e)}")
        return jsonify({'error': 'Search failed'}), 500


# Backup endpoints
@app.route('/api/backup', methods=['POST'])
@require_auth
def create_backup():
    """Create a database backup"""
    try:
        # Only allow admin users to create backups
        user = user_model.get_user_by_id(request.user_id)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Permission denied'}), 403

        # Create backup
        if db_manager.create_backup("manual"):
            return jsonify({
                'success': True,
                'message': 'Backup created successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to create backup'}), 500
    except Exception as e:
        logging.error(f"Backup error: {str(e)}")
        return jsonify({'error': 'Backup failed'}), 500


# For development use only
if __name__ == '__main__':
    from backend.db.database import DatabaseManager
    db_manager = DatabaseManager()
    setup_api(db_manager)
    app.run(debug=True, host='127.0.0.1', port=5001)