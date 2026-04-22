import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  function addToWishlist(product) {
    setWishlist(prev => prev.find(p => p.id === product.id) ? prev : [...prev, product])
  }

  function removeFromWishlist(id) {
    setWishlist(prev => prev.filter(p => p.id !== id))
  }

  function isInWishlist(id) {
    return wishlist.some(p => p.id === id)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
