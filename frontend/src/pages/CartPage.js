import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart: initialCart, restaurant } = location.state || { cart: [], restaurant: null };

  const [cart, setCart] = useState(initialCart);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const restaurantId = searchParams.get('restaurant_id');
  const tableId = searchParams.get('table_id');

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.itemPrice, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      // Group items by product
      const itemsMap = {};
      cart.forEach(item => {
        const key = `${item.id}_${JSON.stringify(item.selectedExtras)}_${item.notes}`;
        if (itemsMap[key]) {
          itemsMap[key].quantity += 1;
        } else {
          itemsMap[key] = {
            product_id: item.id,
            product_name: item.name,
            quantity: 1,
            price: item.price,
            extras: item.selectedExtras || [],
            notes: item.notes || ''
          };
        }
      });

      const orderItems = Object.values(itemsMap);
      const total = getCartTotal();

      // Create order
      const orderResponse = await axios.post(`${API}/orders`, {
        restaurant_id: restaurantId,
        table_id: tableId,
        table_number: tableId.slice(-4),
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#18181B] mb-2">Carrinho Vazio</h2>
          <p className="text-[#71717A] mb-6">Adicione itens ao seu carrinho</p>
          <button
            data-testid="back-to-menu-button"
            onClick={() => navigate(`/menu?restaurant_id=${restaurantId}&table_id=${tableId}`)}
            className="btn-primary px-6 py-3"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              data-testid="back-button"
              onClick={() => navigate(`/menu?restaurant_id=${restaurantId}&table_id=${tableId}`)}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[#18181B]">Carrinho</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <motion.div
              key={item.cartId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card p-4"
            >
              <div className="flex gap-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#18181B]">{item.name}</h3>
                  {item.selectedExtras && item.selectedExtras.length > 0 && (
                    <p className="text-sm text-[#71717A] mt-1">
                      Extras: {item.selectedExtras.map(e => e.name).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-[#71717A] mt-1">Obs: {item.notes}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-[#FF5500]">€{item.itemPrice.toFixed(2)}</span>
                    <button
                      data-testid={`remove-item-${item.cartId}`}
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-500 hover:text-red-700 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Notes */}
        <div className="card p-4 mb-6">
          <h3 className="font-bold text-lg mb-3">Observações do Pedido</h3>
          <textarea
            data-testid="order-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma observação para o seu pedido?"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5500] focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Summary */}
        <div className="card p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[#71717A]">
              <span>Subtotal</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-[#18181B]">
              <span>Total</span>
              <span className="text-[#FF5500]">€{getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <button
          data-testid="checkout-button"
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white rounded-full py-4 px-6 font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'A processar...' : 'Finalizar Pedido'}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
