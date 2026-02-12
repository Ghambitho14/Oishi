import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. ESTADO INICIAL VACÍO (Sin localStorage para que se reinicie al recargar)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');

  // 2. LÓGICA DE PRECIOS
  const getPrice = (product) => {
    // Priorizamos el precio de descuento si existe y es mayor a 0
    if (product.discount_price && parseInt(product.discount_price) > 0) {
      return parseInt(product.discount_price);
    }
    return parseInt(product.price);
  };

  // 3. ACCIONES DEL CARRITO
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Si ya existe, sumamos 1 a la cantidad
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Si es nuevo, lo agregamos con cantidad 1
      return [...prev, { ...product, quantity: 1 }];
    });
    // Opcional: Abrir carrito al agregar (descomentar si te gusta ese efecto)
    // setIsCartOpen(true); 
  };

  const decreaseQuantity = (productId) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(0, item.quantity - 1) };
      }
      return item;
    }).filter(item => item.quantity > 0)); // Eliminamos si llega a 0
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    setCart([]);
    setOrderNote('');
  };

  // 4. CALCULOS DERIVADOS (Se actualizan solos)
  const cartTotal = cart.reduce((acc, item) => acc + (getPrice(item) * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // 5. GENERADOR DE MENSAJE (Utilidad)
  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return '';

    let message = '';
    message += '==============================\n';
    message += '   PEDIDO WEB - OISHI\n';
    message += '==============================\n\n';

    cart.forEach(item => {
      const price = getPrice(item);
      const subtotal = price * item.quantity;
      message += `• ${item.quantity} x ${item.name}\n`;
      message += `    Subtotal: $${subtotal.toLocaleString('es-CL')}\n`;
    });

    message += '\n------------------------------\n';
    message += `TOTAL: $${cartTotal.toLocaleString('es-CL')}\n`;
    message += '------------------------------\n';

    if (orderNote.trim()) {
      message += `Nota: ${orderNote}\n`;
    }

    return encodeURIComponent(message);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      isCartOpen, 
      toggleCart, 
      addToCart, 
      decreaseQuantity, 
      removeFromCart, 
      clearCart,
      cartTotal, 
      totalItems, 
      getPrice,
      orderNote, 
      setOrderNote,
      generateWhatsAppMessage 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);