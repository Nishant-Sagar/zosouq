"""
Download all product images from livish.com to local storage.
Updates the database to point to local paths.
"""
import sqlite3
import os
import requests
import hashlib
import time
from urllib.parse import urlparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Config
DB_PATH = os.path.join(os.path.dirname(__file__), 'ecommerce.db')
IMG_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'products')
LOCAL_PREFIX = '/products/'
MAX_WORKERS = 10
TIMEOUT = 15

# Ensure output dir exists
os.makedirs(IMG_DIR, exist_ok=True)

def get_extension(url, content_type=''):
    """Get file extension from URL or content-type."""
    parsed = urlparse(url.split('?')[0])
    path = parsed.path.lower()
    if path.endswith('.jpg') or path.endswith('.jpeg'):
        return '.jpg'
    elif path.endswith('.png'):
        return '.png'
    elif path.endswith('.webp'):
        return '.webp'
    elif path.endswith('.gif'):
        return '.gif'
    elif 'jpeg' in content_type or 'jpg' in content_type:
        return '.jpg'
    elif 'png' in content_type:
        return '.png'
    elif 'webp' in content_type:
        return '.webp'
    return '.jpg'

def download_image(url, product_id):
    """Download a single image. Returns (product_id, local_path) or (product_id, None)."""
    try:
        # Create a short filename from product_id
        ext_guess = get_extension(url)
        filename = f"p{product_id}{ext_guess}"
        filepath = os.path.join(IMG_DIR, filename)
        
        # Skip if already downloaded
        if os.path.exists(filepath) and os.path.getsize(filepath) > 500:
            return (product_id, LOCAL_PREFIX + filename)
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/png,image/jpeg,*/*',
            'Referer': 'https://livish.com/',
        }
        
        resp = requests.get(url, headers=headers, timeout=TIMEOUT, stream=True)
        resp.raise_for_status()
        
        # Get proper extension from content-type
        ct = resp.headers.get('content-type', '')
        ext = get_extension(url, ct)
        filename = f"p{product_id}{ext}"
        filepath = os.path.join(IMG_DIR, filename)
        
        with open(filepath, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return (product_id, LOCAL_PREFIX + filename)
    except Exception as e:
        return (product_id, None)

def main():
    conn = sqlite3.connect(DB_PATH)
    
    # Get all products with external image URLs
    rows = conn.execute(
        "SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_url LIKE 'http%'"
    ).fetchall()
    
    total = len(rows)
    print(f"Found {total} products with external images to download")
    
    if total == 0:
        print("Nothing to download!")
        conn.close()
        return
    
    downloaded = 0
    failed = 0
    skipped = 0
    updates = []
    
    # Download in parallel
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {
            executor.submit(download_image, url, pid): (pid, url)
            for pid, url in rows
        }
        
        for i, future in enumerate(as_completed(futures), 1):
            pid, local_path = future.result()
            original_pid, original_url = futures[future]
            
            if local_path:
                updates.append((local_path, pid))
                if 'already' not in str(local_path):
                    downloaded += 1
                else:
                    skipped += 1
            else:
                failed += 1
            
            if i % 100 == 0 or i == total:
                print(f"  Progress: {i}/{total} ({downloaded} downloaded, {failed} failed)")
    
    # Update database
    if updates:
        print(f"\nUpdating {len(updates)} database records...")
        conn.executemany("UPDATE products SET image_url = ? WHERE id = ?", updates)
        conn.commit()
        print("Database updated!")
    
    conn.close()
    
    print(f"\nDone!")
    print(f"  Downloaded: {downloaded}")
    print(f"  Already existed: {len(updates) - downloaded}")
    print(f"  Failed: {failed}")
    print(f"  Total updated: {len(updates)}")

if __name__ == '__main__':
    main()
