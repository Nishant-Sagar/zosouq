import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const WishlistContext = createContext(null)

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.items.find(i => i.id === action.payload.id)
      if (exists) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'CLEAR':
      return { items: [] }
    case 'LOAD':
      return { items: action.payload }
    default:
      return state
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zosouq_wishlist')
      if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) })
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    localStorage.setItem('zosouq_wishlist', JSON.stringify(state.items))
  }, [state.items])

  const isWishlisted = useCallback(
    (productId) => state.items.some(i => i.id === productId),
    [state.items]
  )

  const totalWishlist = state.items.length

  return (
    <WishlistContext.Provider value={{ items: state.items, dispatch, isWishlisted, totalWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
