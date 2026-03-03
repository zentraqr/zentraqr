import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat, Package } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [pollingPayment, setPollingPayment] = useState(false);

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
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${API}/payments/create-checkout`, {
        order_id: orderId,
        origin_url: originUrl
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      alert('Erro ao processar pagamento');
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
      ready: 'Pronto',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      received: 'bg-blue-100 text-blue-700',
      preparing: 'bg-orange-100 text-orange-700',
      ready: 'bg-green-100 text-green-700',
      delivered: 'bg-[#10B981] text-white',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5500]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#18181B] mb-2">Pedido não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="btn-primary px-6 py-3 mt-4"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-[#18181B]">Acompanhar Pedido</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6 text-center"
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getStatusColor(order.status)} mb-4`}>
            {getStatusIcon(order.status)}
          </div>
          <h2 className="text-2xl font-bold text-[#18181B] mb-2">{getStatusText(order.status)}</h2>
          <p className="text-[#71717A]">Pedido #{order.id.slice(-8)}</p>
        </motion.div>

        {/* Payment Status */}
        {order.payment_status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-6 bg-orange-50 border-orange-200"
          >
            <h3 className="font-bold text-lg mb-3 text-orange-900">Pagamento Pendente</h3>
            <p className="text-orange-700 mb-4">Complete o pagamento para confirmar o seu pedido</p>
            <button
              data-testid="pay-now-button"
              onClick={handlePayment}
              className="w-full btn-primary py-3"
            >
              Pagar Agora (€{order.total.toFixed(2)})
            </button>
          </motion.div>
        )}

        {order.payment_status === 'paid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-6 bg-green-50 border-green-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-bold text-green-900">Pagamento Confirmado</h3>
                <p className="text-sm text-green-700">O seu pedido foi pago com sucesso</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Itens do Pedido</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[#18181B]">
                    {item.quantity}x {item.product_name}
                  </p>
                  {item.extras && item.extras.length > 0 && (
                    <p className="text-sm text-[#71717A]">+ {item.extras.map(e => e.name).join(', ')}</p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-[#71717A] italic">Obs: {item.notes}</p>
                  )}
                </div>
                <span className="font-bold text-[#FF5500]">
                  €{(item.price * item.quantity + (item.extras?.reduce((sum, e) => sum + e.price, 0) || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-[#FF5500]">€{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Detalhes</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Mesa</span>
              <span className="font-medium">{order.table_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Hora do Pedido</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleTimeString('pt-PT')}</span>
            </div>
            {order.notes && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-[#71717A] mb-1">Observações:</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
