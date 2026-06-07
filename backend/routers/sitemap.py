from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

SITE = "https://www.zosouq.com"

STATIC_PAGES = [
    ("", "1.0", "daily"),
    ("/categories", "0.8", "weekly"),
    ("/category/perfumes", "0.9", "daily"),
    ("/category/makeup", "0.9", "daily"),
    ("/category/hair-care", "0.9", "daily"),
    ("/category/body-care", "0.9", "daily"),
    ("/category/personal-care", "0.9", "daily"),
]


@router.get("/sitemap.xml", include_in_schema=False)
def sitemap(db: Session = Depends(get_db)):
    urls = []

    for path, priority, freq in STATIC_PAGES:
        urls.append(f"""  <url>
    <loc>{SITE}{path}</loc>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

    products = db.query(models.Product.slug)\
        .filter(models.Product.is_active == True, models.Product.is_staged == False)\
        .all()

    for (slug,) in products:
        urls.append(f"""  <url>
    <loc>{SITE}/product/{slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n'
    xml += "\n\n".join(urls)
    xml += "\n\n</urlset>"

    return Response(content=xml, media_type="application/xml")
