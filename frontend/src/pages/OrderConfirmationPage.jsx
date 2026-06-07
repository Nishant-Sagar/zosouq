import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, Truck, Clock, Copy, ArrowRight } from 'lucide-react'
import { getOrder } from '../api'
import { useToast } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import SEO from '../components/SEO'
import { useLanguage } from '../context/LanguageContext'

const STATUS_STEPS = [
  { key: 'pending', labelKey: 'order_placed', icon: Package },
  { key: 'confirmed', labelKey: 'confirmed', icon: CheckCircle },
  { key: 'shipped', labelKey: 'shipped', icon: Truck },
  { key: 'delivered', labelKey: 'delivered', icon: CheckCircle },
]

const STATUS_INDEX = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 }

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const addToast = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    getOrder(orderNumber).then(setOrder).catch(() => {}).finally(() => setLoading(false))
  }, [orderNumber])

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    addToast(`${t('order_number')} ${t('copy')}`, 'success')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <SEO title="Order Not Found" noIndex={true} path={`/order-confirmation/${orderNumber}`} />
        <h2 className="text-xl font-bold mb-4">{t('order_not_found')}</h2>
        <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95">{t('go_home')}</Link>
      </div>
    )
  }

  const stepIndex = STATUS_INDEX[order.status] ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <SEO title={`Order Confirmed — ${order.order_number}`} noIndex={true} path={`/order-confirmation/${orderNumber}`} />
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t('order_confirmed')}</h1>
        <p className="text-slate-500 text-lg">
          <span className="font-semibold text-slate-700">{t('thank_you', { name: order.customer_name })}</span>
          {' '}{t('order_received')}
        </p>
      </div>

      {/* Order Number */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('order_number')}</p>
          <p className="text-2xl font-bold text-gray-900 font-mono">{order.order_number}</p>
        </div>
        <button
          onClick={copyOrderNumber}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Copy className="w-4 h-4" /> {t('copy')}
        </button>
      </div>

      {/* Status Tracker */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-6">{t('order_status')}</h2>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-gray-900 transition-all duration-500"
            style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`, right: 'auto' }}
          />
          <div className="relative grid grid-cols-4 gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon
              const done = idx <= stepIndex
              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
                  }`}>
                    <Icon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-xs font-medium mt-2 ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                    {t(step.labelKey)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-slate-600">
            {t('estimated_delivery')}: <strong>{t('today')}</strong>
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">{t('items_ordered')}</h2>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex gap-3">
              {item.product && (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    loading="lazy" decoding="async"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${item.product_id}/100/100` }}
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm">{item.product?.name || 'Product'}</p>
                <p className="text-xs text-slate-500">{t('qty')}: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t('subtotal')}</span>
            <span className="font-medium text-slate-700">{formatPrice(order.total_amount - (order.shipping_fee ?? 0))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t('shipping')}</span>
            {(order.shipping_fee ?? 0) === 0
              ? <span className="font-semibold text-emerald-600">{t('free')}</span>
              : <span className="font-semibold text-slate-700">{formatPrice(order.shipping_fee)}</span>
            }
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900">{t('total')}</span>
            <span className="text-xl font-extrabold text-gray-900">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">{t('delivery_details')}</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-0.5">{t('name')}</p>
            <p className="font-medium text-slate-900">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">{t('phone')}</p>
            <p className="font-medium text-slate-900">{order.customer_phone}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">{t('email')}</p>
            <p className="font-medium text-slate-900">{order.customer_email}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">{t('payment')}</p>
            <p className="font-medium text-emerald-600">{t('cash_on_delivery')}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500 mb-0.5">{t('address')}</p>
            <p className="font-medium text-slate-900">{order.address}, {order.city}</p>
          </div>
          {order.notes && (
            <div className="sm:col-span-2">
              <p className="text-slate-500 mb-0.5">{t('notes')}</p>
              <p className="font-medium text-slate-900">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-10 py-4 rounded-xl text-base font-semibold hover:bg-gray-800 transition-all shadow-lg active:scale-95">
          {t('continue_shopping')} <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-sm text-slate-400 mt-4">
          Keep your order number <strong className="text-slate-600">{order.order_number}</strong> to track your delivery.
        </p>
      </div>
    </div>
  )
}
