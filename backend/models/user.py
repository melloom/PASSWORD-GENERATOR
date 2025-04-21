"""
User model for the password vault
"""

import time
import logging


class UserModel:
    """Model for user data operations"""

    def __init__(self, db_manager):
        """Initialize the user model"""
        self.db_manager = db_manager
        self.logger = logging.getLogger(__name__)

    def get_user_by_id(self, user_id):
        """
        Get a user by ID

        Args:
            user_id (int): The user ID

        Returns:
            dict: The user data or None if not found
        """
        try:
            return self.db_manager.execute_query(
                """
                SELECT id, username, mfa_enabled, last_login,
                       created_at, updated_at, password_changed_at
                FROM users
                WHERE id = ?
                """,
                (user_id,),
                fetchone=True
            )
        except Exception as e:
            self.logger.error(f"Error getting user by ID: {str(e)}")
            return None

    def get_user_by_username(self, username):
        """
        Get a user by username

        Args:
            username (str): The username

        Returns:
            dict: The user data or None if not found
        """
        try:
            return self.db_manager.execute_query(
                """
                SELECT id, username, mfa_enabled, last_login,
                       created_at, updated_at, password_changed_at
                FROM users
                WHERE username = ?
                """,
                (username,),
                fetchone=True
            )
        except Exception as e:
            self.logger.error(f"Error getting user by username: {str(e)}")
            return None

    def get_user_encryption_data(self, user_id):
        """
        Get a user's encryption data

        Args:
            user_id (int): The user ID

        Returns:
            dict: The encryption data or None if not found
        """
        try:
            return self.db_manager.execute_query(
                """
                SELECT encryption_key, key_salt
                FROM users
                WHERE id = ?
                """,
                (user_id,),
                fetchone=True
            )
        except Exception as e:
            self.logger.error(f"Error getting user encryption data: {str(e)}")
            return None

    def update_user(self, user_id, update_data):
        """
        Update a user's data

        Args:
            user_id (int): The user ID
            update_data (dict): Data to update

        Returns:
            bool: True if update was successful
        """
        try:
            # Build update query
            allowed_fields = ['username', 'failed_attempts', 'locked_until', 'last_login']
            fields = []
            values = []

            for field in allowed_fields:
                if field in update_data:
                    fields.append(f"{field} = ?")
                    values.append(update_data[field])

            # Add updated_at
            fields.append("updated_at = ?")
            values.append(int(time.time()))

            # Add user_id
            values.append(user_id)

            if not fields:
                return False

            # Execute update
            self.db_manager.execute_query(
                f"""
                UPDATE users
                SET {", ".join(fields)}
                WHERE id = ?
                """,
                tuple(values)
            )
            return True
        except Exception as e:
            self.logger.error(f"Error updating user: {str(e)}")
            return False

    def delete_user(self, user_id):
        """
        Delete a user

        Args:
            user_id (int): The user ID

        Returns:
            bool: True if deletion was successful
        """
        try:
            # Start transaction
            conn = self.db_manager.get_connection()
            cursor = conn.cursor()

            try:
                # Delete user sessions
                cursor.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))

                # Delete user
                cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

                # Note: Vaults and entries will be cascade deleted due to foreign key constraints

                # Commit transaction
                conn.commit()
                return True
            except Exception as e:
                conn.rollback()
                raise
        except Exception as e:
            self.logger.error(f"Error deleting user: {str(e)}")
            return False

    def get_user_sessions(self, user_id):
        """
        Get a user's active sessions

        Args:
            user_id (int): The user ID

        Returns:
            list: List of active sessions
        """
        try:
            current_time = int(time.time())
            return self.db_manager.execute_query(
                """
                SELECT id, created_at, expires_at, ip_address, user_agent
                FROM sessions
                WHERE user_id = ? AND expires_at > ?
                ORDER BY created_at DESC
                """,
                (user_id, current_time)
            )
        except Exception as e:
            self.logger.error(f"Error getting user sessions: {str(e)}")
            return []

    def end_all_sessions(self, user_id):
        """
        End all sessions for a user

        Args:
            user_id (int): The user ID

        Returns:
            bool: True if successful
        """
        try:
            self.db_manager.execute_query(
                "DELETE FROM sessions WHERE user_id = ?",
                (user_id,)
            )
            return True
        except Exception as e:
            self.logger.error(f"Error ending user sessions: {str(e)}")
            return False

    def get_user_audit_log(self, user_id, limit=50, offset=0):
        """
        Get a user's audit log

        Args:
            user_id (int): The user ID
            limit (int): Maximum number of entries to return
            offset (int): Offset for pagination

        Returns:
            list: List of audit log entries
        """
        try:
            return self.db_manager.execute_query(
                """
                SELECT id, action, details, ip_address, timestamp
                FROM audit_log
                WHERE user_id = ?
                ORDER BY timestamp DESC
                LIMIT ? OFFSET ?
                """,
                (user_id, limit, offset)
            )
        except Exception as e:
            self.logger.error(f"Error getting user audit log: {str(e)}")
            return []