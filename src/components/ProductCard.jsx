import React, { useState } from 'react';
import { Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=400';

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <div className="product-card glass animate-fade">
      <div className="product-image">
        <img 
          src={product.image_url || FALLBACK_IMAGE} 
          alt={product.name} 
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = FALLBACK_IMAGE;
          }}
        />
        
        {/* BADGE PREMIUM CON MOVIMIENTO REAL (GIF) */}
        {product.is_special && (
          <span className="badge-special" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img 
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Fire.gif" 
              alt="🔥" 
              style={{ 
                width: '18px', 
                height: '18px',
                objectFit: 'contain'
              }} 
              onError={(e) => {
                // Si el GIF falla, borramos la imagen y dejamos el emoji de texto como respaldo
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '🔥 Hoy';
              }}
            />
            Hoy
          </span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        {/* Descripción con sistema de expansión dinámica */}
        <p 
          className={`product-desc ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {product.description}
        </p>
        
        {/* Botón para ver más ingredientes si el texto es largo */}
        {product.description && product.description.length > 40 && (
          <button 
            className="btn-info-toggle" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>Ver menos <ChevronUp size={14} /></>
            ) : (
              <>Ver ingredientes <ChevronDown size={14} /></>
            )}
          </button>
        )}
        
        <div className="product-footer">
          <span className="product-price">${product.price.toLocaleString('es-CL')}</span>
          <button 
            onClick={handleAdd} 
            className={`btn-add ${isAdded ? 'added' : ''}`}
            disabled={isAdded}
          >
            {isAdded ? <Check size={18} /> : <Plus size={18} />}
            <span>{isAdded ? 'Listo' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;