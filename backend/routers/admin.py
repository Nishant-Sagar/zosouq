import hmac
import hashlib
import json
import time
import os
import re
import shutil
from datetime import datetime, timedelta
from typing import Optional, List
from pathlib import Path
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from database import get_db
import models
import schemas

STATIC_BASE = Path(__file__).parent.parent / "static"
STATIC_BASE.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

CATEGORY_FOLDERS = {
    1: "livish_body_care_images",
    2: "livish_hair_care_images",
    3: "livish_makeup_images",
    4: "livish_personal_care_images",
    5: "livish_perfume_images",
}


def _make_slug(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    return re.sub(r"-+", "-", slug).strip("-")[:120]


def _unique_slug(db: Session, name: str, exclude_id: int = None) -> str:
    base = _make_slug(name)
    slug, n = base, 1
    while True:
        q = db.query(models.Product).filter(models.Product.slug == slug)
        if exclude_id:
            q = q.filter(models.Product.id != exclude_id)
        if not q.first():
            return slug
        slug, n = f"{base}-{n}", n + 1

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


# ── Product Management ────────────────────────────────────

@router.get("/products")
def admin_list_products(
    page: int = 1,
    per_page: int = 20,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    q = db.query(models.Product)
    if category_id:
        q = q.filter(models.Product.category_id == category_id)
    if search:
        q = q.filter(models.Product.name.ilike(f"%{search}%"))
    total = q.count()
    products = q.order_by(models.Product.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "products": [
            {
                "id": p.id, "name": p.name, "slug": p.slug,
                "price": p.price, "original_price": p.original_price,
                "stock": p.stock, "category_id": p.category_id,
                "image_url": p.image_url, "images": p.images,
                "description": p.description or "",
                "brand": p.brand or "", "is_active": p.is_active,
                "is_featured": p.is_featured,
            }
            for p in products
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, -(-total // per_page)),
    }


@router.post("/products")
async def admin_create_product(
    name: str = Form(...),
    category_id: int = Form(...),
    price: float = Form(...),
    original_price: Optional[float] = Form(None),
    stock: int = Form(0),
    description: str = Form(""),
    brand: str = Form(""),
    is_featured: bool = Form(False),
    images: List[UploadFile] = File(default=[]),
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    slug = _unique_slug(db, name)
    product = models.Product(
        name=name, slug=slug, description=description,
        price=price, original_price=original_price if original_price else None,
        stock=stock, category_id=category_id,
        brand=brand or None, is_active=True, is_featured=is_featured,
        rating=0.0, review_count=0,
    )
    db.add(product)
    db.flush()

    saved_urls = _save_images(product.id, name, category_id, images)
    if saved_urls:
        product.image_url = saved_urls[0]
        product.images = json.dumps(saved_urls)

    db.commit()
    db.refresh(product)
    return {"id": product.id, "slug": product.slug, "image_url": product.image_url}


@router.put("/products/{product_id}")
async def admin_update_product(
    product_id: int,
    name: str = Form(...),
    category_id: int = Form(...),
    price: float = Form(...),
    original_price: Optional[float] = Form(None),
    stock: int = Form(0),
    description: str = Form(""),
    brand: str = Form(""),
    is_featured: bool = Form(False),
    images: List[UploadFile] = File(default=[]),
    existing_images: str = Form("[]"),
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = name
    product.slug = _unique_slug(db, name, exclude_id=product_id)
    product.description = description
    product.price = price
    product.original_price = original_price if original_price else None
    product.stock = stock
    product.category_id = category_id
    product.brand = brand or None
    product.is_featured = is_featured

    kept = json.loads(existing_images)
    new_urls = _save_images(product_id, name, category_id, images)
    all_urls = kept + new_urls

    if all_urls:
        product.image_url = all_urls[0]
        product.images = json.dumps(all_urls)

    db.commit()
    return {"id": product.id, "slug": product.slug, "image_url": product.image_url}


@router.delete("/products/{product_id}")
def admin_delete_product(
    product_id: int,
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    folder = STATIC_DIR / str(product_id)
    if folder.exists():
        shutil.rmtree(folder)
    db.query(models.OrderItem).filter(models.OrderItem.product_id == product_id).delete()
    db.delete(product)
    db.commit()
    return {"deleted": product_id}


def _save_images(product_id: int, product_name: str, category_id: int, uploads: List[UploadFile]) -> List[str]:
    if not uploads or all(u.filename == "" for u in uploads):
        return []
    cat_folder = CATEGORY_FOLDERS.get(category_id, "livish_body_care_images")
    safe_name = re.sub(r'[<>:"/\\|?*]', '', product_name.strip())[:100]
    folder = STATIC_BASE / cat_folder / safe_name
    folder.mkdir(parents=True, exist_ok=True)
    existing = len(list(folder.glob("image_*")))
    urls = []
    for i, upload in enumerate(uploads, start=existing + 1):
        if not upload.filename:
            continue
        ext = Path(upload.filename).suffix.lower()
        if ext not in ALLOWED_EXTS:
            continue
        dest = folder / f"image_{i:02d}{ext}"
        content = upload.file.read()
        dest.write_bytes(content)
        urls.append(f"/static/{cat_folder}/{quote(safe_name)}/image_{i:02d}{ext}")
    return urls
