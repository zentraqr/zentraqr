import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ZentraQR Brand Colors
const BRAND = {
  primary: '#1E2A4A',
  primaryHover: '#0f1529',
  secondary: '#3B5998',
  accent: '#1a2342',
  success: '#10B981',
  text: '#18181B',
  textMuted: '#71717A',
  background: '#FAFAFA'
};

const CartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get data from navigation state
  const { 
    cart: initialCart = [], 
    restaurantId: stateRestaurantId,
    tableId: stateTableId,
    tableNumber: stateTableNumber 
  } = location.state || {};

  const [cart, setCart] = useState(initialCart || []);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableNumber, setTableNumber] = useState(stateTableNumber || '');

  // Get IDs from URL params or state
  const restaurantId = searchParams.get('restaurant_id') || stateRestaurantId;
  const tableId = searchParams.get('table_id') || stateTableId;

  // Fetch table number if not provided
  useEffect(() => {
    const fetchTableNumber = async () => {
      if (tableId && !tableNumber) {
        try {
          const response = await axios.get(`${API}/tables/${tableId}`);
          setTableNumber(response.data.table_number || tableId.slice(-4));
        } catch (error) {
          console.error('Error fetching table:', error);
          setTableNumber(tableId.slice(-4));
        }
      }
    };
    fetchTableNumber();
  }, [tableId, tableNumber]);

  // Calculate item total (price + extras) * quantity
  const getItemTotal = (item) => {
    const basePrice = item.price || 0;
    const extrasTotal = (item.extras || []).reduce((sum, e) => sum + (e.price || 0), 0);
    const quantity = item.quantity || 1;
    return (basePrice + extrasTotal) * quantity;
  };

  // Calculate cart total
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  // Get total items count
  const getItemsCount = () => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  // Update item quantity
  const updateQuantity = (index, delta) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = (updated[index].quantity || 1) + delta;
      if (updated[index].quantity <= 0) {
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      // Format items for the order
      const orderItems = cart.map(item => ({
        product_id: item.product_id || item.id,
        product_name: item.product_name || item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        extras: item.extras || [],
        notes: item.notes || ''
      }));

      const total = getCartTotal();

      // Create order
      const orderResponse = await axios.post(`${API}/orders`, {
        restaurant_id: restaurantId,
        table_id: tableId,
        table_number: tableNumber,
        items: orderItems,
        total,
        notes
      });

      const orderId = orderResponse.data.id;

      // Navigate to order tracking
      navigate(`/order-tracking?order_id=${orderId}`);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Handle empty cart or no state
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: BRAND.background }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${BRAND.primary}15` }}>
            <ShoppingBag className="w-10 h-10" style={{ color: BRAND.primary }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.text }}>Carrinho Vazio</h2>
          <p className="mb-6" style={{ color: BRAND.textMuted }}>Adicione itens ao seu carrinho</p>
          <button
            data-testid="back-to-menu-button"
            onClick={() => navigate(`/menu?restaurant_id=${restaurantId}&table_id=${tableId}`)}
            className="text-white px-6 py-3 rounded-full font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND.primary }}
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: BRAND.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              data-testid="back-button"
              onClick={() => navigate(`/menu?restaurant_id=${restaurantId}&table_id=${tableId}`, {
                state: { cart, restaurantId, tableId, tableNumber }
              })}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: BRAND.text }}>Carrinho</h1>
              <p className="text-sm" style={{ color: BRAND.textMuted }}>{getItemsCount()} item{getItemsCount() !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex gap-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.product_name || item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg" style={{ color: BRAND.text }}>{item.product_name || item.name}</h3>
                  
                  {/* Extras */}
                  {item.extras && item.extras.length > 0 && (
                    <p className="text-sm mt-1" style={{ color: BRAND.textMuted }}>
                      + {item.extras.map(e => e.name).join(', ')}
                    </p>
                  )}
                  
                  {/* Notes */}
                  {item.notes && (
                    <p className="text-sm mt-1 italic" style={{ color: BRAND.textMuted }}>Obs: {item.notes}</p>
                  )}
                  
                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold" style={{ color: BRAND.primary }}>
                      €{getItemTotal(item).toFixed(2)}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                        <button
                          data-testid={`decrease-quantity-${index}`}
                          onClick={() => updateQuantity(index, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 transition-all"
                          style={{ ':hover': { color: BRAND.primary } }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity || 1}</span>
                        <button
                          data-testid={`increase-quantity-${index}`}
                          onClick={() => updateQuantity(index, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        data-testid={`remove-item-${index}`}
                        onClick={() => removeFromCart(index)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <h3 className="font-bold text-lg mb-3" style={{ color: BRAND.text }}>Observações do Pedido</h3>
          <textarea
            data-testid="order-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma observação para o seu pedido?"
            className="w-full p-3 border border-gray-200 rounded-lg resize-none transition-all"
            style={{ 
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${BRAND.primary}40`;
              e.target.style.borderColor = BRAND.primary;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#E5E7EB';
            }}
            rows={3}
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3">
            <div className="flex justify-between" style={{ color: BRAND.textMuted }}>
              <span>Subtotal ({getItemsCount()} itens)</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold">
              <span style={{ color: BRAND.text }}>Total</span>
              <span style={{ color: BRAND.primary }}>€{getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: `${BRAND.primary}08`, borderColor: `${BRAND.primary}20` }}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND.primary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm" style={{ color: BRAND.text }}>
              O pagamento será feito no restaurante após a confirmação do seu pedido.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <button
          data-testid="checkout-button"
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          className="w-full text-white rounded-full py-4 px-6 font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: BRAND.primary,
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BRAND.primaryHover}
          onMouseLeave={(e) => e.target.style.backgroundColor = BRAND.primary}
        >
          {loading ? 'A processar...' : `Confirmar Pedido • €${getCartTotal().toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
