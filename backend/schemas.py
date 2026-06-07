from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Admin schemas ──────────────────────────────────────────

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class AdminOrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product_name: Optional[str] = None
    product_image: Optional[str] = None

    class Config:
        from_attributes = True

class AdminOrderOut(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    address: str
    city: str
    notes: Optional[str] = None
    shipping_fee: float
    total_amount: float
    status: str
    payment_method: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[AdminOrderItemOut] = []

    class Config:
        from_attributes = True

class AdminOrdersResponse(BaseModel):
    orders: List[AdminOrderOut]
    total: int
    page: int
    per_page: int
    total_pages: int

class AdminStats(BaseModel):
    total_orders: int
    total_revenue: float
    pending_orders: int
    confirmed_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    today_orders: int
    today_revenue: float
    this_week_orders: int
    this_week_revenue: float

class StatusUpdate(BaseModel):
    status: str


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    is_active: bool
    product_count: Optional[int] = None

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    original_price: Optional[float] = None
    stock: int = 0
    image_url: Optional[str] = None
    images: Optional[str] = None
    category_id: int
    brand: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    is_featured: bool = False
    tags: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int
    is_active: bool
    category: Optional[Category] = None

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    reviewer_name: str
    rating: int  # 1-5
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    reviewer_name: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[Product] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    address: str
    city: str
    notes: Optional[str] = None
    items: List[OrderItemCreate]


class Order(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    address: str
    city: str
    notes: Optional[str] = None
    shipping_fee: float = 0.0
    total_amount: float
    status: str
    payment_method: str
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
