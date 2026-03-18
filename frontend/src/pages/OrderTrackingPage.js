import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat, Package, CreditCard, Store, Home } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

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

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (socket && order) {
      socket.on('order_status_updated', (data) => {
        if (data.order_id === orderId) {
          setOrder(prev => ({ ...prev, status: data.status, updated_at: data.updated_at }));
        }
      });

      socket.on('payment_completed', (data) => {
        if (data.order_id === orderId) {
          setOrder(prev => ({ ...prev, payment_status: 'paid' }));
        }
      });

      return () => {
        socket.off('order_status_updated');
        socket.off('payment_completed');
      };
    }
  }, [socket, order, orderId]);

  const loadOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
      
      // Auto-set payment method to counter for new orders (MVP - no online payments)
      if (response.data.payment_status === 'pending' && !response.data.payment_method) {
        await axios.put(`${API}/orders/${orderId}/payment-method`, {
          payment_method: 'counter'
        });
        setOrder(prev => ({ ...prev, payment_method: 'counter' }));
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received':
        return <Clock className="w-6 h-6" />;
      case 'preparing':
        return <ChefHat className="w-6 h-6" />;
      case 'ready':
        return <Package className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusText = (status) => {
    const texts = {
      received: 'Pedido Recebido',
      preparing: 'Em Preparação',
      ready: 'Pronto para Levantar',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      received: { bg: `${BRAND.primary}15`, text: BRAND.primary },
      preparing: { bg: `${BRAND.secondary}15`, text: BRAND.secondary },
      ready: { bg: `${BRAND.success}15`, text: BRAND.success },
      delivered: { bg: BRAND.success, text: '#FFFFFF' },
      cancelled: { bg: '#FEE2E2', text: '#DC2626' }
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getStatusStep = (status) => {
    const steps = ['received', 'preparing', 'ready', 'delivered'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: BRAND.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: BRAND.primary }}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BRAND.background }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.text }}>Pedido não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 mt-4 rounded-full text-white font-bold transition-all"
            style={{ backgroundColor: BRAND.primary }}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(order.status);
  const currentStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: BRAND.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: BRAND.text }}>Acompanhar Pedido</h1>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <Home className="w-5 h-5" style={{ color: BRAND.textMuted }} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          {/* Status Icon */}
          <div className="text-center mb-6">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
            >
              {getStatusIcon(order.status)}
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: BRAND.text }}>{getStatusText(order.status)}</h2>
            <p style={{ color: BRAND.textMuted }}>Pedido #{order.id.slice(-8).toUpperCase()}</p>
          </div>

          {/* Progress Steps */}
          {order.status !== 'cancelled' && (
            <div className="flex items-center justify-between mb-6">
              {['received', 'preparing', 'ready', 'delivered'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        index <= currentStep ? 'text-white' : 'text-gray-400 bg-gray-100'
                      }`}
                      style={{ 
                        backgroundColor: index <= currentStep ? BRAND.primary : undefined 
                      }}
                    >
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block" style={{ color: index <= currentStep ? BRAND.primary : BRAND.textMuted }}>
                      {getStatusText(step)}
                    </span>
                  </div>
                  {index < 3 && (
                    <div 
                      className="flex-1 h-1 mx-2 rounded"
                      style={{ 
                        backgroundColor: index < currentStep ? BRAND.primary : '#E5E7EB'
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${BRAND.primary}15` }}
            >
              <Store className="w-6 h-6" style={{ color: BRAND.primary }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1" style={{ color: BRAND.text }}>Pagamento no Local</h3>
              <p className="text-sm mb-3" style={{ color: BRAND.textMuted }}>
                O pagamento será feito diretamente no restaurante quando o seu pedido estiver pronto.
              </p>
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${BRAND.primary}10`, color: BRAND.primary }}
              >
                <CreditCard className="w-4 h-4" />
                Total a pagar: €{order.total.toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Status */}
        {order.payment_status === 'paid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: `${BRAND.success}15`, border: `1px solid ${BRAND.success}30` }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" style={{ color: BRAND.success }} />
              <div>
                <h3 className="font-bold" style={{ color: BRAND.success }}>Pagamento Confirmado</h3>
                <p className="text-sm" style={{ color: BRAND.success }}>O seu pedido foi pago com sucesso</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h3 className="font-bold text-lg mb-4" style={{ color: BRAND.text }}>Itens do Pedido</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium" style={{ color: BRAND.text }}>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2" 
                          style={{ backgroundColor: `${BRAND.primary}15`, color: BRAND.primary }}>
                      {item.quantity}
                    </span>
                    {item.product_name}
                  </p>
                  {item.extras && item.extras.length > 0 && (
                    <p className="text-sm mt-1" style={{ color: BRAND.textMuted }}>+ {item.extras.map(e => e.name).join(', ')}</p>
                  )}
                  {item.notes && (
                    <p className="text-sm italic mt-1" style={{ color: BRAND.textMuted }}>Obs: {item.notes}</p>
                  )}
                </div>
                <span className="font-bold" style={{ color: BRAND.primary }}>
                  €{(item.price * item.quantity + (item.extras?.reduce((sum, e) => sum + e.price, 0) || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-xl font-bold">
            <span style={{ color: BRAND.text }}>Total</span>
            <span style={{ color: BRAND.primary }}>€{order.total.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-bold text-lg mb-4" style={{ color: BRAND.text }}>Detalhes do Pedido</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: BRAND.textMuted }}>Mesa</span>
              <span className="font-medium" style={{ color: BRAND.text }}>{order.table_number}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: BRAND.textMuted }}>Hora do Pedido</span>
              <span className="font-medium" style={{ color: BRAND.text }}>{new Date(order.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: BRAND.textMuted }}>Data</span>
              <span className="font-medium" style={{ color: BRAND.text }}>{new Date(order.created_at).toLocaleDateString('pt-PT')}</span>
            </div>
            {order.notes && (
              <div className="pt-3 border-t border-gray-200">
                <p className="mb-1" style={{ color: BRAND.textMuted }}>Observações:</p>
                <p className="font-medium" style={{ color: BRAND.text }}>{order.notes}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-sm"
          style={{ color: BRAND.textMuted }}
        >
          <p>Precisa de ajuda? Chame um funcionário do restaurante.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
