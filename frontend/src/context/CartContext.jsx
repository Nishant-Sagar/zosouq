import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'

const CartContext = createContext(null)

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'UPDATE_QTY': {
      if (action.payload.qty < 1) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ),
      }
    }
    case 'CLEAR':
      return { items: [] }
    case 'LOAD':
      return { items: action.payload }
    default:
      return state
  }
}

// Toast context
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    if (type === 'success' && navigator.vibrate) navigator.vibrate(40)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 2800)
  }, [removeToast])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-20 sm:bottom-8 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast-enter pointer-events-auto w-full max-w-xs sm:max-w-sm"
          >
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
              ${toast.type === 'success'
                ? 'bg-gray-900 text-white border border-white/10'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-gray-200 border border-white/10'
              }`}
              style={{ backdropFilter: 'blur(12px)' }}
            >
              {toast.type === 'success' ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : toast.type === 'error' ? (
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">✕</div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white/70 text-xs">i</div>
              )}
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eleva_cart')
      if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) })
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('eleva_cart', JSON.stringify(state.items))
  }, [state.items])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items: state.items, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
