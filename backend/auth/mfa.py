"""
Multi-factor authentication handlers for the password vault
"""

import time
import logging
import base64
import secrets
import qrcode
import io
from urllib.parse import quote

# Use pyotp if available
try:
    import pyotp
    PYOTP_AVAILABLE = True
except ImportError:
    PYOTP_AVAILABLE = False

from backend.db.database import DatabaseManager


class MFAManager:
    """Manager for multi-factor authentication operations"""

    def __init__(self, db_manager=None):
        """Initialize the MFA manager"""
        self.logger = logging.getLogger(__name__)
        self.db_manager = db_manager or DatabaseManager()

    def setup_totp(self, user_id, username):
        """
        Set up TOTP (Time-based One-Time Password) for a user

        Args:
            user_id (int): The user ID
            username (str): The username

        Returns:
            dict: Dictionary containing setup information
        """
        try:
            if not PYOTP_AVAILABLE:
                raise ValueError("TOTP authentication is not available")

            # Generate a random secret
            secret = pyotp.random_base32()

            # Create TOTP object
            totp = pyotp.TOTP(secret)

            # Generate URI for QR code
            provisioning_uri = totp.provisioning_uri(
                name=username,
                issuer_name="Military-Grade Password Vault"
            )

            # Generate QR code image
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(provisioning_uri)
            qr.make(fit=True)

            # Create QR code image
            img = qr.make_image(fill_color="black", back_color="white")

            # Save image to bytes buffer
            buffer = io.BytesIO()
            img.save(buffer)

            # Encode image as base64 for display
            qr_code_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

            return {
                'secret': secret,
                'qr_code': qr_code_base64,
                'uri': provisioning_uri
            }
        except Exception as e:
            self.logger.error(f"Error setting up TOTP: {str(e)}")
            raise ValueError("Failed to set up TOTP authentication")

    def verify_totp(self, secret, token):
        """
        Verify a TOTP token

        Args:
            secret (str): The TOTP secret
            token (str): The TOTP token to verify

        Returns:
            bool: True if the token is valid
        """
        try:
            if not PYOTP_AVAILABLE:
                raise ValueError("TOTP authentication is not available")

            # Create TOTP object
            totp = pyotp.TOTP(secret)

            # Verify token
            return totp.verify(token)
        except Exception as e:
            self.logger.error(f"Error verifying TOTP: {str(e)}")
            return False

    def enable_mfa(self, user_id, secret, token):
        """
        Enable MFA for a user after verifying initial token

        Args:
            user_id (int): The user ID
            secret (str): The TOTP secret
            token (str): The TOTP token to verify

        Returns:
            bool: True if MFA was enabled successfully
        """
        try:
            # First verify the token
            if not self.verify_totp(secret, token):
                raise ValueError("Invalid verification code")

            # Update user record to enable MFA
            self.db_manager.execute_query(
                """
                UPDATE users
                SET mfa_enabled = 1, mfa_secret = ?
                WHERE id = ?
                """,
                (secret, user_id)
            )

            # Log the action
            self._log_action(user_id, "mfa_enabled", "MFA enabled for user")

            return True
        except ValueError as e:
            # Re-raise specific errors
            raise
        except Exception as e:
            self.logger.error(f"Error enabling MFA: {str(e)}")
            raise ValueError("Failed to enable MFA")

    def disable_mfa(self, user_id):
        """
        Disable MFA for a user

        Args:
            user_id (int): The user ID

        Returns:
            bool: True if MFA was disabled successfully
        """
        try:
            # Update user record to disable MFA
            self.db_manager.execute_query(
                """
                UPDATE users
                SET mfa_enabled = 0, mfa_secret = NULL
                WHERE id = ?
                """,
                (user_id,)
            )

            # Log the action
            self._log_action(user_id, "mfa_disabled", "MFA disabled for user")

            return True
        except Exception as e:
            self.logger.error(f"Error disabling MFA: {str(e)}")
            raise ValueError("Failed to disable MFA")

    def verify_mfa(self, user_id, token):
        """
        Verify MFA token during login

        Args:
            user_id (int): The user ID
            token (str): The TOTP token to verify

        Returns:
            bool: True if verification is successful
        """
        try:
            # Get user's MFA details
            user = self.db_manager.execute_query(
                """
                SELECT mfa_secret
                FROM users
                WHERE id = ? AND mfa_enabled = 1
                """,
                (user_id,),
                fetchone=True
            )

            if not user:
                raise ValueError("MFA is not enabled for this user")

            # Verify token
            return self.verify_totp(user['mfa_secret'], token)
        except ValueError as e:
            # Re-raise specific errors
            raise
        except Exception as e:
            self.logger.error(f"Error verifying MFA: {str(e)}")
            raise ValueError("Failed to verify MFA token")

    def generate_backup_codes(self, user_id, count=10):
        """
        Generate backup codes for emergency access

        Args:
            user_id (int): The user ID
            count (int, optional): Number of backup codes to generate

        Returns:
            list: List of backup codes
        """
        try:
            # Generate random backup codes
            backup_codes = []
            for _ in range(count):
                # Generate a 10-character alphanumeric code
                code = ''.join(secrets.choice('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(10))
                backup_codes.append(code)

            # Hash the codes for storage
            hashed_codes = []
            for code in backup_codes:
                # Use simple hash for backup codes
                hashed_code = hashlib.sha256(code.encode()).hexdigest()
                hashed_codes.append(hashed_code)

            # Store the hashed codes
            # This would typically be in a separate table, but for simplicity
            # we'll just join them and store in a field
            codes_str = ','.join(hashed_codes)

            # Update user record
            self.db_manager.execute_query(
                """
                UPDATE users
                SET backup_codes = ?
                WHERE id = ?
                """,
                (codes_str, user_id)
            )

            # Log the action
            self._log_action(user_id, "backup_codes_generated", f"Generated {count} backup codes")

            return backup_codes
        except Exception as e:
            self.logger.error(f"Error generating backup codes: {str(e)}")
            raise ValueError("Failed to generate backup codes")

    def verify_backup_code(self, user_id, backup_code):
        """
        Verify a backup code for MFA

        Args:
            user_id (int): The user ID
            backup_code (str): The backup code to verify

        Returns:
            bool: True if verification is successful
        """
        try:
            # Get user's backup codes
            user = self.db_manager.execute_query(
                """
                SELECT backup_codes
                FROM users
                WHERE id = ? AND mfa_enabled = 1
                """,
                (user_id,),
                fetchone=True
            )

            if not user or not user['backup_codes']:
                raise ValueError("No backup codes available for this user")

            # Parse stored codes
            stored_codes = user['backup_codes'].split(',')

            # Hash the provided code
            hashed_code = hashlib.sha256(backup_code.encode()).hexdigest()

            # Check if code exists in stored codes
            if hashed_code in stored_codes:
                # Remove the used code
                stored_codes.remove(hashed_code)

                # Update stored codes
                updated_codes = ','.join(stored_codes)
                self.db_manager.execute_query(
                    """
                    UPDATE users
                    SET backup_codes = ?
                    WHERE id = ?
                    """,
                    (updated_codes or None, user_id)
                )

                # Log the action
                self._log_action(user_id, "backup_code_used", "Backup code used for MFA")

                return True
            return False
        except ValueError as e:
            # Re-raise specific errors
            raise
        except Exception as e:
            self.logger.error(f"Error verifying backup code: {str(e)}")
            raise ValueError("Failed to verify backup code")

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