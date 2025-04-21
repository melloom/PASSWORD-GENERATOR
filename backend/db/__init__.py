"""
Database operations for the password vault
"""

import os
import sqlite3
import logging
import time
import json
import shutil
from datetime import datetime
from pathlib import Path

from backend.config import DATABASE


class DatabaseManager:
    """Manager for SQLite database operations"""

    def __init__(self):
        """Initialize the database manager"""
        self.db_path = DATABASE['path']
        self.backup_dir = DATABASE['backup_dir']
        self.logger = logging.getLogger(__name__)
        self._connection = None

    def database_exists(self):
        """Check if the database file exists"""
        return os.path.exists(self.db_path)

    def get_connection(self):
        """Get a connection to the database"""
        if self._connection is None:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            self._connection = sqlite3.connect(self.db_path)
            self._connection.row_factory = sqlite3.Row
        return self._connection

    def close_connection(self):
        """Close the database connection"""
        if self._connection:
            self._connection.close()
            self._connection = None

    def init_database(self):
        """Initialize the database with tables"""
        try:
            conn = self.get_connection()
            # Read schema from file
            schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
            with open(schema_path, 'r') as f:
                schema_script = f.read()

            # Execute schema script
            conn.executescript(schema_script)
            conn.commit()
            self.logger.info("Database initialized successfully")

            # Create initial backup
            self.create_backup("initial")
        except Exception as e:
            self.logger.error(f"Error initializing database: {str(e)}")
            raise

    def create_backup(self, reason="manual"):
        """Create a backup of the database"""
        if not self.database_exists():
            self.logger.warning("Cannot create backup - database does not exist")
            return False

        try:
            # Close the connection to ensure all data is written
            self.close_connection()

            # Create backup directory if it doesn't exist
            os.makedirs(self.backup_dir, exist_ok=True)

            # Create a timestamp for the backup filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"vault_backup_{timestamp}_{reason}.db"
            backup_path = os.path.join(self.backup_dir, backup_filename)

            # Copy the database file
            shutil.copy2(self.db_path, backup_path)
            self.logger.info(f"Created database backup: {backup_filename}")

            # Manage backup retention - keep only the last 10 backups
            self._cleanup_old_backups()

            return True
        except Exception as e:
            self.logger.error(f"Error creating backup: {str(e)}")
            return False

    def _cleanup_old_backups(self, max_backups=10):
        """Remove old backups, keeping only the most recent ones"""
        try:
            backup_files = [os.path.join(self.backup_dir, f) for f in os.listdir(self.backup_dir)
                            if f.startswith("vault_backup_") and f.endswith(".db")]

            # Sort by modification time (newest first)
            backup_files.sort(key=os.path.getmtime, reverse=True)

            # Remove older backups
            for old_backup in backup_files[max_backups:]:
                os.remove(old_backup)
                self.logger.debug(f"Removed old backup: {os.path.basename(old_backup)}")
        except Exception as e:
            self.logger.error(f"Error cleaning up old backups: {str(e)}")

    def execute_query(self, query, parameters=(), fetchone=False):
        """Execute a query and optionally fetch results"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, parameters)

            if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
                conn.commit()
                return cursor.lastrowid
            else:
                if fetchone:
                    return cursor.fetchone()
                return cursor.fetchall()
        except Exception as e:
            self.logger.error(f"Database error: {str(e)}")
            if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
                conn.rollback()
            raise