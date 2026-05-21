import hmac
import hashlib
import json
import time
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from database import get_db
import models
import schemas

router = APIRouter()

# ── Auth helpers (no extra deps needed) ───────────────────

ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "zosouq-admin-secret-key-change-in-prod")
TOKEN_TTL = 86400 * 7  # 7 days


def _hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    h = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${h}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, h = stored.split("$", 1)
        return hmac.compare_digest(
            hashlib.sha256((password + salt).encode()).hexdigest(), h
        )
    except Exception:
        return False


def _make_token(username: str) -> str:
    payload = json.dumps({"sub": username, "exp": time.time() + TOKEN_TTL})
    sig = hmac.new(ADMIN_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    import base64
    return base64.urlsafe_b64encode(f"{payload}|||{sig}".encode()).decode()


def _verify_token(token: str) -> Optional[str]:
    try:
        import base64
        decoded = base64.urlsafe_b64decode(token).decode()
        payload_str, sig = decoded.rsplit("|||", 1)
        expected = hmac.new(ADMIN_SECRET.encode(), payload_str.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(payload_str)
        if payload["exp"] < time.time():
            return None
        return payload["sub"]
    except Exception:
        return None


def get_admin(
    x_admin_token: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not x_admin_token:
        raise HTTPException(status_code=401, detail="Missing admin token")
    username = _verify_token(x_admin_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    admin = db.query(models.AdminUser).filter(
        models.AdminUser.username == username,
        models.AdminUser.is_active == True,
    ).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin


# ── Startup helper called from main.py ────────────────────

def ensure_default_admin(db: Session):
    existing = db.query(models.AdminUser).filter(
        models.AdminUser.username == "admin"
    ).first()
    if not existing:
        admin = models.AdminUser(
            username="admin",
            hashed_password=_hash_password("admin123"),
        )
        db.add(admin)
        db.commit()


# ── Routes ────────────────────────────────────────────────

@router.post("/login", response_model=schemas.AdminToken)
def login(data: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(
        models.AdminUser.username == data.username,
        models.AdminUser.is_active == True,
    ).first()
    if not admin or not _verify_password(data.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    admin.last_login = datetime.utcnow()
    db.commit()
    return schemas.AdminToken(
        access_token=_make_token(admin.username),
        username=admin.username,
    )


@router.get("/stats", response_model=schemas.AdminStats)
def get_stats(admin=Depends(get_admin), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())

    def count_status(status):
        return db.query(func.count(models.Order.id)).filter(
            models.Order.status == status
        ).scalar() or 0

    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    total_revenue = db.query(func.sum(models.Order.total_amount)).scalar() or 0.0
    today_orders = db.query(func.count(models.Order.id)).filter(
        models.Order.created_at >= today_start
    ).scalar() or 0
    today_revenue = db.query(func.sum(models.Order.total_amount)).filter(
        models.Order.created_at >= today_start
    ).scalar() or 0.0
    week_orders = db.query(func.count(models.Order.id)).filter(
        models.Order.created_at >= week_start
    ).scalar() or 0
    week_revenue = db.query(func.sum(models.Order.total_amount)).filter(
        models.Order.created_at >= week_start
    ).scalar() or 0.0

    return schemas.AdminStats(
        total_orders=total_orders,
        total_revenue=round(total_revenue, 3),
        pending_orders=count_status("pending"),
        confirmed_orders=count_status("confirmed"),
        shipped_orders=count_status("shipped"),
        delivered_orders=count_status("delivered"),
        cancelled_orders=count_status("cancelled"),
        today_orders=today_orders,
        today_revenue=round(today_revenue, 3),
        this_week_orders=week_orders,
        this_week_revenue=round(week_revenue, 3),
    )


@router.get("/orders", response_model=schemas.AdminOrdersResponse)
def get_orders(
    page: int = 1,
    per_page: int = 25,
    status: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sort: str = "newest",
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    query = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    )

    if status and status != "all":
        query = query.filter(models.Order.status == status)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                models.Order.order_number.ilike(term),
                models.Order.customer_name.ilike(term),
                models.Order.customer_email.ilike(term),
                models.Order.customer_phone.ilike(term),
            )
        )

    if date_from:
        try:
            query = query.filter(models.Order.created_at >= datetime.fromisoformat(date_from))
        except ValueError:
            pass

    if date_to:
        try:
            dt = datetime.fromisoformat(date_to).replace(hour=23, minute=59, second=59)
            query = query.filter(models.Order.created_at <= dt)
        except ValueError:
            pass

    if sort == "oldest":
        query = query.order_by(models.Order.created_at.asc())
    elif sort == "highest":
        query = query.order_by(models.Order.total_amount.desc())
    elif sort == "lowest":
        query = query.order_by(models.Order.total_amount.asc())
    else:
        query = query.order_by(models.Order.created_at.desc())

    total = query.count()
    skip = (page - 1) * per_page
    orders = query.offset(skip).limit(per_page).all()

    result = []
    for o in orders:
        items_out = []
        for item in o.items:
            items_out.append(schemas.AdminOrderItemOut(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                product_name=item.product.name if item.product else None,
                product_image=item.product.image_url if item.product else None,
            ))
        result.append(schemas.AdminOrderOut(
            id=o.id,
            order_number=o.order_number,
            customer_name=o.customer_name,
            customer_email=o.customer_email,
            customer_phone=o.customer_phone,
            address=o.address,
            city=o.city,
            notes=o.notes,
            shipping_fee=o.shipping_fee or 0.0,
            total_amount=o.total_amount,
            status=o.status,
            payment_method=o.payment_method,
            created_at=o.created_at,
            updated_at=o.updated_at,
            items=items_out,
        ))

    return schemas.AdminOrdersResponse(
        orders=result,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=max(1, -(-total // per_page)),
    )


@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    body: schemas.StatusUpdate,
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    valid = {"pending", "confirmed", "shipped", "delivered", "cancelled"}
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid)}")
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = body.status
    order.updated_at = datetime.utcnow()
    db.commit()
    return {"id": order.id, "status": order.status}


@router.get("/me")
def get_me(admin=Depends(get_admin)):
    return {"username": admin.username, "is_active": admin.is_active, "last_login": admin.last_login}
