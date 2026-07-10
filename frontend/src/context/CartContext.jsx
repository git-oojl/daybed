/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem('cart');
    console.log('Carrito guardado:', savedCart); // Para depurar
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    console.log('Guardando en localStorage:', cartItems); // Para depurar
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    console.log('addToCart llamado con:', product); // Para depurar
    setCartItems(prevItems => {
      // Verificar si el producto ya está en el carrito
      const existingItem = prevItems.find(item => item.id === product.id);
      console.log('Item existente:', existingItem); // Para depurar
      
      if (existingItem) {
        // Si existe, aumentar la cantidad
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Si no existe, agregarlo con cantidad 1
        const newItem = { ...product, quantity: 1 };
        console.log('Nuevo item:', newItem); // Para depurar
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};