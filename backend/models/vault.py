"""
Vault model for the password vault
"""

import time
import logging


class VaultModel:
    """Model for vault data operations"""

    def __init__(self, db_manager):
        """Initialize the vault model"""
        self.db_manager = db_manager
        self.logger = logging.getLogger(__name__)

    def get_vaults(self, user_id):
        """
        Get all vaults for a user

        Args:
            user_id (int): The user ID

        Returns:
            list: List of vaults
        """
        try:
            return self.db_manager.execute_query(
                """
                SELECT id, name, description, icon, color, created_at, updated_at, last_accessed
                FROM vaults
                WHERE user_id = ?
                ORDER BY name ASC
                """,
                (user_id,)
            )
        except Exception as e:
            self.logger.error(f"Error getting vaults: {str(e)}")
            return []

    def get_vault(self, vault_id):
        """
        Get a specific vault

        Args:
            vault_id (int): The vault ID

        Returns:
            dict: The vault data or None if not found
        """
        try:
            vault = self.db_manager.execute_query(
                """
                SELECT id, user_id, name, description, icon, color, created_at, updated_at, last_accessed
                FROM vaults
                WHERE id = ?
                """,
                (vault_id,),
                fetchone=True
            )

            if vault:
                # Update last accessed time
                current_time = int(time.time())
                self.db_manager.execute_query(
                    """
                    UPDATE vaults
                    SET last_accessed = ?
                    WHERE id = ?
                    """,
                    (current_time, vault_id)
                )

            return vault
        except Exception as e:
            self.logger.error(f"Error getting vault: {str(e)}")
            return None

    def create_vault(self, user_id, name, description=None, icon=None, color=None):
        """
        Create a new vault

        Args:
            user_id (int): The user ID
            name (str): The vault name
            description (str, optional): The vault description
            icon (str, optional): The vault icon
            color (str, optional): The vault color

        Returns:
            int: The new vault ID

        Raises:
            ValueError: If creation fails
        """
        try:
            # Check if vault with this name already exists for user
            existing = self.db_manager.execute_query(
                """
                SELECT id
                FROM vaults
                WHERE user_id = ? AND name = ?
                """,
                (user_id, name),
                fetchone=True
            )

            if existing:
                raise ValueError(f"Vault with name '{name}' already exists")

            # Create vault
            current_time = int(time.time())
            vault_id = self.db_manager.execute_query(
                """
                INSERT INTO vaults (
                    user_id, name, description, icon, color, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, name, description, icon, color, current_time, current_time)
            )

            return vault_id
        except ValueError:
            # Re-raise specific errors
            raise
        except Exception as e:
            self.logger.error(f"Error creating vault: {str(e)}")
            raise ValueError(f"Failed to create vault: {str(e)}")

    def update_vault(self, vault_id, name=None, description=None, icon=None, color=None):
        """
        Update a vault

        Args:
            vault_id (int): The vault ID
            name (str, optional): The vault name
            description (str, optional): The vault description
            icon (str, optional): The vault icon
            color (str, optional): The vault color

        Returns:
            bool: True if update was successful

        Raises:
            ValueError: If update fails
        """
        try:
            # Get current vault data
            vault = self.get_vault(vault_id)
            if not vault:
                raise ValueError("Vault not found")

            # Check if new name already exists for user
            if name and name != vault['name']:
                existing = self.db_manager.execute_query(
                    """
                    SELECT id
                    FROM vaults
                    WHERE user_id = ? AND name = ? AND id != ?
                    """,
                    (vault['user_id'], name, vault_id),
                    fetchone=True
                )

                if existing:
                    raise ValueError(f"Vault with name '{name}' already exists")

            # Build update query
            fields = []
            values = []

            if name is not None:
                fields.append("name = ?")
                values.append(name)

            if description is not None:
                fields.append("description = ?")
                values.append(description)

            if icon is not None:
                fields.append("icon = ?")
                values.append(icon)

            if color is not None:
                fields.append("color = ?")
                values.append(color)

            if not fields:
                return True  # Nothing to update

            # Add updated_at
            fields.append("updated_at = ?")
            values.append(int(time.time()))

            # Add vault_id
            values.append(vault_id)

            # Execute update
            self.db_manager.execute_query(
                f"""
                UPDATE vaults
                SET {", ".join(fields)}
                WHERE id = ?
                """,
                tuple(values)
            )

            return True
        except ValueError:
            # Re-raise specific errors
            raise
        except Exception as e:
            self.logger.error(f"Error updating vault: {str(e)}")
            raise ValueError(f"Failed to update vault: {str(e)}")

    def delete_vault(self, vault_id):
        """
        Delete a vault

        Args:
            vault_id (int): The vault ID

        Returns:
            bool: True if deletion was successful

        Raises:
            ValueError: If deletion fails
        """
        try:
            # Start transaction
            conn = self.db_manager.get_connection()
            cursor = conn.cursor()

            try:
                # Note: Entries will be cascade deleted due to foreign key constraints

                # Delete vault
                cursor.execute("DELETE FROM vaults WHERE id = ?", (vault_id,))

                # Check if any rows were affected
                if cursor.rowcount == 0:
                    raise ValueError("Vault not found")

                # Commit transaction
                conn.commit()
                return True
            except Exception as e:
                conn.rollback()
                raise
        except ValueError:
            # Re-raise specific errors
            raise
        except Exception as e:
            self.logger.error(f"Error deleting vault: {str(e)}")
            raise ValueError(f"Failed to delete vault: {str(e)}")

    def check_vault_ownership(self, user_id, vault_id):
        """
        Check if a user owns a vault

        Args:
            user_id (int): The user ID
            vault_id (int): The vault ID

        Returns:
            bool: True if the user owns the vault
        """
        try:
            result = self.db_manager.execute_query(
                """
                SELECT 1
                FROM vaults
                WHERE id = ? AND user_id = ?
                """,
                (vault_id, user_id),
                fetchone=True
            )

            return result is not None
        except Exception as e:
            self.logger.error(f"Error checking vault ownership: {str(e)}")
            return False

    def get_vault_entry_count(self, vault_id):
        """
        Get the number of entries in a vault

        Args:
            vault_id (int): The vault ID

        Returns:
            int: The number of entries
        """
        try:
            result = self.db_manager.execute_query(
                """
                SELECT COUNT(*) as count
                FROM entries
                WHERE vault_id = ?
                """,
                (vault_id,),
                fetchone=True
            )

            return result['count'] if result else 0
        except Exception as e:
            self.logger.error(f"Error getting vault entry count: {str(e)}")
            return 0