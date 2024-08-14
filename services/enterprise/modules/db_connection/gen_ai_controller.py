from fastapi import APIRouter, status, UploadFile, Security, Form
from pydantic.types import Json

from modules.db_connection.models.responses import DBConnectionResponse
from modules.db_connection.service import DBConnectionService

from utils.auth import get_api_key, User, authenticate_user

router = APIRouter(
    prefix="/api/database-connections-gen-ai",
    responses={404: {"description": "Not found"}},
)

ac_router = APIRouter(
    prefix="/database-connections-gen-ai",
    responses={404: {"description": "Not found"}},
)

db_connection_service = DBConnectionService()


@router.post("", status_code=status.HTTP_200_OK)
async def add_db_connection_using_csv(
        csv_file: UploadFile,
        api_key=Security(get_api_key)
) -> DBConnectionResponse:
    return await db_connection_service.add_db_connection_using_csv(csv_file, api_key.organization_id)


@ac_router.post("", status_code=status.HTTP_200_OK)
async def ac_add_db_connection_using_csv(
        csv_file: UploadFile,
        request_json: Json = Form(...),
        user: User = Security(authenticate_user)
) -> DBConnectionResponse:
    return await db_connection_service.add_db_connection_using_csv(csv_file, user.organization_id)
