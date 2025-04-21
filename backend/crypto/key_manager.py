"""
Key management for the password vault
"""

import os
import base64
import secrets
import logging
import json
from pathlib import Path

from backend.crypto.encryption import EncryptionManager
from backend.config import ENCRYPTION


class KeyManager:
    """Manager for cryptographic keys"""

    def __init__(self, encryption_manager=None):
        """Initialize the key manager"""
        self.logger = logging.getLogger(__name__)
        self.encryption_manager = encryption_manager or EncryptionManager()

    def create_user_keys(self, master_password):
        """
        Create encryption keys for a new user

        Args:
            master_password (str): The user's master password

        Returns:
            dict: Dictionary containing key information
        """
        # Generate a random salt for key derivation
        key_salt = secrets.token_bytes(ENCRYPTION['salt_bytes'])

        # Derive the master key using the password and salt
        master_key = self.encryption_manager.derive_key(master_password, key_salt)

        # Generate a random vault encryption key
        vault_key = self.encryption_manager.generate_random_key()

        # Encrypt the vault key with the master key
        encrypted_vault_key = self.encryption_manager.encrypt(vault_key, master_key)

        # Convert binary data to storable format
        key_salt_b64 = base64.b64encode(key_salt).decode('utf-8')
        encrypted_vault_key_json = json.dumps(encrypted_vault_key)

        return {
            'key_salt': key_salt_b64,
            'encrypted_key': encrypted_vault_key_json
        }

    def get_vault_key(self, master_password, key_salt, encrypted_key):
        """
        Retrieve the vault encryption key

        Args:
            master_password (str): The user's master password
            key_salt (str): Base64-encoded salt for key derivation
            encrypted_key (str): JSON string of the encrypted vault key

        Returns:
            bytes: The vault encryption key
        """
        try:
            # Decode the salt
            salt = base64.b64decode(key_salt)

            # Derive the master key
            master_key = self.encryption_manager.derive_key(master_password, salt)

            # Parse the encrypted vault key
            encrypted_vault_key = json.loads(encrypted_key)

            # Decrypt the vault key
            vault_key = self.encryption_manager.decrypt(encrypted_vault_key, master_key)

            return vault_key
        except Exception as e:
            self.logger.error(f"Error retrieving vault key: {str(e)}")
            raise ValueError("Failed to retrieve vault key")

    def rotate_keys(self, old_master_password, new_master_password, key_salt, encrypted_key):
        """
        Rotate encryption keys when the master password changes

        Args:
            old_master_password (str): The user's old master password
            new_master_password (str): The user's new master password
            key_salt (str): Base64-encoded salt for key derivation
            encrypted_key (str): JSON string of the encrypted vault key

        Returns:
            dict: Dictionary containing updated key information
        """
        try:
            # Get the current vault key
            vault_key = self.get_vault_key(old_master_password, key_salt, encrypted_key)

            # Generate a new salt
            new_key_salt = secrets.token_bytes(ENCRYPTION['salt_bytes'])

            # Derive a new master key
            new_master_key = self.encryption_manager.derive_key(new_master_password, new_key_salt)

            # Re-encrypt the vault key with the new master key
            new_encrypted_vault_key = self.encryption_manager.encrypt(vault_key, new_master_key)

            # Convert binary data to storable format
            new_key_salt_b64 = base64.b64encode(new_key_salt).decode('utf-8')
            new_encrypted_vault_key_json = json.dumps(new_encrypted_vault_key)

            return {
                'key_salt': new_key_salt_b64,
                'encrypted_key': new_encrypted_vault_key_json
            }
        except Exception as e:
            self.logger.error(f"Error rotating keys: {str(e)}")
            raise ValueError("Failed to rotate encryption keys")

    def generate_recovery_data(self, master_password, key_salt, encrypted_key):
        """
        Generate recovery data for emergency access

        Args:
            master_password (str): The user's master password
            key_salt (str): Base64-encoded salt for key derivation
            encrypted_key (str): JSON string of the encrypted vault key

        Returns:
            dict: Dictionary containing recovery information
        """
        try:
            # Get the vault key
            vault_key = self.get_vault_key(master_password, key_salt, encrypted_key)

            # Generate a recovery key
            recovery_key = secrets.token_hex(16)  # 32 character hex string
            recovery_key_bytes = recovery_key.encode('utf-8')

            # Generate a salt for the recovery key
            recovery_salt = secrets.token_bytes(ENCRYPTION['salt_bytes'])
            recovery_salt_b64 = base64.b64encode(recovery_salt).decode('utf-8')

            # Derive a key from the recovery key
            recovery_derived_key = self.encryption_manager.derive_key(recovery_key_bytes, recovery_salt)

            # Encrypt the vault key with the recovery key
            recovery_encrypted_key = self.encryption_manager.encrypt(vault_key, recovery_derived_key)
            recovery_encrypted_key_json = json.dumps(recovery_encrypted_key)

            # Create a hash of the recovery key for verification
            recovery_hash, _ = self.encryption_manager.secure_hash(recovery_key_bytes, recovery_salt)

            return {
                'recovery_key': recovery_key,  # Return to user but don't store
                'recovery_salt': recovery_salt_b64,  # Store this
                'recovery_hash': recovery_hash,  # Store this
                'recovery_encrypted_key': recovery_encrypted_key_json  # Store this
            }
        except Exception as e:
            self.logger.error(f"Error generating recovery data: {str(e)}")
            raise ValueError("Failed to generate recovery data")

    def recover_vault_key(self, recovery_key, recovery_salt, recovery_encrypted_key):
        """
        Recover the vault key using a recovery key

        Args:
            recovery_key (str): The recovery key
            recovery_salt (str): Base64-encoded salt for recovery
            recovery_encrypted_key (str): JSON string of the encrypted vault key

        Returns:
            bytes: The vault encryption key
        """
        try:
            # Convert recovery key to bytes
            recovery_key_bytes = recovery_key.encode('utf-8')

            # Decode the recovery salt
            recovery_salt_bytes = base64.b64decode(recovery_salt)

            # Derive the recovery derived key
            recovery_derived_key = self.encryption_manager.derive_key(recovery_key_bytes, recovery_salt_bytes)

            # Parse the encrypted vault key
            encrypted_vault_key = json.loads(recovery_encrypted_key)

            # Decrypt the vault key
            vault_key = self.encryption_manager.decrypt(encrypted_vault_key, recovery_derived_key)

            return vault_key
        except Exception as e:
            self.logger.error(f"Error recovering vault key: {str(e)}")
            raise ValueError("Failed to recover vault key")