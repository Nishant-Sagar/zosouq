import openpyxl
import re
import os
import json
import urllib.parse
from database import SessionLocal, engine
from models import Base, Category, Product

Base.metadata.create_all(bind=engine)

EXTRAS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Extras")
STATIC_BASE = "http://localhost:8080/static"


def make_slug(name: str, seen: set) -> str:
    slug = name.lower()
    slug = re.sub(r'[™®©]', '', slug)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug).strip('-')
    slug = slug[:90]
    base = slug
    i = 2
    while slug in seen:
        slug = f"{base}-{i}"
        i += 1
    seen.add(slug)
    return slug


def extract_brand(name: str) -> str:
    parts = name.strip().split()
    if not parts:
        return ""
    brand = parts[0]
    if len(parts) > 1 and parts[1] and parts[1][0].isupper():
        brand = f"{parts[0]} {parts[1]}"
    return brand[:60]


def get_local_images(images_folder: str, product_name: str) -> list[str]:
    """Return list of full static URLs for all images of a product."""
    folder_path = os.path.join(EXTRAS_DIR, images_folder, product_name)
    if not os.path.isdir(folder_path):
        return []
    files = sorted(
        f for f in os.listdir(folder_path)
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
    )
    encoded_name = urllib.parse.quote(product_name)
    return [f"{STATIC_BASE}/{images_folder}/{encoded_name}/{f}" for f in files]


CATEGORIES = [
    {
        "name": "Body Care",
        "slug": "body-care",
        "description": "Luxurious body creams, lotions, scrubs and treatments for radiant skin",
        "image_url": "https://images.unsplash.com/photo-1609008803827-6d91a41e3a2e?w=800&fit=crop",
        "icon": "🧴",
    },
    {
        "name": "Hair Care",
        "slug": "hair-care",
        "description": "Professional shampoos, conditioners, masks and styling treatments",
        "image_url": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&fit=crop",
        "icon": "💇",
    },
    {
        "name": "Makeup",
        "slug": "makeup",
        "description": "Foundation, lipstick, eyeshadow and all your makeup essentials",
        "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&fit=crop",
        "icon": "💄",
    },
    {
        "name": "Personal Care",
        "slug": "personal-care",
        "description": "Skincare serums, cleansers, moisturisers and everyday essentials",
        "image_url": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&fit=crop",
        "icon": "🧼",
    },
    {
        "name": "Perfumes",
        "slug": "perfumes",
        "description": "Exclusive fragrances and eau de parfum for every occasion",
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&fit=crop",
        "icon": "🌸",
    },
]

# (excel_file, category_slug, local_images_folder)
FILES = [
    ("livish_body_care.xlsx",               "body-care",     "livish_body_care_images"),
    ("livish_hair_care.xlsx",               "hair-care",     "livish_hair_care_images"),
    ("livish_makeup.xlsx",                  "makeup",        "livish_makeup_images"),
    ("livish_personal_care.xlsx",           "personal-care", "livish_personal_care_images"),
    ("livish_perfumes_first_25_pages.xlsx", "perfumes",      "livish_perfume_images"),
]


def seed():
    db = SessionLocal()

    print("Clearing existing data...")
    db.query(Product).delete()
    db.query(Category).delete()
    db.commit()

    print("Creating categories...")
    cat_map = {}
    for cat_data in CATEGORIES:
        cat = Category(**cat_data)
        db.add(cat)
        db.flush()
        cat_map[cat_data["slug"]] = cat.id
    db.commit()

    seen_slugs = set()
    grand_total = 0

    for filename, cat_slug, images_folder in FILES:
        filepath = os.path.join(EXTRAS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  NOT FOUND: {filepath}")
            continue

        wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
        ws = wb.active

        count = 0
        batch = []

        for row in ws.iter_rows(min_row=2, values_only=True):
            if len(row) < 4:
                continue

            cdn_image_url = row[0]
            name          = row[1]
            orig_price    = row[2]
            disc_price    = row[3]
            stock_status  = row[5] if len(row) > 5 else "In Stock"

            if not name or disc_price is None:
                continue

            try:
                price    = float(disc_price)
                original = float(orig_price) if orig_price else None
            except (TypeError, ValueError):
                continue

            if price <= 0:
                continue

            product_name = str(name).strip()
            in_stock = (not stock_status) or ("in stock" in str(stock_status).lower())
            slug = make_slug(product_name, seen_slugs)

            # Gather local images; fall back to CDN URL if none found
            local_imgs = get_local_images(images_folder, product_name)
            primary_image = local_imgs[0] if local_imgs else (str(cdn_image_url).strip() if cdn_image_url else None)
            all_images_json = json.dumps(local_imgs) if local_imgs else None

            discount_ratio = 0.0
            if original and original > price:
                discount_ratio = (original - price) / original

            product = Product(
                name=product_name,
                slug=slug,
                description=(
                    f"{product_name} — a premium product from our "
                    f"{cat_slug.replace('-', ' ')} collection. "
                    f"Shop with free delivery and cash on delivery across Kuwait."
                ),
                price=price,
                original_price=original if original and original > price else None,
                stock=50 if in_stock else 0,
                image_url=primary_image,
                images=all_images_json,
                category_id=cat_map[cat_slug],
                brand=extract_brand(product_name),
                rating=4.5,
                review_count=0,
                is_featured=(count < 20 or discount_ratio >= 0.35),
                tags=cat_slug,
            )
            batch.append(product)
            count += 1

            if len(batch) >= 200:
                db.bulk_save_objects(batch)
                db.commit()
                batch.clear()

        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        wb.close()
        grand_total += count
        print(f"  {cat_slug}: {count} products")

    print(f"\nDone! Seeded {len(CATEGORIES)} categories and {grand_total} products.")
    db.close()


if __name__ == "__main__":
    seed()
