import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  LogOut,
  TrendingUp,
  Clock,
  Euro,
  CheckCircle,
  ChefHat,
  Package,
  Bell,
  Settings,
  Menu,
  X,
  Map,
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import MenuManagement from './MenuManagement';
import RestaurantSettings from './RestaurantSettings';
import TableManagement from './TableManagement';
import ErrorBoundary from '../components/ErrorBoundary';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, joinRestaurant, isConnected } = useSocket();
  const { isDarkMode, toggleTheme } = useTheme();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, orderNumber: null });
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    
    // Restore active tab if saved
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
      localStorage.removeItem('activeTab'); // Clean up
    }
    
    loadData();
  }, [user]);

  // Join restaurant room when socket connects
  useEffect(() => {
    if (socket && user && isConnected) {
      joinRestaurant(user.restaurant_id);
      console.log('Joined restaurant room:', user.restaurant_id);
    }
  }, [socket, user, isConnected, joinRestaurant]);

  // Notification state for new orders
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [waiterCallNotification, setWaiterCallNotification] = useState(null);

  useEffect(() => {
    if (socket && user) {
      socket.on('new_order', (data) => {
        if (data.restaurant_id === user.restaurant_id) {
          loadOrders();
          loadStats();
          // Show notification
          setNewOrderNotification({
            table: data.table_number || 'Nova',
            total: data.total || 0,
            id: data.id
          });
          // Play notification sound using Web Audio API - 4 seconds
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const playTone = (freq, startTime, duration) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.value = freq;
              oscillator.type = 'sine';
              gainNode.gain.setValueAtTime(0.3, startTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
              oscillator.start(startTime);
              oscillator.stop(startTime + duration);
            };
            const now = audioContext.currentTime;
            // Single pattern for 4 seconds
            playTone(523, now, 0.5);
            playTone(659, now + 0.6, 0.5);
            playTone(784, now + 1.2, 0.5);
            playTone(1047, now + 1.8, 0.7);
            playTone(784, now + 2.6, 0.4);
            playTone(1047, now + 3.1, 0.7);
          } catch (e) {
            console.log('Audio not supported');
          }
          // Auto-hide after 4 seconds
          setTimeout(() => setNewOrderNotification(null), 4000);
        }
      });

      socket.on('waiter_called', (data) => {
        if (data.restaurant_id === user.restaurant_id) {
          loadWaiterCalls();
          // Show waiter call notification
          setWaiterCallNotification({
            table: data.table_number || 'Desconhecida',
            id: data.id
          });
          // Play urgent notification sound - 4 seconds
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const playBeep = (freq, startTime, duration) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.value = freq;
              oscillator.type = 'square';
              gainNode.gain.setValueAtTime(0.25, startTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
              oscillator.start(startTime);
              oscillator.stop(startTime + duration);
            };
            const now = audioContext.currentTime;
            // Urgent alarm pattern - repeats for 4 seconds
            for (let i = 0; i < 2; i++) {
              const offset = i * 2;
              playBeep(800, now + offset, 0.3);
              playBeep(1000, now + offset + 0.35, 0.3);
              playBeep(800, now + offset + 0.7, 0.3);
              playBeep(1200, now + offset + 1.1, 0.4);
              playBeep(1000, now + offset + 1.55, 0.3);
            }
          } catch (e) {
            console.log('Audio not supported');
          }
          // Auto-hide after 5 seconds
          setTimeout(() => setWaiterCallNotification(null), 5000);
        }
      });

      socket.on('order_status_updated', (data) => {
        if (data.restaurant_id === user.restaurant_id) {
          loadOrders();
          loadStats();
        }
      });

      return () => {
        socket.off('new_order');
        socket.off('waiter_called');
        socket.off('order_status_updated');
      };
    }
  }, [socket, user]);

  const loadData = async () => {
    await Promise.all([loadRestaurant(), loadStats(), loadOrders(), loadWaiterCalls()]);
    setLoading(false);
  };

  const loadRestaurant = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/${user.restaurant_id}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Erro ao carregar restaurante:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/stats/restaurant/${user.restaurant_id}`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/restaurant/${user.restaurant_id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const loadWaiterCalls = async () => {
    try {
      const response = await axios.get(`${API}/call-waiter/restaurant/${user.restaurant_id}`);
      setWaiterCalls(response.data);
    } catch (error) {
      console.error('Erro ao carregar chamadas:', error);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      loadStats();
    } catch (error) {
      console.error('Erro ao atualizar estado:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    // Find order to get order number for display
    const order = orders.find(o => o.id === orderId);
    setCancelModal({ 
      open: true, 
      orderId, 
      orderNumber: order ? order.id.slice(-8) : orderId.slice(-8) 
    });
  };

  const confirmCancelOrder = async () => {
    if (!cancelModal.orderId) return;
    try {
      await axios.put(`${API}/orders/${cancelModal.orderId}/cancel`);
      loadOrders();
      loadStats();
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
    } finally {
      setCancelModal({ open: false, orderId: null, orderNumber: null });
    }
  };

  const handleResolveWaiterCall = async (callId) => {
    try {
      await axios.put(`${API}/call-waiter/${callId}/resolve`);
      loadWaiterCalls();
    } catch (error) {
      console.error('Erro ao resolver chamada:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      received: 'bg-blue-100 text-blue-700',
      preparing: 'bg-slate-100 text-slate-700',
      ready: 'bg-green-100 text-green-700',
      delivered: 'bg-gray-100 text-gray-700',
      canceled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      received: 'Recebido',
      preparing: 'Em Preparação',
      ready: 'Pronto',
      delivered: 'Entregue',
      canceled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const activeOrders = orders.filter(o => o.status === 'received');
  const historyOrders = orders.filter(o => ['delivered', 'canceled'].includes(o.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a2342] dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] dark:bg-gray-900">{/* New Order Notification Toast */}
      {newOrderNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 z-[100] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">Novo Pedido!</p>
            <p className="text-sm opacity-90">Mesa {newOrderNotification.table} • €{newOrderNotification.total?.toFixed(2)}</p>
          </div>
          <button 
            onClick={() => setNewOrderNotification(null)}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Waiter Call Notification Toast */}
      {waiterCallNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 z-[100] bg-amber-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-pulse"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">🔔 Empregado Chamado!</p>
            <p className="text-sm opacity-90">Mesa {waiterCallNotification.table} precisa de ajuda</p>
          </div>
          <button 
            onClick={() => setWaiterCallNotification(null)}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCancelModal({ open: false, orderId: null, orderNumber: null })}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            {/* Content */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Cancelar Pedido
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tem certeza que deseja cancelar o pedido <span className="font-semibold text-gray-800 dark:text-gray-200">#{cancelModal.orderNumber}</span>?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, orderId: null, orderNumber: null })}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
              >
                Voltar
              </button>
              <button
                onClick={confirmCancelOrder}
                className="flex-1 px-6 py-3 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white font-medium rounded-xl transition-all"
              >
                Sim, Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar - Fixed position */}
      <div className={`
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto
        fixed top-0 left-0
        z-50
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {restaurant?.logo_url ? (
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.name} 
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" 
                />
              ) : (
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              )}
              <div>
                <h2 className="font-bold text-[#18181B] dark:text-white">{restaurant?.name || 'ZentraQR'}</h2>
                <p className="text-xs text-[#71717A] dark:text-gray-400">{user?.role === 'admin' ? 'Administrador' : 'Staff'}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              data-testid="dashboard-tab"
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-50 dark:bg-gray-700 text-[#1a2342] dark:text-white'
                  : 'text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              data-testid="orders-tab"
              onClick={() => {
                setActiveTab('orders');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'orders'
                  ? 'bg-slate-50 dark:bg-gray-700 text-[#1a2342] dark:text-white'
                  : 'text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Pedidos</span>
              {activeOrders.length > 0 && (
                <span className="ml-auto bg-[#1a2342] dark:bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              data-testid="history-tab"
              onClick={() => {
                setActiveTab('history');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-slate-50 dark:bg-gray-700 text-[#1a2342] dark:text-white'
                  : 'text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Histórico</span>
            </button>

            <button
              data-testid="menu-tab"
              onClick={() => {
                setActiveTab('menu');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'menu'
                  ? 'bg-slate-50 dark:bg-gray-700 text-[#1a2342] dark:text-white'
                  : 'text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="font-medium">Menu</span>
            </button>

            <button
              data-testid="tables-tab"
              onClick={() => {
                setActiveTab('tables');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'tables'
                  ? 'bg-slate-50 dark:bg-gray-700 text-[#1a2342] dark:text-white'
                  : 'text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className="font-medium">Mesas</span>
            </button>

            <button
              data-testid="floor-plan-tab"
              onClick={() => {
                navigate('/admin/floor-plan');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Map className="w-5 h-5" />
              <span className="font-medium">Plantas Salas</span>
            </button>

            <button
              data-testid="settings-tab"
              onClick={() => {
                setActiveTab('settings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-slate-50 dark:bg-gray-700 text-[#1a2342] dark:text-white'
                  : 'text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configurações</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 mb-3 text-[#71717A] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all"
            data-testid="theme-toggle"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5" />
                <span className="font-medium">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span className="font-medium">Modo Escuro</span>
              </>
            )}
          </button>
          
          {/* Real-time connection indicator */}
          <div className="flex items-center gap-2 mb-4 px-4">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-[#71717A] dark:text-gray-400">
              {isConnected ? 'Em tempo real' : 'Reconectando...'}
            </span>
          </div>
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-64">
        {/* Mobile Header with Burger Menu */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            data-testid="burger-menu-button"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            {restaurant?.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.name} 
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600" 
              />
            ) : (
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            )}
            <span className="font-bold text-[#18181B] dark:text-white">{restaurant?.name || 'ZentraQR'}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        <div className="p-4 lg:p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-[#18181B] dark:text-white mb-8">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#18181B] dark:text-white mb-1">{stats?.total_orders_today || 0}</p>
                <p className="text-sm text-[#71717A] dark:text-gray-400">Pedidos Hoje</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Euro className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#18181B] dark:text-white mb-1">€{(stats?.revenue_today || 0).toFixed(2)}</p>
                <p className="text-sm text-[#71717A] dark:text-gray-400">Faturação Hoje</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#18181B] dark:text-white mb-1">{stats?.active_orders || 0}</p>
                <p className="text-sm text-[#71717A] dark:text-gray-400">Pedidos Ativos</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#18181B] dark:text-white mb-1">{waiterCalls.length}</p>
                <p className="text-sm text-[#71717A] dark:text-gray-400">Chamadas Pendentes</p>
              </motion.div>
            </div>

            {/* Waiter Calls */}
            {waiterCalls.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-[#18181B] dark:text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Chamadas de Empregado
                </h2>
                <div className="space-y-3">
                  {waiterCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div>
                        <p className="font-bold text-red-900 dark:text-red-300">Mesa {call.table_number}</p>
                        <p className="text-sm text-red-700 dark:text-red-400">{new Date(call.created_at).toLocaleTimeString('pt-PT')}</p>
                      </div>
                      <button
                        onClick={() => handleResolveWaiterCall(call.id)}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all"
                      >
                        Resolver
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#18181B] dark:text-white mb-4">Pedidos Ativos</h2>
              {activeOrders.length === 0 ? (
                <p className="text-[#71717A] dark:text-gray-400 text-center py-8">Nenhum pedido ativo</p>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleOrderStatusUpdate}
                      onCancelOrder={handleCancelOrder}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h1 className="text-3xl font-bold text-[#18181B] dark:text-white mb-8">Pedidos Ativos</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              {activeOrders.length === 0 ? (
                <p className="text-[#71717A] dark:text-gray-400 text-center py-8">Nenhum pedido ativo</p>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleOrderStatusUpdate}
                      onCancelOrder={handleCancelOrder}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h1 className="text-3xl font-bold text-[#18181B] dark:text-white mb-8">Histórico de Pedidos</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              {historyOrders.length === 0 ? (
                <p className="text-[#71717A] dark:text-gray-400 text-center py-8">Nenhum pedido no histórico</p>
              ) : (
                <div className="space-y-4">
                  {historyOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg text-[#18181B] dark:text-white">Pedido #{order.id.slice(-8)}</p>
                          <p className="text-sm text-[#71717A] dark:text-gray-400">
                            Mesa {order.table_number} • {new Date(order.created_at).toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          {order.payment_status === 'paid' && (
                            <p className="text-xs text-[#10B981] dark:text-green-400 mt-1">✓ Pago</p>
                          )}
                          {order.payment_method === 'counter' && order.payment_status === 'pending' && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">💰 Pagar no Balcão</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3 border-t border-gray-200 dark:border-gray-600 pt-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <p className="text-[#71717A] dark:text-gray-400">
                              {item.quantity}x {item.product_name}
                              {item.extras && item.extras.length > 0 && ` (+ ${item.extras.map(e => e.name).join(', ')})`}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic flex items-center gap-1">
                                <span>📝</span> {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                        {/* Observações gerais do pedido */}
                        {order.notes && (
                          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center gap-1">
                              <span>📋</span> Observações:
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-[#71717A] dark:text-gray-400">Total</span>
                        <span className="font-bold text-lg text-[#1a2342] dark:text-white">€{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu & Tables Tabs */}
        {activeTab === 'menu' && <MenuManagement />}

        {activeTab === 'tables' && (
          <ErrorBoundary>
            <TableManagement />
          </ErrorBoundary>
        )}

        {activeTab === 'settings' && <RestaurantSettings />}
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order, onStatusUpdate, onCancelOrder, getStatusColor, getStatusText }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-lg text-[#18181B] dark:text-white">Pedido #{order.id.slice(-8)}</p>
          <p className="text-sm text-[#71717A] dark:text-gray-400">Mesa {order.table_number} • {new Date(order.created_at).toLocaleTimeString('pt-PT')}</p>
          {order.payment_method === 'counter' && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
              <span>💰</span> Pagar no Balcão
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {order.items.map((item, index) => (
          <div key={index} className="text-sm">
            <p className="text-[#71717A] dark:text-gray-400">
              {item.quantity}x {item.product_name}
              {item.extras && item.extras.length > 0 && ` (+ ${item.extras.map(e => e.name).join(', ')})`}
            </p>
            {item.notes && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic flex items-center gap-1">
                <span>📝</span> {item.notes}
              </p>
            )}
          </div>
        ))}
        {/* Observações gerais do pedido */}
        {order.notes && (
          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center gap-1">
              <span>📋</span> Observações:
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{order.notes}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
        <span className="font-bold text-lg text-[#1a2342] dark:text-white">€{order.total.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCancelOrder(order.id)}
            className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            data-testid={`complete-order-${order.id}`}
            onClick={() => onStatusUpdate(order.id, 'delivered')}
            className="bg-[#10B981] dark:bg-green-700 hover:bg-[#059669] dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
