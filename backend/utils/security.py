"""
Security utilities for the password vault
"""

import os
import sys
import ctypes
import logging
import platform
import secrets
import string

from backend.config import SECURITY


class MemoryProtection:
    """Memory protection utilities"""

    _sensitive_objects = []
    _initialized = False

    @classmethod
    def init(cls):
        """Initialize memory protection"""
        if not SECURITY['secure_memory']:
            return

        # Register cleanup handlers
        cls._initialized = True
        logging.info("Memory protection initialized")

    @classmethod
    def secure_cleanup(cls):
        """Clean up sensitive data from memory"""
        if not cls._initialized:
            return

        # Clean up all registered objects
        for obj in cls._sensitive_objects:
            cls._secure_wipe(obj)

        # Clear the list
        cls._sensitive_objects.clear()

        # Force garbage collection
        import gc
        gc.collect()

        logging.info("Secure memory cleanup completed")

    @classmethod
    def register_sensitive_object(cls, obj):
        """
        Register an object for secure cleanup

        Args:
            obj: The object to register
        """
        if not cls._initialized:
            return

        cls._sensitive_objects.append(obj)

    @classmethod
    def _secure_wipe(cls, obj):
        """
        Securely wipe an object from memory

        Args:
            obj: The object to wipe
        """
        try:
            if isinstance(obj, bytes):
                # Overwrite bytes
                for i in range(len(obj)):
                    obj[i:i+1] = b'\x00'
            elif isinstance(obj, bytearray):
                # Overwrite bytearray
                for i in range(len(obj)):
                    obj[i] = 0
            elif isinstance(obj, str):
                # Can't directly modify strings in Python,
                # but we can try to mark it for garbage collection
                pass
            elif isinstance(obj, list):
                # Recursively wipe list elements
                for item in obj:
                    cls._secure_wipe(item)
                # Clear the list
                obj.clear()
            elif isinstance(obj, dict):
                # Recursively wipe dict values
                for key, value in obj.items():
                    cls._secure_wipe(value)
                # Clear the dict
                obj.clear()
        except Exception as e:
            logging.error(f"Error wiping object: {str(e)}")


def generate_password(length=16, use_uppercase=True, use_lowercase=True,
                       use_digits=True, use_special=True, min_of_each=1):
    """
    Generate a secure random password

    Args:
        length (int): Password length (minimum 8)
        use_uppercase (bool): Include uppercase letters
        use_lowercase (bool): Include lowercase letters
        use_digits (bool): Include digits
        use_special (bool): Include special characters
        min_of_each (int): Minimum count of each character type

    Returns:
        str: The generated password
    """
    # Validate inputs
    if length < 8:
        length = 8

    # At least one character type must be selected
    if not any([use_uppercase, use_lowercase, use_digits, use_special]):
        use_lowercase = True

    # Define character sets
    char_sets = []
    required_chars = []

    if use_uppercase:
        char_sets.append(string.ascii_uppercase)
        required_chars.extend(
            secrets.choice(string.ascii_uppercase)
            for _ in range(min_of_each)
        )

    if use_lowercase:
        char_sets.append(string.ascii_lowercase)
        required_chars.extend(
            secrets.choice(string.ascii_lowercase)
            for _ in range(min_of_each)
        )

    if use_digits:
        char_sets.append(string.digits)
        required_chars.extend(
            secrets.choice(string.digits)
            for _ in range(min_of_each)
        )

    if use_special:
        special_chars = "!@#$%^&*()-_=+[]{}|;:,.<>?/"
        char_sets.append(special_chars)
        required_chars.extend(
            secrets.choice(special_chars)
            for _ in range(min_of_each)
        )

    # Combine character sets
    all_chars = ''.join(char_sets)

    # Check if we can satisfy the requirements
    required_length = len(required_chars)
    if required_length > length:
        # Adjust the required chars to fit the length
        required_chars = required_chars[:length]
        password = ''.join(required_chars)
    else:
        # Generate the rest of the password
        remaining = length - required_length
        random_chars = [secrets.choice(all_chars) for _ in range(remaining)]

        # Combine and shuffle all characters
        password_chars = required_chars + random_chars
        secrets.SystemRandom().shuffle(password_chars)
        password = ''.join(password_chars)

    return password


def check_password_strength(password):
    """
    Check the strength of a password

    Args:
        password (str): The password to check

    Returns:
        tuple: (strength_score, feedback)
    """
    score = 0
    feedback = []

    # Check length
    if len(password) < 8:
        score -= 2
        feedback.append("Password is too short. Use at least 8 characters.")
    elif len(password) < 12:
        score += 1
    elif len(password) < 16:
        score += 2
    else:
        score += 3
        feedback.append("Good password length!")

    # Check character types
    has_lowercase = any(c.islower() for c in password)
    has_uppercase = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(not c.isalnum() for c in password)

    # Count character type diversity
    diversity = sum([has_lowercase, has_uppercase, has_digit, has_special])

    if diversity == 1:
        score -= 1
        feedback.append("Password only contains one character type.")
    elif diversity == 2:
        score += 1
    elif diversity == 3:
        score += 2
    elif diversity == 4:
        score += 3
        feedback.append("Good mix of character types!")

    # Check for specific weaknesses
    if not has_lowercase:
        feedback.append("Consider adding lowercase letters.")
    if not has_uppercase:
        feedback.append("Consider adding uppercase letters.")
    if not has_digit:
        feedback.append("Consider adding digits.")
    if not has_special:
        feedback.append("Consider adding special characters.")

    # Check for common patterns
    import re

    # Repeated characters
    if re.search(r'(.)\1{2,}', password):
        score -= 1
        feedback.append("Avoid repeating characters.")

    # Sequential characters
    sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789']
    for seq in sequences:
        for i in range(len(seq) - 2):
            if seq[i:i+3].lower() in password.lower():
                score -= 1
                feedback.append("Avoid sequential characters.")
                break

    # Normalize score to a 0-100 scale
    normalized_score = max(0, min(100, (score + 3) * 14))

    # Determine strength level
    if normalized_score < 40:
        strength = "Weak"
    elif normalized_score < 70:
        strength = "Moderate"
    elif normalized_score < 90:
        strength = "Strong"
    else:
        strength = "Very Strong"

    return {
        'score': normalized_score,
        'strength': strength,
        'feedback': feedback
    }