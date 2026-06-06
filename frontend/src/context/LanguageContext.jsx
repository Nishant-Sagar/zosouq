import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

export const translations = {
  en: {
    // Navbar
    search_placeholder: 'Search for products...',
    cart: 'Cart',
    wishlist: 'Wishlist',
    my_orders: 'My Orders',
    // Categories
    perfumes: 'Perfumes',
    makeup: 'Makeup',
    hair_care: 'Hair Care',
    body_care: 'Body Care',
    personal_care: 'Personal Care',
    // HomePage
    free_delivery: 'Free Delivery',
    free_delivery_sub: 'On orders over KD 10',
    authentic: '100% Authentic',
    authentic_sub: 'Verified products only',
    same_day: 'Same-Day Delivery',
    same_day_sub: 'Order before 2PM',
    cash_on_delivery: 'Cash on Delivery',
    cash_on_delivery_sub: 'Pay when you receive',
    shop_now: 'Shop Now',
    view_all: 'View All',
    new_arrivals: 'New Arrivals',
    best_sellers: 'Best Sellers',
    this_weeks_deals: "This Week's Deals",
    explore_categories: 'Explore Categories',
    featured_products: 'Featured Products',
    // ProductCard
    add_to_cart: 'Add to Cart',
    out_of_stock: 'Out of Stock',
    off: 'OFF',
    // ProductPage
    in_stock: 'In Stock',
    low_stock: 'Only {n} left',
    buy_now: 'Buy Now',
    added_to_cart: 'Added to cart',
    quantity: 'Quantity',
    description: 'Description',
    you_may_like: 'You May Also Like',
    // Cart
    your_cart: 'Your Cart',
    cart_empty: 'Your Cart is Empty',
    cart_empty_sub: "Looks like you haven't added anything yet.",
    start_shopping: 'Start Shopping',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'FREE',
    total: 'Total',
    proceed_checkout: 'Proceed to Checkout',
    remove: 'Remove',
    // Checkout
    checkout: 'Checkout',
    full_name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    address: 'Delivery Address',
    city: 'City / Area',
    notes: 'Order Notes (optional)',
    place_order: 'Place Order',
    order_summary: 'Order Summary',
    // Orders
    my_orders_title: 'My Orders',
    order_number: 'Order',
    // Search
    search_results: 'Search Results',
    no_results: 'No results found',
    search_for: 'Results for',
    // General
    loading: 'Loading...',
    back: 'Back',
    close: 'Close',
    items: 'items',
    item: 'item',
    kd: 'KD',
  },
  ar: {
    // Navbar
    search_placeholder: 'ابحث عن المنتجات...',
    cart: 'السلة',
    wishlist: 'المفضلة',
    my_orders: 'طلباتي',
    // Categories
    perfumes: 'العطور',
    makeup: 'المكياج',
    hair_care: 'العناية بالشعر',
    body_care: 'العناية بالجسم',
    personal_care: 'العناية الشخصية',
    // HomePage
    free_delivery: 'توصيل مجاني',
    free_delivery_sub: 'للطلبات فوق ١٠ دينار',
    authentic: '١٠٠٪ أصلي',
    authentic_sub: 'منتجات موثقة فقط',
    same_day: 'توصيل في نفس اليوم',
    same_day_sub: 'اطلب قبل الساعة ٢ ظهراً',
    cash_on_delivery: 'الدفع عند الاستلام',
    cash_on_delivery_sub: 'ادفع عند وصول الطلب',
    shop_now: 'تسوق الآن',
    view_all: 'عرض الكل',
    new_arrivals: 'وصل حديثاً',
    best_sellers: 'الأكثر مبيعاً',
    this_weeks_deals: 'عروض هذا الأسبوع',
    explore_categories: 'استكشف الفئات',
    featured_products: 'منتجات مميزة',
    // ProductCard
    add_to_cart: 'أضف إلى السلة',
    out_of_stock: 'نفد المخزون',
    off: 'خصم',
    // ProductPage
    in_stock: 'متوفر',
    low_stock: 'متبقي {n} فقط',
    buy_now: 'اشتر الآن',
    added_to_cart: 'تمت الإضافة إلى السلة',
    quantity: 'الكمية',
    description: 'الوصف',
    you_may_like: 'قد يعجبك أيضاً',
    // Cart
    your_cart: 'سلة التسوق',
    cart_empty: 'سلتك فارغة',
    cart_empty_sub: 'يبدو أنك لم تضف أي منتجات بعد.',
    start_shopping: 'ابدأ التسوق',
    subtotal: 'المجموع الفرعي',
    shipping: 'الشحن',
    free: 'مجاني',
    total: 'الإجمالي',
    proceed_checkout: 'إتمام الشراء',
    remove: 'حذف',
    // Checkout
    checkout: 'إتمام الطلب',
    full_name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    address: 'عنوان التوصيل',
    city: 'المدينة / المنطقة',
    notes: 'ملاحظات الطلب (اختياري)',
    place_order: 'تأكيد الطلب',
    order_summary: 'ملخص الطلب',
    // Orders
    my_orders_title: 'طلباتي',
    order_number: 'طلب',
    // Search
    search_results: 'نتائج البحث',
    no_results: 'لا توجد نتائج',
    search_for: 'نتائج عن',
    // General
    loading: 'جاري التحميل...',
    back: 'رجوع',
    close: 'إغلاق',
    items: 'منتجات',
    item: 'منتج',
    kd: 'د.ك',
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    if (lang === 'ar') {
      document.documentElement.classList.add('rtl')
    } else {
      document.documentElement.classList.remove('rtl')
    }
  }, [lang])

  const t = (key, vars = {}) => {
    let str = translations[lang]?.[key] || translations.en[key] || key
    Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v) })
    return str
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
