from fastapi import APIRouter, Depends

import schemas
from auth import require_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(require_user)):
    return current_user
