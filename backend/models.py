from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Index
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    slug = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    icon = Column(String(10), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), index=True)
    slug = Column(String(300), unique=True, index=True)
    description = Column(Text)
    price = Column(Float)
    original_price = Column(Float, nullable=True)
    stock = Column(Integer, default=0)
    image_url = Column(String(1000), nullable=True)
    images = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    brand = Column(String(200), nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_staged = Column(Boolean, default=False)
    tags = Column(String(500), nullable=True)

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True)
    customer_name = Column(String(200), index=True)
    customer_email = Column(String(200), index=True)
    customer_phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100), index=True)
    notes = Column(Text, nullable=True)
    shipping_fee = Column(Float, default=0.0)
    total_amount = Column(Float)
    status = Column(String(20), default="pending", index=True)
    payment_method = Column(String(50), default="cash_on_delivery")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")

    __table_args__ = (
        Index('ix_orders_status_created', 'status', 'created_at'),
        Index('ix_orders_email_created', 'customer_email', 'created_at'),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    quantity = Column(Integer)
    price = Column(Float)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100), unique=True, index=True)
    data = Column(Text)  # JSON blob
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
