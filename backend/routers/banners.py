import json
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()


@router.get("/{location}")
def get_banner(location: str, db: Session = Depends(get_db)):
    banner = db.query(models.Banner).filter(models.Banner.location == location).first()
    if not banner:
        return JSONResponse(content=None, status_code=404)
    return {"location": banner.location, "data": json.loads(banner.data)}
