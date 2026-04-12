from fastapi import APIRouter, HTTPException
from cogni_flow_app.services.base import BaseService
from cogni_flow_app.models.responses.base_response import ApiResponse
from cogni_flow_app.models.responses.common_responses import DeleteResponse, DeleteData


def create_crud_router(
    service: BaseService,
    prefix: str,
    tags: list[str],
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=tags)

    @router.get("/", response_model=ApiResponse)
    def list_all():
        return ApiResponse.ok(data=service.get_all())

    @router.get("/search/{keyword}", response_model=ApiResponse)
    def search(keyword: str):
        return ApiResponse.ok(data=service.search(keyword))

    @router.get("/{record_id}", response_model=ApiResponse)
    def get_one(record_id: int):
        result = service.get_by_id(record_id)
        if not result:
            raise HTTPException(404, f"ID {record_id} not found")
        return ApiResponse.ok(data=result)

    @router.delete("/{record_id}", response_model=DeleteResponse)
    def delete_one(record_id: int):
        deleted = service.delete(record_id)
        if not deleted:
            raise HTTPException(404, f"ID {record_id} not found")
        return DeleteResponse.ok(
            data=DeleteData(id=record_id),
            message=f"ID {record_id} deleted successfully",
        )

    return router
