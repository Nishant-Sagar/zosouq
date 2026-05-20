from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


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
