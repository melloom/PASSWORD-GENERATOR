"""
Configuration settings for the password vault
"""

import os
import logging
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Database settings
DATABASE = {
    'path': os.path.join(BASE_DIR, 'data', 'vault.db'),
    'backup_dir': os.path.join(BASE_DIR, 'data', 'backups'),
}

# Encryption settings
ENCRYPTION = {
    'algorithm': 'AES-256-GCM',
    'key_iterations': 310000,  # For Argon2id key derivation
    'memory_cost': 65536,      # 64 MB
    'parallelism': 4,
    'salt_bytes': 32,
    'nonce_bytes': 12,
    'tag_bytes': 16,
    'key_bytes': 32,           # 256 bits
}

# Authentication settings
AUTH = {
    'min_password_length': 16,
    'max_failed_attempts': 5,
    'lockout_period': 30 * 60,  # 30 minutes in seconds
    'session_timeout': 5 * 60,  # 5 minutes in seconds
    'mfa_required': True,
    'password_history': 10,     # Remember last 10 passwords
}

# Logging settings
LOGGING = {
    'level': logging.INFO,
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': os.path.join(BASE_DIR, 'logs', 'vault.log'),
}

# Security settings
SECURITY = {
    'auto_clipboard_clear': 30,  # seconds
    'vault_timeout': 3 * 60,     # 3 minutes in seconds
    'self_destruct_enabled': False,
    'secure_memory': True,
}