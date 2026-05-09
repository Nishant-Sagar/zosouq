import openpyxl
import csv
import re

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

wb = openpyxl.load_workbook('livish_perfumes_first_25_pages.xlsx')
ws = wb.active

rows = list(ws.iter_rows(min_row=2, values_only=True))

seen_handles = {}

shopify_rows = []

for row in rows:
    image_url, product_name, original_price, discounted_price, discount_pct, stock_status, product_url, source_page = row

    if not product_name:
        continue

    handle = slugify(str(product_name))

    # Make handle unique if duplicate
    if handle in seen_handles:
        seen_handles[handle] += 1
        handle = f"{handle}-{seen_handles[handle]}"
    else:
        seen_handles[handle] = 1

    price = round(float(discounted_price), 3) if discounted_price else 0
    compare_at_price = round(float(original_price), 3) if original_price and original_price != discounted_price else ''

    status = 'active' if stock_status == 'In Stock' else 'draft'

    shopify_rows.append({
        'Handle': handle,
        'Title': product_name,
        'Body (HTML)': '',
        'Vendor': '',
        'Product Category': 'Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne',
        'Type': 'Perfume',
        'Tags': 'perfume',
        'Published': 'TRUE',
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Variant SKU': '',
        'Variant Grams': '0',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '100' if stock_status == 'In Stock' else '0',
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': price,
        'Variant Compare At Price': compare_at_price,
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Image Src': image_url or '',
        'Image Position': '1',
        'Image Alt Text': product_name,
        'Gift Card': 'FALSE',
        'Status': status,
    })

fieldnames = [
    'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags',
    'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams',
    'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
    'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
    'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position',
    'Image Alt Text', 'Gift Card', 'Status',
]

output_file = 'shopify_perfumes_import.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(shopify_rows)

print(f"Done! {len(shopify_rows)} products written to {output_file}")
