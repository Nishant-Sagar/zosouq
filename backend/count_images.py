import sqlite3
conn = sqlite3.connect('ecommerce.db')
total = conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]
with_img = conn.execute("SELECT COUNT(*) FROM products WHERE image_url IS NOT NULL AND image_url != ''").fetchone()[0]
distinct = conn.execute("SELECT COUNT(DISTINCT image_url) FROM products WHERE image_url IS NOT NULL AND image_url != ''").fetchone()[0]
print(f"Total products: {total}")
print(f"Products with images: {with_img}")
print(f"Distinct image URLs: {distinct}")
