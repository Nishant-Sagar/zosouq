from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()


@router.get("/{slug}", response_model=list[schemas.ReviewOut])
def get_reviews(slug: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db.query(models.Review).filter(
        models.Review.product_id == product.id
    ).order_by(models.Review.created_at.desc()).all()


@router.post("/{slug}", response_model=schemas.ReviewOut)
def create_review(slug: str, review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    if not 1 <= review.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    product = db.query(models.Product).filter(models.Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_review = models.Review(
        product_id=product.id,
        reviewer_name=review.reviewer_name.strip(),
        rating=review.rating,
        comment=review.comment.strip() if review.comment else None,
    )
    db.add(db_review)
    db.flush()

    # Recalculate product rating from all reviews
    all_reviews = db.query(models.Review).filter(models.Review.product_id == product.id).all()
    product.review_count = len(all_reviews)
    product.rating = sum(r.rating for r in all_reviews) / len(all_reviews)

    db.commit()
    db.refresh(db_review)
    return db_review
