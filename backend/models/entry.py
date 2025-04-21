"""
Password entry model for the password vault
"""

import time
import logging
import json


class EntryModel:
    """Model for password entry data operations"""

    def __init__(self, db_manager):
        """Initialize the entry model"""
        self.db_manager = db_manager
        self.logger = logging.getLogger(__name__)

    def get_entries(self, vault_id):
        """
        Get all entries in a vault

        Args:
            vault_id (int): The vault ID

        Returns:
            list: List of entries
        """
        try:
            entries = self.db_manager.execute_query(
                """
                SELECT id, title, username, url, notes, category, tags, icon,
                       favorite, expires_at, created_at, updated_at, last_used
                FROM entries
                WHERE vault_id = ?
                ORDER BY title ASC
                """,
                (vault_id,)
            )

            # Parse tags
            for entry in entries:
                if entry['tags']:
                    try:
                        entry['tags'] = entry['tags'].split(',')
                    except Exception:
                        entry['tags'] = []
                else:
                    entry['tags'] = []

            return entries
        except Exception as e:
            self.logger.error(f"Error getting entries: {str(e)}")
            return []

    def get_entry(self, entry_id):
        """
        Get a specific entry

        Args:
            entry_id (int): The entry ID

        Returns:
            dict: The entry data or None if not found
        """
        try:
            entry = self.db_manager.execute_query(
                """
                SELECT id, vault_id, title, username, password, url, notes, category,
                       tags, icon, favorite, expires_at, created_at, updated_at, last_used
                FROM entries
                WHERE id = ?
                """,
                (entry_id,),
                fetchone=True
            )

            if entry:
                # Update last used time
                current_time = int(time.time())
                self.db_manager.execute_query(
                    """
                    UPDATE entries
                    SET last_used = ?
                    WHERE id = ?
                    """,
                    (current_time, entry_id)
                )

                # Parse tags
                if entry['tags']:
                    try:
                        entry['tags'] = entry['tags'].split(',')
                    except Exception:
                        entry['tags'] = []
                else:
                    entry['tags'] = []

                # Get custom fields
                custom_fields = self.db_manager.execute_query(
                    """
                    SELECT id, name, type, value
                    FROM custom_fields
                    WHERE entry_id = ?
                    """,
                    (entry_id,)
                )

                entry['custom_fields'] = custom_fields

                # Get attachments (just metadata, not content)
                attachments = self.db_manager.execute_query(
                    """
                    SELECT id, name, mime_type, size, created_at
                    FROM attachments
                    WHERE entry_id = ?
                    """,
                    (entry_id,)
                )

                entry['attachments'] = attachments

            return entry
        except Exception as e:
            self.logger.error(f"Error getting entry: {str(e)}")
            return None

    def create_entry(self, vault_id, title, username=None, password=None, url=None,
                    notes=None, category=None, tags=None, icon=None, favorite=False,
                    expires_at=None, custom_fields=None):
        """
        Create a new password entry

        Args:
            vault_id (int): The vault ID
            title (str): The entry title
            username (str, optional): The username
            password (str, optional): The password (encrypted)
            url (str, optional): The URL
            notes (str, optional): Notes (encrypted)
            category (str, optional): The category
            tags (list or str, optional): Tags
            icon (str, optional): The icon
            favorite (bool, optional): Whether the entry is a favorite
            expires_at (int, optional): Expiration timestamp
            custom_fields (list, optional): List of custom fields

        Returns:
            int: The new entry ID

        Raises:
            ValueError: If creation fails
        """
        try:
            # Preprocess tags
            if tags:
                if isinstance(tags, list):
                    tags = ','.join(tags)
                elif not isinstance(tags, str):
                    tags = str(tags)

            # Create entry
            current_time = int(time.time())

            # Start transaction
            conn = self.db_manager.get_connection()
            cursor = conn.cursor()

            try:
                # Insert entry
                cursor.execute(
                    """
                    INSERT INTO entries (
                        vault_id, title, username, password, url, notes, category,
                        tags, icon, favorite, expires_at, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        vault_id, title, username, password, url, notes, category,
                        tags, icon, favorite, expires_at, current_time, current_time
                    )
                )

                entry_id = cursor.lastrowid

                # Add custom fields if provided
                if custom_fields:
                    for field in custom_fields:
                        cursor.execute(
                            """
                            INSERT INTO custom_fields (
                                entry_id, name, type, value
                            ) VALUES (?, ?, ?, ?)
                            """,
                            (
                                entry_id, field['name'], field['type'], field['value']
                            )
                        )

                # Commit transaction
                conn.commit()

                # Update vault last accessed time
                self.db_manager.execute_query(
                    """
                    UPDATE vaults
                    SET last_accessed = ?
                    WHERE id = ?
                    """,
                    (current_time, vault_id)
                )

                return entry_id
            except Exception as e:
                conn.rollback()
                raise
        except Exception as e:
            self.logger.error(f"Error creating entry: {str(e)}")
            raise ValueError(f"Failed to create entry: {str(e)}")

    def update_entry(self, entry_id, title=None, username=None, password=None,
                   url=None, notes=None, category=None, tags=None, icon=None,
                   favorite=None, expires_at=None, custom_fields=None):
        """
        Update a password entry

        Args:
            entry_id (int): The entry ID
            title (str, optional): The entry title
            username (str, optional): The username
            password (str, optional): The password (encrypted)
            url (str, optional): The URL
            notes (str, optional): Notes (encrypted)
            category (str, optional): The category
            tags (list or str, optional): Tags
            icon (str, optional): The icon
            favorite (bool, optional): Whether the entry is a favorite
            expires_at (int, optional): Expiration timestamp
            custom_fields (list, optional): List of custom fields

        Returns:
            bool: True if update was successful

        Raises:
            ValueError: If update fails
        """
        try:
            # Get current entry data
            entry = self.get_entry(entry_id)
            if not entry:
                raise ValueError("Entry not found")

            # Preprocess tags
            if tags is not None:
                if isinstance(tags, list):
                    tags = ','.join(tags)
                elif not isinstance(tags, str):
                    tags = str(tags)

            # Build update query
            fields = []
            values = []

            if title is not None:
                fields.append("title = ?")
                values.append(title)

            if username is not None:
                fields.append("username = ?")
                values.append(username)

            if password is not None:
                fields.append("password = ?")
                values.append(password)

            if url is not None:
                fields.append("url = ?")
                values.append(url)

            if notes is not None:
                fields.append("notes = ?")
                values.append(notes)

            if category is not None:
                fields.append("category = ?")
                values.append(category)

            if tags is not None:
                fields.append("tags = ?")
                values.append(tags)

            if icon is not None:
                fields.append("icon = ?")
                values.append(icon)

            if favorite is not None:
                fields.append("favorite = ?")
                values.append(favorite)

            if expires_at is not None:
                fields.append("expires_at = ?")
                values.append(expires_at)

            if not fields and not custom_fields:
                return True  # Nothing to update

            # Start transaction
            conn = self.db_manager.get_connection()
            cursor = conn.cursor()

            try:
                # Update entry if needed
                if fields:
                    # Add updated_at
                    current_time = int(time.time())
                    fields.append("updated_at = ?")
                    values.append(current_time)

                    # Add entry_id
                    values.append(entry_id)

                    # Execute update
                    cursor.execute(
                        f"""
                        UPDATE entries
                        SET {", ".join(fields)}
                        WHERE id = ?
                        """,
                        tuple(values)
                    )

                # Update custom fields if provided
                if custom_fields is not None:
                    # Delete existing custom fields
                    cursor.execute(
                        "DELETE FROM custom_fields WHERE entry_id = ?",
                        (entry_id,)
                    )

                    # Add new custom fields
                    for field in custom_fields:
                        cursor.execute(
                            """
                            INSERT INTO custom_fields (
                                entry_id, name, type, value
                            ) VALUES (?, ?, ?, ?)
                            """,
                            (
                                entry_id, field['name'], field['type'], field['value']
                            )
                        )

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
            self.logger.error(f"Error updating entry: {str(e)}")
            raise ValueError(f"Failed to update entry: {str(e)}")

    def delete_entry(self, entry_id):
        """
        Delete a password entry

        Args:
            entry_id (int): The entry ID

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
                # Delete custom fields and attachments (if not already handled by cascade)
                cursor.execute("DELETE FROM custom_fields WHERE entry_id = ?", (entry_id,))
                cursor.execute("DELETE FROM attachments WHERE entry_id = ?", (entry_id,))

                # Delete entry
                cursor.execute("DELETE FROM entries WHERE id = ?", (entry_id,))

                # Check if any rows were affected
                if cursor.rowcount == 0:
                    raise ValueError("Entry not found")

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
            self.logger.error(f"Error deleting entry: {str(e)}")
            raise ValueError(f"Failed to delete entry: {str(e)}")

    def get_vault_id_for_entry(self, entry_id):
        """
        Get the vault ID for an entry

        Args:
            entry_id (int): The entry ID

        Returns:
            int: The vault ID or None if not found
        """
        try:
            result = self.db_manager.execute_query(
                "SELECT vault_id FROM entries WHERE id = ?",
                (entry_id,),
                fetchone=True
            )

            return result['vault_id'] if result else None
        except Exception as e:
            self.logger.error(f"Error getting vault ID for entry: {str(e)}")
            return None

    def search_entries(self, user_id, query):
        """
        Search for entries across all user vaults

        Args:
            user_id (int): The user ID
            query (str): The search query

        Returns:
            list: List of matching entries
        """
        try:
            # Create search pattern
            search_pattern = f"%{query}%"

            entries = self.db_manager.execute_query(
                """
                SELECT e.id, e.vault_id, e.title, e.username, e.url, e.category,
                       e.favorite, v.name as vault_name
                FROM entries e
                JOIN vaults v ON e.vault_id = v.id
                WHERE v.user_id = ? AND (
                    e.title LIKE ? OR
                    e.username LIKE ? OR
                    e.url LIKE ? OR
                    e.category LIKE ? OR
                    e.tags LIKE ?
                )
                ORDER BY e.favorite DESC, e.title ASC
                LIMIT 50
                """,
                (user_id, search_pattern, search_pattern, search_pattern,
                 search_pattern, search_pattern)
            )

            return entries
        except Exception as e:
            self.logger.error(f"Error searching entries: {str(e)}")
            return []

    def get_attachment(self, attachment_id):
        """
        Get an attachment

        Args:
            attachment_id (int): The attachment ID

        Returns:
            dict: The attachment data or None if not found
        """
        try:
            return self.db_manager.execute_query(
                """
                SELECT id, entry_id, name, content, mime_type, size, created_at
                FROM attachments
                WHERE id = ?
                """,
                (attachment_id,),
                fetchone=True
            )
        except Exception as e:
            self.logger.error(f"Error getting attachment: {str(e)}")
            return None

    def add_attachment(self, entry_id, name, content, mime_type):
        """
        Add an attachment to an entry

        Args:
            entry_id (int): The entry ID
            name (str): The attachment name
            content (bytes): The attachment content (encrypted)
            mime_type (str): The MIME type

        Returns:
            int: The new attachment ID

        Raises:
            ValueError: If addition fails
        """
        try:
            # Create attachment
            current_time = int(time.time())

            # Calculate size
            size = len(content) if content else 0

            attachment_id = self.db_manager.execute_query(
                """
                INSERT INTO attachments (
                    entry_id, name, content, mime_type, size, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (entry_id, name, content, mime_type, size, current_time)
            )

            return attachment_id
        except Exception as e:
            self.logger.error(f"Error adding attachment: {str(e)}")
            raise ValueError(f"Failed to add attachment: {str(e)}")

    def delete_attachment(self, attachment_id):
        """
        Delete an attachment

        Args:
            attachment_id (int): The attachment ID

        Returns:
            bool: True if deletion was successful

        Raises:
            ValueError: If deletion fails
        """
        try:
            result = self.db_manager.execute_query(
                "DELETE FROM attachments WHERE id = ?",
                (attachment_id,)
            )

            if not result:
                raise ValueError("Attachment not found")

            return True
        except Exception as e:
            self.logger.error(f"Error deleting attachment: {str(e)}")
            raise ValueError(f"Failed to delete attachment: {str(e)}")

    def get_expired_entries(self):
        """
        Get all expired entries

        Returns:
            list: List of expired entries
        """
        try:
            current_time = int(time.time())

            return self.db_manager.execute_query(
                """
                SELECT e.id, e.vault_id, e.title, e.expires_at, v.user_id
                FROM entries e
                JOIN vaults v ON e.vault_id = v.id
                WHERE e.expires_at IS NOT NULL AND e.expires_at < ?
                """,
                (current_time,)
            )
        except Exception as e:
            self.logger.error(f"Error getting expired entries: {str(e)}")
            return []