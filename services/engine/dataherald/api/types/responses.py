import re
from datetime import datetime

import pytz
from pydantic import BaseModel, validator

from dataherald.db_scanner.models.types import TableDescription
from dataherald.sql_database.models.types import DatabaseConnection
from dataherald.types import GoldenSQL, IntermediateStep, LLMConfig


class BaseResponse(BaseModel):
    id: str
    metadata: dict | None
    created_at: str | None

    @validator("created_at", pre=True, always=True)
    def created_at_as_string(cls, v):
        if not v:
            return None
        if isinstance(v, datetime):
            return str(v.replace(tzinfo=pytz.utc).isoformat())
        return str(v)


class PromptResponse(BaseResponse):
    text: str
    db_connection_id: str
    schemas: list[str] | None


class SQLGenerationResponse(BaseResponse):
    prompt_id: str
    finetuning_id: str | None
    status: str
    completed_at: str | None
    llm_config: LLMConfig | None
    intermediate_steps: list[IntermediateStep] | None
    sql: str | None
    tokens_used: int | None
    confidence_score: float | None
    error: str | None

    @validator("sql")
    def clean_sql_query(cls, v):
        # Remove comments (both single-line and multi-line)
        query = re.sub(r'--.*', '', v)  # Single-line comments
        query = re.sub(r'/\*.*?\*/', '', query, flags=re.DOTALL)  # Multi-line comments

        # Remove newline characters and extra spaces
        query = re.sub(r'\s+', ' ', query).strip()

        return query

    @validator("completed_at", pre=True, always=True)
    def completed_at_as_string(cls, v):
        if not v:
            return None
        if isinstance(v, datetime):
            return str(v.replace(tzinfo=pytz.utc).isoformat())
        return str(v)


class NLGenerationResponse(BaseResponse):
    llm_config: LLMConfig | None
    sql_generation_id: str
    text: str | None


class InstructionResponse(BaseResponse):
    instruction: str
    db_connection_id: str


class DatabaseConnectionResponse(BaseResponse, DatabaseConnection):
    pass


class TableDescriptionResponse(BaseResponse, TableDescription):
    id: str | None


class GoldenSQLResponse(BaseResponse, GoldenSQL):
    pass
