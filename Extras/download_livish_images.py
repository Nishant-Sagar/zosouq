import os
import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from pathlib import Path

BASE_URL = "https://livish.com"
PAGES_TO_FETCH = 25
OUTPUT_DIR = Path("/Users/nishant/Desktop/onlyfats/livish_perfume_images")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

session = requests.Session()
session.headers.update(HEADERS)


def safe_folder_name(name: str) -> str:
    """Convert a product name to a safe folder name."""
    name = name.strip()
    # Replace characters not allowed in folder names
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name[:100].strip()  # cap at 100 chars


def scrape_collection_page(page_num: int):
    """Return list of {name, product_url} from a collection page."""
    url = f"{BASE_URL}/collections/perfumes?page={page_num}&sort_by=best-selling"
    r = session.get(url, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    products = []
    for card in soup.select(".t4s-product-wrapper"):
        a = card.select_one("a.t4s-full-width-link, a[data-pr-href]")
        href = a.get("href") if a else None
        if not href:
            continue
        product_url = urljoin(BASE_URL, href)

        title_el = card.select_one(".t4s-product-title a, .t4s-product-title")
        name = title_el.get_text(" ", strip=True) if title_el else href.split("/")[-1]

        products.append({"name": name, "product_url": product_url})

    return products


def get_product_images(product_url: str):
    """Fetch all image URLs for a product via Shopify's .js endpoint."""
    js_url = product_url.rstrip("/") + ".js"
    r = session.get(js_url, timeout=30)
    r.raise_for_status()
    data = r.json()
    images = data.get("images", [])
    # Normalize protocol-relative URLs
    result = []
    for img in images:
        if img.startswith("//"):
            img = "https:" + img
        # Request full-size by removing width param
        img = re.sub(r'[?&]width=\d+', '', img)
        result.append(img)
    return result


def download_image(url: str, dest_path: Path):
    """Download a single image to dest_path."""
    r = session.get(url, timeout=60, stream=True)
    r.raise_for_status()
    with open(dest_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)


def image_ext(url: str) -> str:
    """Guess extension from URL."""
    path = url.split("?")[0]
    ext = os.path.splitext(path)[1].lower()
    return ext if ext in (".jpg", ".jpeg", ".png", ".webp", ".gif") else ".jpg"


# ── Main ──────────────────────────────────────────────────────────────────────

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Step 1: Collect all product URLs across pages
print("=== Scraping collection pages ===")
all_products = []
seen_urls = set()

for page_num in range(1, PAGES_TO_FETCH + 1):
    print(f"Page {page_num}/{PAGES_TO_FETCH}...", end=" ", flush=True)
    try:
        products = scrape_collection_page(page_num)
        added = 0
        for p in products:
            if p["product_url"] not in seen_urls:
                seen_urls.add(p["product_url"])
                all_products.append(p)
                added += 1
        print(f"{added} new products")
    except Exception as e:
        print(f"ERROR: {e}")
    time.sleep(1.0)

print(f"\nTotal unique products: {len(all_products)}\n")

# Step 2: For each product, fetch all images and download them
print("=== Downloading images ===")
total_images = 0
skipped = 0

for i, product in enumerate(all_products, start=1):
    name = product["name"]
    product_url = product["product_url"]
    folder_name = safe_folder_name(name)
    folder = OUTPUT_DIR / folder_name

    print(f"[{i}/{len(all_products)}] {name}")

    try:
        images = get_product_images(product_url)
        if not images:
            print(f"  No images found")
            skipped += 1
            time.sleep(0.3)
            continue

        folder.mkdir(parents=True, exist_ok=True)

        for j, img_url in enumerate(images, start=1):
            ext = image_ext(img_url)
            dest = folder / f"image_{j:02d}{ext}"

            if dest.exists():
                print(f"  [{j}/{len(images)}] Already exists, skipping")
                continue

            try:
                download_image(img_url, dest)
                total_images += 1
                print(f"  [{j}/{len(images)}] Saved: {dest.name}")
            except Exception as e:
                print(f"  [{j}/{len(images)}] FAILED: {e}")

            time.sleep(0.2)

    except Exception as e:
        print(f"  ERROR fetching images: {e}")
        skipped += 1

    time.sleep(0.5)

print(f"\n=== Done ===")
print(f"Products processed : {len(all_products) - skipped}")
print(f"Products skipped   : {skipped}")
print(f"Total images saved : {total_images}")
print(f"Output folder      : {OUTPUT_DIR}")
