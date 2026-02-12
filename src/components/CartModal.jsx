import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, CreditCard, Store, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase'; // IMPORTANTE: Asegúrate que la ruta sea correcta

const CartModal = React.memo(() => {
  const { 
    cart, isCartOpen, toggleCart, 
    addToCart, decreaseQuantity, removeFromCart, clearCart,
    cartTotal, getPrice, orderNote, setOrderNote 
  } = useCart();

  const navigate = useNavigate();
  
  // Imagen por defecto si falla la carga
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=400';

  // Estados del formulario
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientRef, setClientRef] = useState("");
  const [paymentType, setPaymentType] = useState(null); // 'online' | 'tienda'
  const [isSaving, setIsSaving] = useState(false); // Para evitar doble click

  const resetPaymentFlow = () => {
    setShowPaymentInfo(false);
    setShowForm(false);
    setPaymentType(null);
    setClientName("");
    setClientPhone("");
    setClientRef("");
    setIsSaving(false);
  };

  if (!isCartOpen) return null;

  const handlePaid = () => setShowForm(true);

  // --- LÓGICA PRINCIPAL: GUARDAR EN SUPABASE Y LUEGO WHATSAPP ---
  const handleSendOrder = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. Insertar en la base de datos
      const { error } = await supabase.from('orders').insert({
        client_name: clientName,
        client_phone: clientPhone,
        payment_ref: clientRef || 'N/A',
        payment_type: paymentType,
        total: cartTotal,
        items: cart, // Guardamos el array de productos tal cual
        note: orderNote,
        status: 'pending' // Estado inicial: Pendiente/Entrante
      });

      if (error) throw error;

      // 2. Si todo salió bien, mostramos éxito
      setShowForm(false);
      setShowSuccess(true);
      
      // 3. Preparamos y abrimos WhatsApp después de 1.5 seg
      setTimeout(() => {
        const phoneNumber = "56976645547"; // TU NÚMERO AQUÍ
        let message = '==============================\n';
        message += '   🍣 NUEVO PEDIDO WEB 🍣\n';
        message += '==============================\n\n';
        
        message += `Cliente: ${clientName}\n`;
        message += `Teléfono: ${clientPhone}\n\n`;
        
        message += '--- DETALLE ---\n';
        cart.forEach(item => {
          const price = getPrice(item);
          message += `• ${item.quantity} x ${item.name} ($${price.toLocaleString('es-CL')})\n`;
        });
        
        message += `\nTOTAL A PAGAR: $${cartTotal.toLocaleString('es-CL')}\n`;
        
        if (paymentType === 'online') {
          message += `Pago: Transferencia (Ref: ${clientRef})\n`;
        } else {
          message += `Pago: En Local\n`;
        }

        if (orderNote.trim()) {
          message += `\nNota: ${orderNote}\n`;
        }
        
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }, 1500);

    } catch (error) {
      console.error(error);
      alert("Hubo un error al registrar el pedido. Por favor intenta de nuevo.");
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={toggleCart}>
      <div className="cart-panel glass animate-slide-in" onClick={e => e.stopPropagation()}>
        
        {/* VISTA DE ÉXITO */}
        {showSuccess ? (
          <div className="cart-success-view">
            <div className="success-icon-circle">
              <Check size={40} />
            </div>
            <h2 className="text-gradient">¡Pedido Recibido!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Ya lo estamos preparando. Se abrirá WhatsApp para confirmar.
            </p>
            
            <div className="order-summary-card">
              <div className="summary-label">Retiro en local</div>
              <div className="summary-value">Castelar Norte 141, Chile</div>
            </div>

            <div className="success-actions">
              <button className="btn btn-primary btn-block" onClick={() => { clearCart(); setShowSuccess(false); resetPaymentFlow(); }}>
                Hacer otro pedido
              </button>
              <button className="btn btn-secondary btn-block" onClick={() => { clearCart(); navigate('/'); }}>
                Volver al Menú
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <header className="cart-header">
              <div className="flex-center">
                <ShoppingBag size={22} className="text-accent" />
                <h3>Tu Pedido</h3>
                <span className="cart-count-badge">{cart.reduce((a,c) => a + c.quantity, 0)}</span>
              </div>
              <button onClick={toggleCart} className="btn-close-cart">
                <X size={24} />
              </button>
            </header>

            {/* BODY */}
            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-emoji">🍣</span>
                  <h3>Bandeja Vacía</h3>
                  <p>¿Qué tal unos rolls para empezar?</p>
                  <button onClick={toggleCart} className="btn btn-secondary mt-20">
                    Ir al Menú
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cart.map(item => {
                      const unitPrice = getPrice(item);
                      return (
                        <div key={item.id} className="cart-item">
                          <img 
                            src={item.image_url || FALLBACK_IMAGE} 
                            alt={item.name} 
                            className="item-thumb"
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                          />
                          <div className="item-details">
                            <div className="item-top">
                              <h4>{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="btn-trash">
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="item-bottom">
                              <span className="item-price">${(unitPrice * item.quantity).toLocaleString('es-CL')}</span>
                              <div className="qty-control-sm">
                                <button onClick={() => decreaseQuantity(item.id)}><Minus size={12} /></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => addToCart(item)}><Plus size={12} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="cart-notes">
                    <label>Notas de cocina</label>
                    <textarea 
                      className="form-input"
                      placeholder="Ej: Sin sésamo, extra jengibre..."
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows="2"
                    />
                  </div>
                </>
              )}
            </div>

            {/* FOOTER & PAGOS */}
            {cart.length > 0 && (
              <footer className="cart-footer">
                {!showPaymentInfo && (
                  <div className="total-row">
                    <span>Total</span>
                    <span className="total-price">${cartTotal.toLocaleString('es-CL')}</span>
                  </div>
                )}

                {showPaymentInfo ? (
                  (paymentType === 'online' || paymentType === 'tienda') ? (
                    showForm ? (
                      // FORMULARIO FINAL DE DATOS
                      <form onSubmit={handleSendOrder} className="checkout-form animate-fade">
                        <h4 className="form-title"><MessageCircle size={18}/> Datos de Contacto</h4>
                        
                        <div className="form-group">
                          <label>Nombre Completo</label>
                          <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} className="form-input" placeholder="Tu nombre" />
                        </div>
                        
                        <div className="form-group">
                          <label>Teléfono / WhatsApp</label>
                          <input type="tel" required value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="form-input" placeholder="+56 9..." />
                        </div>

                        {paymentType === 'online' && (
                          <div className="form-group">
                            <label>N° Referencia / Comprobante</label>
                            <input type="text" required value={clientRef} onChange={e => setClientRef(e.target.value)} className="form-input" placeholder="Ej: 123456" />
                          </div>
                        )}

                        <div className="form-actions-col">
                          <button type="submit" disabled={isSaving} className="btn btn-primary btn-block">
                            {isSaving ? 'Registrando...' : 'Confirmar Pedido'}
                          </button>
                          <button type="button" className="btn btn-text btn-block" onClick={resetPaymentFlow}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      // INFORMACIÓN DE PAGO
                      <div className="payment-details animate-fade">
                        {paymentType === 'online' ? (
                          <div className="bank-info glass">
                            <h4>Datos Bancarios</h4>
                            <ul>
                              <li><span>Banco:</span> <b>Prepago Tenpo</b></li>
                              <li><span>Tipo:</span> <b>Cuenta Vista</b></li>
                              <li><span>N°:</span> <b>111126281473</b></li>
                              <li><span>RUT:</span> <b>26.281.473-4</b></li>
                              <li><span>Email:</span> <b>doranteegrimar@gmail.com</b></li>
                            </ul>
                            <div className="pay-total">Total: ${cartTotal.toLocaleString('es-CL')}</div>
                            <button onClick={handlePaid} className="btn btn-primary btn-block mt-4">
                              Ya realicé el pago
                            </button>
                          </div>
                        ) : (
                          <div className="store-pay-info glass">
                            <Store size={32} className="text-accent"/>
                            <h4>Pagar en Local</h4>
                            <p>Pagas en efectivo o tarjeta al retirar.</p>
                            <div className="pay-total">Total: ${cartTotal.toLocaleString('es-CL')}</div>
                            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-block mt-4">
                              Continuar
                            </button>
                          </div>
                        )}
                        <button onClick={() => setShowPaymentInfo(false)} className="btn btn-text btn-block mt-2">
                          Volver
                        </button>
                      </div>
                    )
                  ) : (
                    // SELECCIÓN DE MÉTODO
                    <div className="payment-options animate-fade">
                      <h4 style={{textAlign:'center', marginBottom: 15, color:'white'}}>Método de Pago</h4>
                      <button className="btn btn-secondary btn-block payment-opt" onClick={() => setPaymentType('online')}>
                        <CreditCard size={20}/> Transferencia Bancaria
                      </button>
                      <button className="btn btn-secondary btn-block payment-opt" onClick={() => setPaymentType('tienda')}>
                        <Store size={20}/> Pagar en Local
                      </button>
                      <button onClick={() => setShowPaymentInfo(false)} className="btn btn-text btn-block">
                        Cancelar
                      </button>
                    </div>
                  )
                ) : (
                  <button onClick={() => setShowPaymentInfo(true)} className="btn btn-primary btn-block btn-lg">
                    Ir a Pagar
                  </button>
                )}
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default CartModal;