from pydantic import BaseModel


class StorageDB(BaseModel):
    id: str | None
    user: str
    password: str
    host: str
    port: int
    database: str
    db_type: str


class ColumnDetails(BaseModel):
    column_name: str
    data_type: str
    properties: str | None


class TableDetails(BaseModel):
    table_name: str
    columns: list[ColumnDetails]


class SchemaDetails(BaseModel):
    schema_name: str | None
    tables: list[TableDetails]
