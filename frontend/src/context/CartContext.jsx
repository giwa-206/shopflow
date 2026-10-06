import { createContext, useCallback, useContext, useEffect, useState } from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setCart(await cartService.getCart());
    } catch {
      setCart(null);
    }
  }, [user]);

  // Reload cart whenever the logged-in user changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    setCart(await cartService.addItem(productId, quantity));
  };

  const updateQuantity = async (itemId, quantity) => {
    setCart(await cartService.updateQuantity(itemId, quantity));
  };

  const removeItem = async (itemId) => {
    setCart(await cartService.removeItem(itemId));
  };

  const clearCart = async () => {
    setCart(await cartService.clearCart());
  };

  return (
    <CartContext.Provider value={{ cart, refreshCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}