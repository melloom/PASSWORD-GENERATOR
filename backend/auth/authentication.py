"""
Authentication handlers for the password vault
"""

import time
import uuid
import logging
import secrets
import base64
import bcrypt
from datetime import datetime, timedelta

from backend.crypto.encryption import EncryptionManager
from backend.crypto.key_manager import KeyManager
from backend.config import AUTH
from backend.db.database import DatabaseManager


class AuthManager:
    """Manager for authentication operations"""

    def __init__(self, db_manager=None, encryption_manager=None, key_manager=None):
        """Initialize the authentication manager"""
        self.logger = logging.getLogger(__name__)
        self.db_manager = db_manager or DatabaseManager()
        self.encryption_manager = encryption_manager or EncryptionManager()
        self.key_manager = key_manager or KeyManager(self.encryption_manager)

    def register_user(self, username, master_password):
        """
        Register a new user

        Args:
            username (str): The username
            master_password (str): The master password

        Returns:
            int: The user ID if successful

        Raises:
            ValueError: If registration fails
        """
        try:
            # Validate password
            if len(master_password) < AUTH['min_password_length']:
                raise ValueError(f"Password must be at least {AUTH['min_password_length']} characters long")

            # Check if username exists
            existing_user = self.db_manager.execute_query(
                "SELECT id FROM users WHERE username = ?",
                (username,),
                fetchone=True
            )

            if existing_user:
                raise ValueError("Username already exists")

            # Generate a salt for password hashing
            password_salt = bcrypt.gensalt()

            # Hash the master password
            password_hash = bcrypt.hashpw(master_password.encode('utf-8'), password_salt)

            # Create encryption keys
            key_data = self.key_manager.create_user_keys(master_password)

            # Get current timestamp
            current_time = int(time.time())

            # Insert user into database
            user_id = self.db_manager.execute_query(
                """
                INSERT INTO users (
                    username, password_hash, salt, encryption_key, key_salt,
                    created_at, updated_at, password_changed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    username,
                    password_hash.decode('utf-8'),
                    password_salt.decode('utf-8'),
                    key_data['encrypted_key'],
                    key_data['key_salt'],
                    current_time,
                    current_time,
                    current_time
                )
            )

            # Create default vault for user
            self.db_manager.execute_query(
                """
                INSERT INTO vaults (
                    user_id, name, description, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    "Default",
                    "Default vault for passwords",
                    current_time,
                    current_time
                )
            )

            # Log the action
            self._log_action(user_id, "register", "User registered")

            return user_id
        except Exception as e:
            self.logger.error(f"Registration error: {str(e)}")
            raise ValueError(f"Registration failed: {str(e)}")

    def authenticate(self, username, master_password):
        """
        Authenticate a user

        Args:
            username (str): The username
            master_password (str): The master password

        Returns:
            tuple: (user_id, vault_key, session_id) if authentication is successful

        Raises:
            ValueError: If authentication fails
        """
        try:
            # Get user from database
            user = self.db_manager.execute_query(
                """
                SELECT id, password_hash, salt, encryption_key, key_salt,
                       mfa_enabled, failed_attempts, locked_until
                FROM users
                WHERE username = ?
                """,
                (username,),
                fetchone=True
            )

            if not user:
                # Use constant time comparison to prevent timing attacks
                # Compare against a dummy hash to ensure timing is constant
                dummy_salt = bcrypt.gensalt()
                bcrypt.hashpw(master_password.encode('utf-8'), dummy_salt)
                raise ValueError("Invalid username or password")

            # Check if account is locked
            current_time = int(time.time())
            if user['locked_until'] and current_time < user['locked_until']:
                # Calculate remaining lockout time
                remaining_time = user['locked_until'] - current_time
                remaining_minutes = remaining_time // 60 + (1 if remaining_time % 60 > 0 else 0)
                raise ValueError(f"Account is locked. Try again in {remaining_minutes} minutes")

            # Verify password
            password_hash = user['password_hash']
            password_salt = user['salt']

            # Convert string hashes back to bytes
            if isinstance(password_hash, str):
                password_hash = password_hash.encode('utf-8')
            if isinstance(password_salt, str):
                password_salt = password_salt.encode('utf-8')

            # Check if password matches
            if not bcrypt.checkpw(master_password.encode('utf-8'), password_hash):
                # Increment failed attempts
                new_failed_attempts = user['failed_attempts'] + 1

                # Check if account should be locked
                if new_failed_attempts >= AUTH['max_failed_attempts']:
                    # Lock account
                    lockout_until = current_time + AUTH['lockout_period']
                    self.db_manager.execute_query(
                        """
                        UPDATE users
                        SET failed_attempts = ?, last_failed_attempt = ?, locked_until = ?
                        WHERE id = ?
                        """,
                        (0, current_time, lockout_until, user['id'])
                    )

                    # Log the action
                    self._log_action(user['id'], "login_failure", f"Account locked after {new_failed_attempts} failed attempts")

                    raise ValueError(f"Account locked due to {new_failed_attempts} failed login attempts")
                else:
                    # Update failed attempts
                    self.db_manager.execute_query(
                        """
                        UPDATE users
                        SET failed_attempts = ?, last_failed_attempt = ?
                        WHERE id = ?
                        """,
                        (new_failed_attempts, current_time, user['id'])
                    )

                    # Log the action
                    self._log_action(user['id'], "login_failure", f"Failed login attempt ({new_failed_attempts})")

                    raise ValueError("Invalid username or password")

            # Reset failed attempts on successful login
            if user['failed_attempts'] > 0:
                self.db_manager.execute_query(
                    """
                    UPDATE users
                    SET failed_attempts = 0, locked_until = NULL
                    WHERE id = ?
                    """,
                    (user['id'],)
                )

            # Get the vault key
            vault_key = self.key_manager.get_vault_key(
                master_password,
                user['key_salt'],
                user['encryption_key']
            )

            # Create a session
            session_id = self._create_session(user['id'])

            # Update last login time
            self.db_manager.execute_query(
                """
                UPDATE users
                SET last_login = ?
                WHERE id = ?
                """,
                (current_time, user['id'])
            )

            # Log the action
            self._log_action(user['id'], "login", "User logged in successfully")

            return user['id'], vault_key, session_id, user['mfa_enabled']
        except ValueError as e:
            # Re-raise ValueError for authentication errors
            raise
        except Exception as e:
            self.logger.error(f"Authentication error: {str(e)}")
            raise ValueError("Authentication failed")

    def verify_session(self, session_id):
        """
        Verify a session is valid

        Args:
            session_id (str): The session ID

        Returns:
            int: The user ID if the session is valid

        Raises:
            ValueError: If the session is invalid or expired
        """
        try:
            # Get session from database
            current_time = int(time.time())
            session = self.db_manager.execute_query(
                """
                SELECT user_id, expires_at
                FROM sessions
                WHERE id = ?
                """,
                (session_id,),
                fetchone=True
            )

            if not session:
                raise ValueError("Invalid session")

            # Check if session has expired
            if current_time > session['expires_at']:
                # Remove expired session
                self.db_manager.execute_query(
                    "DELETE FROM sessions WHERE id = ?",
                    (session_id,)
                )
                raise ValueError("Session expired")

            # Extend session if needed
            if session['expires_at'] - current_time < (AUTH['session_timeout'] // 2):
                # Update session expiration
                new_expires_at = current_time + AUTH['session_timeout']
                self.db_manager.execute_query(
                    """
                    UPDATE sessions
                    SET expires_at = ?
                    WHERE id = ?
                    """,
                    (new_expires_at, session_id)
                )

            return session['user_id']
        except Exception as e:
            self.logger.error(f"Session verification error: {str(e)}")
            raise ValueError("Session verification failed")

    def end_session(self, session_id):
        """
        End a session

        Args:
            session_id (str): The session ID

        Returns:
            bool: True if the session was ended successfully
        """
        try:
            # Get user ID for logging
            session = self.db_manager.execute_query(
                "SELECT user_id FROM sessions WHERE id = ?",
                (session_id,),
                fetchone=True
            )

            if session:
                user_id = session['user_id']

                # Delete session
                self.db_manager.execute_query(
                    "DELETE FROM sessions WHERE id = ?",
                    (session_id,)
                )

                # Log the action
                self._log_action(user_id, "logout", "User logged out")

                return True
            return False
        except Exception as e:
            self.logger.error(f"Error ending session: {str(e)}")
            return False

    def change_master_password(self, user_id, current_password, new_password):
        """
        Change a user's master password

        Args:
            user_id (int): The user ID
            current_password (str): The current master password
            new_password (str): The new master password

        Returns:
            bool: True if the password was changed successfully

        Raises:
            ValueError: If the password change fails
        """
        try:
            # Validate new password
            if len(new_password) < AUTH['min_password_length']:
                raise ValueError(f"New password must be at least {AUTH['min_password_length']} characters long")

            # Get user data
            user = self.db_manager.execute_query(
                """
                SELECT password_hash, salt, encryption_key, key_salt
                FROM users
                WHERE id = ?
                """,
                (user_id,),
                fetchone=True
            )

            if not user:
                raise ValueError("User not found")

            # Verify current password
            password_hash = user['password_hash']
            if isinstance(password_hash, str):
                password_hash = password_hash.encode('utf-8')

            if not bcrypt.checkpw(current_password.encode('utf-8'), password_hash):
                raise ValueError("Current password is incorrect")

            # Check password history if enabled
            if AUTH['password_history'] > 0:
                # Get password history
                password_history = self.db_manager.execute_query(
                    """
                    SELECT password_hash
                    FROM password_history
                    WHERE user_id = ?
                    ORDER BY changed_at DESC
                    LIMIT ?
                    """,
                    (user_id, AUTH['password_history'])
                )

                # Check if new password matches any in history
                for history_entry in password_history:
                    history_hash = history_entry['password_hash']
                    if isinstance(history_hash, str):
                        history_hash = history_hash.encode('utf-8')

                    if bcrypt.checkpw(new_password.encode('utf-8'), history_hash):
                        raise ValueError(f"New password cannot match any of your last {AUTH['password_history']} passwords")

            # Generate new salt for password hashing
            new_password_salt = bcrypt.gensalt()

            # Hash the new password
            new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), new_password_salt)

            # Rotate encryption keys
            new_key_data = self.key_manager.rotate_keys(
                current_password,
                new_password,
                user['key_salt'],
                user['encryption_key']
            )

            # Start a transaction
            conn = self.db_manager.get_connection()
            try:
                cursor = conn.cursor()

                # Add old password to history
                current_time = int(time.time())
                cursor.execute(
                    """
                    INSERT INTO password_history (
                        user_id, password_hash, changed_at
                    ) VALUES (?, ?, ?)
                    """,
                    (user_id, user['password_hash'], current_time)
                )

                # Update user with new password and keys
                cursor.execute(
                    """
                    UPDATE users
                    SET password_hash = ?, salt = ?, encryption_key = ?, key_salt = ?,
                        updated_at = ?, password_changed_at = ?
                    WHERE id = ?
                    """,
                    (
                        new_password_hash.decode('utf-8'),
                        new_password_salt.decode('utf-8'),
                        new_key_data['encrypted_key'],
                        new_key_data['key_salt'],
                        current_time,
                        current_time,
                        user_id
                    )
                )

                # Clean up old password history if needed
                if AUTH['password_history'] > 0:
                    cursor.execute(
                        """
                        DELETE FROM password_history
                        WHERE user_id = ? AND id NOT IN (
                            SELECT id FROM password_history
                            WHERE user_id = ?
                            ORDER BY changed_at DESC
                            LIMIT ?
                        )
                        """,
                        (user_id, user_id, AUTH['password_history'])
                    )

                # End all sessions for this user
                cursor.execute(
                    "DELETE FROM sessions WHERE user_id = ?",
                    (user_id,)
                )

                # Commit transaction
                conn.commit()

                # Log the action
                self._log_action(user_id, "password_change", "Master password changed")

                return True
            except Exception as e:
                conn.rollback()
                raise
        except ValueError as e:
            # Re-raise specific errors
            raise
        except Exception as e:
            self.logger.error(f"Error changing master password: {str(e)}")
            raise ValueError("Failed to change master password")

    def _create_session(self, user_id, ip_address=None, user_agent=None):
        """
        Create a new session

        Args:
            user_id (int): The user ID
            ip_address (str, optional): The IP address
            user_agent (str, optional): The user agent

        Returns:
            str: The session ID
        """
        try:
            # Generate a session ID
            session_id = str(uuid.uuid4())

            # Calculate expiration
            current_time = int(time.time())
            expires_at = current_time + AUTH['session_timeout']

            # Insert session into database
            self.db_manager.execute_query(
                """
                INSERT INTO sessions (
                    id, user_id, created_at, expires_at, ip_address, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (session_id, user_id, current_time, expires_at, ip_address, user_agent)
            )

            return session_id
        except Exception as e:
            self.logger.error(f"Error creating session: {str(e)}")
            raise ValueError("Failed to create session")

    def _log_action(self, user_id, action, details=None, ip_address=None):
        """
        Log an action to the audit log

        Args:
            user_id (int): The user ID
            action (str): The action type
            details (str, optional): Additional details
            ip_address (str, optional): The IP address
        """
        try:
            current_time = int(time.time())
            self.db_manager.execute_query(
                """
                INSERT INTO audit_log (
                    user_id, action, details, ip_address, timestamp
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (user_id, action, details, ip_address, current_time)
            )
        except Exception as e:
            self.logger.error(f"Error logging action: {str(e)}")