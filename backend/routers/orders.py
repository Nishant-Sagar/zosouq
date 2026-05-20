from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import random
import string

router = APIRouter()

FREE_SHIPPING_THRESHOLD = 10.0
SHIPPING_FEE = 1.2


def generate_order_number():
    return "ORD-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.post("/", response_model=schemas.Order)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    subtotal = 0.0
    validated_items = []

    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        subtotal += item.price * item.quantity
        validated_items.append(item)
        product.stock -= item.quantity

    shipping_fee = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_FEE

    db_order = models.Order(
        order_number=generate_order_number(),
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        address=order_data.address,
        city=order_data.city,
        notes=order_data.notes,
        shipping_fee=shipping_fee,
        total_amount=subtotal + shipping_fee,
        payment_method="cash_on_delivery",
    )
    db.add(db_order)
    db.flush()

    for item in validated_items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/{order_number}", response_model=schemas.Order)
def get_order(order_number: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/", response_model=list[schemas.Order])
def search_orders(email: str = None, phone: str = None, db: Session = Depends(get_db)):
    if not email and not phone:
        raise HTTPException(status_code=400, detail="Provide email or phone to search orders")
    query = db.query(models.Order)
    if email:
        query = query.filter(models.Order.customer_email == email)
    if phone:
        query = query.filter(models.Order.customer_phone == phone)
    orders = query.order_by(models.Order.created_at.desc()).all()
    return orders
