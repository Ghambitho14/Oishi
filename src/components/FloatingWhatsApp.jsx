import React from 'react';
import { ShoppingBag } from 'lucide-react'; // Quitamos MessageCircle
import { useCart } from '../context/CartContext';

const FloatingWhatsApp = () => {
  const { totalItems, cartTotal, toggleCart } = useCart();
  const hasItems = totalItems > 0;

  return (
    <button 
      onClick={toggleCart} 
      // Si tiene items, agregamos clase para efecto visual
      className={`whatsapp-float glass ${hasItems ? 'has-items' : ''}`}
    >
      {/* SIEMPRE es una bolsa de compras */}
      <ShoppingBag size={24} color="white" />
      
      {/* El contador SOLO sale si hay items */}
      {hasItems && (
        <span className="badge-count animate-bounce">{totalItems}</span>
      )}

      <span className="tooltip">
        {hasItems ? `Ver Pedido ($${cartTotal.toLocaleString('es-CL')})` : 'Tu carrito está vacío'}
      </span>
    </button>
  );
};

export default FloatingWhatsApp;