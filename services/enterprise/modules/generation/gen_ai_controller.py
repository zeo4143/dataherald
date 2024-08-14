import re

from fastapi import APIRouter, status, UploadFile, Security, Form
from pydantic.types import Json

from modules.db_connection.models.responses import DBConnectionResponse
from modules.db_connection.service import DBConnectionService
from modules.generation.models.requests import PromptSQLGenerationRequest
from modules.generation.models.responses import SQLGenerationResponse
from modules.generation.service import GenerationService
from modules.organization.invoice.models.entities import UsageType
from modules.organization.invoice.service import InvoiceService

from utils.auth import get_api_key, User, authenticate_user

router = APIRouter(
    prefix="/api/generate-sql",
    responses={404: {"description": "Not found"}},
)

ac_router = APIRouter(
    prefix="/generate-sql",
    responses={404: {"description": "Not found"}},
)

generation_service = GenerationService()
invoice_service = InvoiceService()


@router.post("", status_code=status.HTTP_200_OK)
async def add_db_connection_using_csv(
        request: PromptSQLGenerationRequest,
        api_key=Security(get_api_key)
) -> str:
    invoice_service.check_usage(
        api_key.organization_id, type=UsageType.SQL_GENERATION, quantity=1
    )
    response = await generation_service.create_prompt_sql_generation(
        request, api_key.organization_id
    )
    invoice_service.record_usage(
        api_key.organization_id,
        type=UsageType.SQL_GENERATION,
        quantity=1,
        description=f"from /api/prompts/sql-generation: {response.id}",
    )
    return clean_sql_query(response.sql)


@ac_router.post("", status_code=status.HTTP_200_OK)
async def ac_add_db_connection_using_csv(
        request: PromptSQLGenerationRequest,
        user: User = Security(authenticate_user)
) -> str:
    invoice_service.check_usage(
        user.organization_id, type=UsageType.SQL_GENERATION, quantity=1
    )
    response = await generation_service.create_prompt_sql_generation(
        request, user.organization_id
    )
    invoice_service.record_usage(
        user.organization_id,
        type=UsageType.SQL_GENERATION,
        quantity=1,
        description=f"from /api/prompts/sql-generation: {response.id}",
    )
    return clean_sql_query(response.sql)


def clean_sql_query(query) -> str:
    # Remove comments (both single-line and multi-line)
    query = re.sub(r'--.*', '', query)  # Single-line comments
    query = re.sub(r'/\*.*?\*/', '', query, flags=re.DOTALL)  # Multi-line comments

    # Remove newline characters and extra spaces
    query = re.sub(r'\s+', ' ', query).strip()

    return query
