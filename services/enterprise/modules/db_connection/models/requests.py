from typing import Any

from pydantic import BaseModel

from modules.db_connection.models.entities import BaseDBConnection, DBConnectionMetadata
from utils.validation import ObjectIdString


class DBConnectionRequest(BaseDBConnection):
    bigquery_credential_file_content: dict | str | None = None
    sqlite_file_path: str | None = None
    metadata: dict[str, Any] | None = {}


class DatabaseConnectionRequestUsingCSV(BaseModel):
    alias: str
    data_warehouse: str
    metadata: DBConnectionMetadata | None


class SampleDBRequest(BaseModel):
    sample_db_id: ObjectIdString
