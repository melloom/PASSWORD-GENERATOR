"""
Encryption utilities for the password vault
"""

import os
import base64
import secrets
import hashlib
import logging
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.exceptions import InvalidTag

# Use argon2 if available
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError
    ARGON2_AVAILABLE = True
except ImportError:
    ARGON2_AVAILABLE = False

from backend.config import ENCRYPTION


class EncryptionManager:
    """Manager for encryption and decryption operations"""

    def __init__(self):
        """Initialize the encryption manager"""
        self.logger = logging.getLogger(__name__)

    def encrypt(self, plaintext, key):
        """
        Encrypt data using AES-256-GCM

        Args:
            plaintext (bytes or str): The data to encrypt
            key (bytes): The encryption key

        Returns:
            dict: Dictionary containing nonce, ciphertext, and tag
        """
        if isinstance(plaintext, str):
            plaintext = plaintext.encode('utf-8')

        # Generate a random nonce
        nonce = secrets.token_bytes(ENCRYPTION['nonce_bytes'])

        # Create AESGCM cipher
        aesgcm = AESGCM(key)

        try:
            # Encrypt the data
            ciphertext = aesgcm.encrypt(nonce, plaintext, None)

            # Base64 encode for storage
            encoded_nonce = base64.b64encode(nonce).decode('utf-8')
            encoded_ciphertext = base64.b64encode(ciphertext).decode('utf-8')

            return {
                'nonce': encoded_nonce,
                'ciphertext': encoded_ciphertext
            }
        except Exception as e:
            self.logger.error(f"Encryption error: {str(e)}")
            raise

    def decrypt(self, encrypted_data, key):
        """
        Decrypt data using AES-256-GCM

        Args:
            encrypted_data (dict): Dictionary containing nonce and ciphertext
            key (bytes): The decryption key

        Returns:
            bytes: The decrypted data
        """
        try:
            # Decode from base64
            nonce = base64.b64decode(encrypted_data['nonce'])
            ciphertext = base64.b64decode(encrypted_data['ciphertext'])

            # Create AESGCM cipher
            aesgcm = AESGCM(key)

            # Decrypt the data
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)

            return plaintext
        except InvalidTag:
            self.logger.error("Decryption failed: Invalid authentication tag")
            raise ValueError("Decryption failed: Invalid authentication tag")
        except Exception as e:
            self.logger.error(f"Decryption error: {str(e)}")
            raise

    def secure_hash(self, data, salt=None):
        """
        Create a secure hash using Argon2id (if available) or PBKDF2

        Args:
            data (str or bytes): The data to hash
            salt (bytes, optional): Salt to use. If None, a random salt is generated.

        Returns:
            tuple: (hash, salt)
        """
        if isinstance(data, str):
            data = data.encode('utf-8')

        if salt is None:
            salt = secrets.token_bytes(ENCRYPTION['salt_bytes'])

        if ARGON2_AVAILABLE:
            # Use Argon2 for password hashing
            ph = PasswordHasher(
                time_cost=ENCRYPTION['key_iterations'],
                memory_cost=ENCRYPTION['memory_cost'],
                parallelism=ENCRYPTION['parallelism'],
                hash_len=ENCRYPTION['key_bytes'],
                salt_len=ENCRYPTION['salt_bytes']
            )
            # Argon2 manages salt internally, but we'll use our own for consistency
            hash_val = ph.hash(data + salt)
            return hash_val, salt
        else:
            # Fall back to PBKDF2HMAC
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=ENCRYPTION['key_bytes'],
                salt=salt,
                iterations=ENCRYPTION['key_iterations']
            )
            hash_val = base64.b64encode(kdf.derive(data)).decode('utf-8')
            salt_b64 = base64.b64encode(salt).decode('utf-8')
            return hash_val, salt_b64

    def verify_hash(self, data, hash_val, salt):
        """
        Verify a hash created with secure_hash

        Args:
            data (str or bytes): The data to verify
            hash_val (str): The hash to verify against
            salt (bytes or str): The salt used for hashing

        Returns:
            bool: True if verified, False otherwise
        """
        if isinstance(data, str):
            data = data.encode('utf-8')

        if isinstance(salt, str):
            salt = base64.b64decode(salt)

        if ARGON2_AVAILABLE:
            try:
                ph = PasswordHasher()
                # Custom verification since we're using our own salt
                ph.verify(hash_val, data + salt)
                return True
            except VerifyMismatchError:
                return False
        else:
            # Rebuild the hash with PBKDF2HMAC
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=ENCRYPTION['key_bytes'],
                salt=salt,
                iterations=ENCRYPTION['key_iterations']
            )
            calculated_hash = base64.b64encode(kdf.derive(data)).decode('utf-8')
            return secrets.compare_digest(calculated_hash, hash_val)

    def derive_key(self, master_password, salt):
        """
        Derive a cryptographic key from the master password

        Args:
            master_password (str or bytes): The master password
            salt (bytes or str): The salt for key derivation

        Returns:
            bytes: The derived key
        """
        if isinstance(master_password, str):
            master_password = master_password.encode('utf-8')

        if isinstance(salt, str):
            salt = base64.b64decode(salt)

        if ARGON2_AVAILABLE:
            try:
                from argon2.low_level import hash_secret_raw
                key = hash_secret_raw(
                    secret=master_password,
                    salt=salt,
                    time_cost=ENCRYPTION['key_iterations'],
                    memory_cost=ENCRYPTION['memory_cost'],
                    parallelism=ENCRYPTION['parallelism'],
                    hash_len=ENCRYPTION['key_bytes'],
                    type=2  # Argon2id
                )
                return key
            except Exception as e:
                self.logger.error(f"Argon2 key derivation error: {str(e)}")
                # Fall back to PBKDF2

        # Use PBKDF2 if Argon2 is not available or fails
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=ENCRYPTION['key_bytes'],
            salt=salt,
            iterations=ENCRYPTION['key_iterations']
        )
        return kdf.derive(master_password)

    @staticmethod
    def generate_random_key():
        """Generate a random encryption key"""
        return secrets.token_bytes(ENCRYPTION['key_bytes'])