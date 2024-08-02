import psycopg2
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError

from dataherald.genai.sql_database.types import StorageDB, ColumnDetails, TableDetails, SchemaDetails


class GenAISQLDatabase:
    def __init__(self, engine: Engine):
        """Create engine from database URI."""
        self._engine = engine

    @property
    def engine(self) -> Engine:
        """Return SQL Alchemy engine."""
        return self._engine

    @classmethod
    def get_sql_engine(cls, storage_db: StorageDB) -> "GenAISQLDatabase":
        engine = create_engine(
            f"{storage_db.db_type}://{storage_db.user}:{storage_db.password}@{storage_db.host}:{storage_db.port}/{storage_db.database}")
        return cls(engine)

    def run_ddl(self, sql_command: str):
        with self._engine.connect() as connection:
            connection.execute("commit")
            connection.execute(sql_command)

    def change_db(self, db_name: str):
        url = self._engine.url
        url = url.set(database=db_name)
        self._engine = create_engine(url)

    def create_db(self, db_name: str):
        try:
            self.run_ddl(f"CREATE DATABASE {db_name}")
            self.change_db(db_name)
        except OperationalError as e:
            raise HTTPException(status_code=500, detail=f"{e}")

    def create_schema(self, schema_name: str):
        self.run_ddl(f"CREATE SCHEMA IF NOT EXISTS {schema_name}")

    @classmethod
    def create_column(cls, column_detail: ColumnDetails) -> str:
        column_name = f'"{column_detail.column_name}"'

        data_type = column_detail.data_type
        if " (" in data_type:
            data_type = data_type.replace(" (", "(")

        return f"{column_name} {data_type}"

    @classmethod
    def create_table(cls, table_details: TableDetails) -> str:
        return ", ".join([cls.create_column(column) for column in table_details.columns])

    def create_tables(self, schema_name: str, tables: list[TableDetails]):
        if schema_name != "null":
            self.create_schema(schema_name)

        for table_details in tables:
            table_name = table_details.table_name
            if schema_name == "null":
                sql_command = f"CREATE TABLE {table_name} ({self.create_table(table_details)})"
            else:
                sql_command = f"CREATE TABLE {schema_name}.{table_name} ({self.create_table(table_details)})"
            self.run_ddl(sql_command)
