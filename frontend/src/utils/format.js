export const formatPrice = (price) => `KD ${Number(price).toFixed(3)}`

export const FREE_SHIPPING_THRESHOLD = 10.0
export const SHIPPING_FEE = 1.2

/** Returns 0 if subtotal qualifies for free shipping, otherwise SHIPPING_FEE */
export const calcShipping = (subtotal) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
