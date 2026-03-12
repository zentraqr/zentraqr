import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Mail,
  Phone,
  Calendar,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  Building2,
  CreditCard,
  Loader2,
  Send,
  Reply,
  History,
  Plus,
  Store,
  UserPlus,
  DollarSign,
  Save,
  Edit2,
  GripVertical,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Color palette
const colors = {
  primary: '#1E40AF',
  secondary: '#2563EB',
  accent: '#10B981',
  dark: '#111827',
  light: '#F3F4F6',
};

const BackofficePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Reply state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyData, setReplyData] = useState({ subject: '', message: '' });
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Restaurants state
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantAdmins, setRestaurantAdmins] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({
    restaurant_name: '',
    description: '',
    address: '',
    phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);

  // Pricing state
  const [pricing, setPricing] = useState({
    starter: { 
      monthly_price: 29, 
      annual_price: 276,
      features: [
        { key: "tables", value: "10", label: "Até 10 mesas" },
        { key: "menu", value: "unlimited", label: "Menu ilimitado" },
        { key: "dashboard", value: "basic", label: "Dashboard básico" },
        { key: "support", value: "email", label: "Suporte por email" }
      ]
    },
    pro: { 
      monthly_price: 59, 
      annual_price: 564,
      features: [
        { key: "tables", value: "30", label: "Até 30 mesas" },
        { key: "menu", value: "unlimited", label: "Menu ilimitado" },
        { key: "dashboard", value: "advanced", label: "Dashboard avançado" },
        { key: "payments", value: "online", label: "Pagamentos online" },
        { key: "notifications", value: "realtime", label: "Notificações em tempo real" },
        { key: "support", value: "priority", label: "Suporte prioritário" }
      ]
    },
    enterprise: {
      monthly_price: null,
      annual_price: null,
      features: [
        { key: "tables", value: "unlimited", label: "Mesas ilimitadas" },
        { key: "restaurants", value: "multi", label: "Multi-restaurantes" },
        { key: "api", value: "custom", label: "API personalizada" },
        { key: "integrations", value: "full", label: "Integrações" },
        { key: "manager", value: "dedicated", label: "Gestor dedicado" },
        { key: "sla", value: "guaranteed", label: "SLA garantido" }
      ]
    }
  });
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingSaved, setPricingSaved] = useState(false);

  // Launch Settings state
  const [launchSettings, setLaunchSettings] = useState({
    plans_sales_enabled: true
  });
  const [loadingLaunchSettings, setLoadingLaunchSettings] = useState(false);
  const [savingLaunchSettings, setSavingLaunchSettings] = useState(false);
  const [launchSettingsSaved, setLaunchSettingsSaved] = useState(false);

  // Emails state
  const [emails, setEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Simple password authentication for backoffice
  const BACKOFFICE_PASSWORD = 'zentra2024';

  useEffect(() => {
    const auth = sessionStorage.getItem('backoffice_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadContacts();
      loadRestaurants();
      loadPricing();
      loadLaunchSettings();
    }
  }, []);

  const loadPricing = async () => {
    setLoadingPricing(true);
    try {
      const response = await axios.get(`${API}/backoffice/pricing`);
      setPricing(response.data);
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const savePricing = async () => {
    setSavingPricing(true);
    try {
      await axios.put(`${API}/backoffice/pricing`, pricing);
      setPricingSaved(true);
      setTimeout(() => setPricingSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao guardar preços:', error);
      alert('Erro ao guardar preços');
    } finally {
      setSavingPricing(false);
    }
  };

  // Launch Settings functions
  const loadLaunchSettings = async () => {
    setLoadingLaunchSettings(true);
    try {
      const response = await axios.get(`${API}/settings/global`);
      setLaunchSettings({
        plans_sales_enabled: response.data.plans_sales_enabled ?? true
      });
    } catch (error) {
      console.error('Erro ao carregar configurações de lançamento:', error);
    } finally {
      setLoadingLaunchSettings(false);
    }
  };

  const saveLaunchSettings = async () => {
    setSavingLaunchSettings(true);
    try {
      await axios.put(
        `${API}/backoffice/settings/global`,
        launchSettings
      );
      setLaunchSettingsSaved(true);
      setTimeout(() => setLaunchSettingsSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao guardar configurações:', error);
      alert('Erro ao guardar configurações de lançamento');
    } finally {
      setSavingLaunchSettings(false);
    }
  };

  // Emails functions
  const loadEmails = async () => {
    setLoadingEmails(true);
    try {
      const response = await axios.get(`${API}/backoffice/emails`);
      setEmails(response.data);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
    } finally {
      setLoadingEmails(false);
    }
  };

  const viewEmail = async (emailId) => {
    try {
      const response = await axios.get(`${API}/backoffice/emails/${emailId}`);
      setSelectedEmail(response.data);
      setShowEmailModal(true);
    } catch (error) {
      console.error('Erro ao carregar email:', error);
      alert('Erro ao carregar email');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === BACKOFFICE_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('backoffice_auth', 'true');
      loadContacts();
      loadRestaurants();
      loadPricing();
      loadLaunchSettings();
      loadEmails();
    } else {
      setLoginError('Senha incorreta');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('backoffice_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API}/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error('Erro ao carregar contactos:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const updateContactStatus = async (contactId, status) => {
    try {
      await axios.put(`${API}/contacts/${contactId}/status`, { status });
      setContacts(contacts.map(c => 
        c.id === contactId ? { ...c, status } : c
      ));
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, status });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Tem certeza que deseja eliminar este contacto?')) return;
    
    try {
      await axios.delete(`${API}/contacts/${contactId}`);
      setContacts(contacts.filter(c => c.id !== contactId));
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Erro ao eliminar contacto:', error);
    }
  };

  // Restaurant functions
  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const response = await axios.get(`${API}/backoffice/restaurants`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const createRestaurant = async () => {
    if (!newRestaurant.restaurant_name || !newRestaurant.admin_email || !newRestaurant.admin_password) {
      alert('Por favor preencha os campos obrigatórios');
      return;
    }
    
    setSavingRestaurant(true);
    try {
      await axios.post(`${API}/backoffice/restaurants`, newRestaurant);
      setShowAddRestaurantModal(false);
      setNewRestaurant({
        restaurant_name: '',
        description: '',
        address: '',
        phone: '',
        admin_name: '',
        admin_email: '',
        admin_password: ''
      });
      loadRestaurants();
    } catch (error) {
      console.error('Erro ao criar restaurante:', error);
      alert('Erro ao criar restaurante: ' + (error.response?.data?.detail || 'Tente novamente'));
    } finally {
      setSavingRestaurant(false);
    }
  };

  const deleteRestaurant = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o restaurante "${restaurantName}" e TODOS os dados associados? Esta ação é irreversível!`)) return;
    
    try {
      await axios.delete(`${API}/backoffice/restaurants/${restaurantId}`);
      loadRestaurants();
    } catch (error) {
      console.error('Erro ao eliminar restaurante:', error);
      alert('Erro ao eliminar restaurante');
    }
  };

  const loadRestaurantAdmins = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      const response = await axios.get(`${API}/backoffice/restaurants/${restaurant.id}/admins`);
      setRestaurantAdmins(response.data);
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    }
  };

  const addAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      alert('Por favor preencha todos os campos');
      return;
    }
    
    setSavingAdmin(true);
    try {
      await axios.post(`${API}/backoffice/restaurants/${selectedRestaurant.id}/admins`, newAdmin);
      setShowAddAdminModal(false);
      setNewAdmin({ name: '', email: '', password: '' });
      loadRestaurantAdmins(selectedRestaurant);
      loadRestaurants();
    } catch (error) {
      console.error('Erro ao adicionar admin:', error);
      alert('Erro: ' + (error.response?.data?.detail || 'Tente novamente'));
    } finally {
      setSavingAdmin(false);
    }
  };

  const deleteAdmin = async (userId, userName) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o administrador "${userName}"?`)) return;
    
    try {
      await axios.delete(`${API}/backoffice/admins/${userId}`);
      loadRestaurantAdmins(selectedRestaurant);
      loadRestaurants();
    } catch (error) {
      console.error('Erro ao eliminar admin:', error);
      alert('Erro ao eliminar administrador');
    }
  };

  const openReplyModal = (contact) => {
    setReplyData({
      subject: `Re: Contacto de ${contact.name}`,
      message: ''
    });
    setReplyError('');
    setReplySuccess(false);
    setShowReplyModal(true);
  };

  const sendReply = async () => {
    if (!replyData.subject.trim() || !replyData.message.trim()) {
      setReplyError('Por favor, preencha o assunto e a mensagem.');
      return;
    }

    setSendingReply(true);
    setReplyError('');

    try {
      await axios.post(`${API}/contacts/${selectedContact.id}/reply`, {
        subject: replyData.subject,
        message: replyData.message
      });
      
      setReplySuccess(true);
      
      // Update contact status locally if it was "new"
      if (selectedContact.status === 'new') {
        setContacts(contacts.map(c => 
          c.id === selectedContact.id ? { ...c, status: 'contacted' } : c
        ));
        setSelectedContact({ ...selectedContact, status: 'contacted' });
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowReplyModal(false);
        setReplySuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      setReplyError(error.response?.data?.detail || 'Erro ao enviar email. Verifique a configuração.');
    } finally {
      setSendingReply(false);
    }
  };

  const loadContactMessages = async (contactId) => {
    try {
      const response = await axios.get(`${API}/contacts/${contactId}/messages`);
      setContactMessages(response.data);
      setShowMessagesModal(true);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      converted: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      new: 'Novo',
      contacted: 'Contactado',
      converted: 'Convertido',
      closed: 'Fechado'
    };
    return statusTexts[status] || status;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone && contact.phone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    contacted: contacts.filter(c => c.status === 'contacted').length,
    converted: contacts.filter(c => c.status === 'converted').length
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: colors.light }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: colors.dark }}>
              Backoffice ZentraQR
            </h1>
            <p className="text-gray-600 mt-2">Acesso restrito</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': colors.primary }}
                data-testid="backoffice-password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
              data-testid="backoffice-login"
            >
              Entrar
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 py-3 text-gray-600 hover:text-gray-900 font-medium"
          >
            Voltar ao site
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.light }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto
        fixed lg:static
        z-50
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: colors.dark }}>ZentraQR</h2>
                <p className="text-xs text-gray-500">Backoffice</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'dashboard' ? { backgroundColor: colors.primary } : {}}
              data-testid="backoffice-dashboard-tab"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('contacts');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'contacts'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'contacts' ? { backgroundColor: colors.primary } : {}}
              data-testid="backoffice-contacts-tab"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Contactos</span>
              {stats.new > 0 && (
                <span 
                  className="ml-auto text-xs text-white rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  {stats.new}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('clients');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'clients'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'clients' ? { backgroundColor: colors.primary } : {}}
              data-testid="backoffice-clients-tab"
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Clientes & Planos</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('restaurants');
                setSidebarOpen(false);
                loadRestaurants();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'restaurants'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'restaurants' ? { backgroundColor: colors.primary } : {}}
              data-testid="backoffice-restaurants-tab"
            >
              <Store className="w-5 h-5" />
              <span className="font-medium">Restaurantes</span>
              <span 
                className="ml-auto text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5"
              >
                {restaurants.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('launch');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'launch'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'launch' ? { backgroundColor: colors.primary } : {}}
              data-testid="backoffice-launch-tab"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Lançamento</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('emails');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'emails'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'emails' ? { backgroundColor: colors.primary } : {}}
              data-testid="backoffice-emails-tab"
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Emails Enviados</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            data-testid="backoffice-logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <span className="font-bold" style={{ color: colors.dark }}>ZentraQR Backoffice</span>
          <div className="w-10"></div>
        </div>

        <div className="p-4 lg:p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-3xl font-bold mb-8" style={{ color: colors.dark }}>Dashboard</h1>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}15` }}>
                      <Users className="w-6 h-6" style={{ color: colors.secondary }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: colors.dark }}>{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Contactos</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: colors.dark }}>{stats.new}</p>
                  <p className="text-sm text-gray-500">Novos</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: colors.dark }}>{stats.contacted}</p>
                  <p className="text-sm text-gray-500">Contactados</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                      <CheckCircle className="w-6 h-6" style={{ color: colors.accent }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: colors.dark }}>{stats.converted}</p>
                  <p className="text-sm text-gray-500">Convertidos</p>
                </motion.div>
              </div>

              {/* Recent Contacts */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: colors.dark }}>
                  Contactos Recentes
                </h2>
                {contacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium" style={{ color: colors.dark }}>{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {getStatusText(contact.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold" style={{ color: colors.dark }}>Contactos</h1>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': colors.primary }}
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colors.primary }}
                  >
                    <option value="all">Todos</option>
                    <option value="new">Novos</option>
                    <option value="contacted">Contactados</option>
                    <option value="converted">Convertidos</option>
                    <option value="closed">Fechados</option>
                  </select>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Contacts List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {loadingContacts ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum contacto encontrado</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => setSelectedContact(contact)}
                          className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                            selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium" style={{ color: colors.dark }}>{contact.name}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                                  {getStatusText(contact.status)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {contact.email}
                                </span>
                                {contact.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {contact.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(contact.created_at).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contact Details */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  {selectedContact ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Detalhes</h2>
                        <button
                          onClick={() => deleteContact(selectedContact.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Nome</p>
                          <p className="font-medium" style={{ color: colors.dark }}>{selectedContact.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <a href={`mailto:${selectedContact.email}`} className="font-medium" style={{ color: colors.secondary }}>
                            {selectedContact.email}
                          </a>
                        </div>
                        {selectedContact.phone && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Telefone</p>
                            <a href={`tel:${selectedContact.phone}`} className="font-medium" style={{ color: colors.secondary }}>
                              {selectedContact.phone}
                            </a>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Data</p>
                          <p className="font-medium" style={{ color: colors.dark }}>
                            {new Date(selectedContact.created_at).toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Mensagem</p>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {selectedContact.message}
                          </p>
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Alterar Status</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['new', 'contacted', 'converted', 'closed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateContactStatus(selectedContact.id, status)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedContact.status === status
                                  ? getStatusColor(status)
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {getStatusText(status)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reply & History Actions */}
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                        <button
                          onClick={() => openReplyModal(selectedContact)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: colors.accent }}
                          data-testid="reply-button"
                        >
                          <Reply className="w-5 h-5" />
                          Responder por Email
                        </button>
                        <button
                          onClick={() => loadContactMessages(selectedContact.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border border-gray-200 text-gray-700 transition-all hover:bg-gray-50"
                          data-testid="history-button"
                        >
                          <History className="w-5 h-5" />
                          Ver Histórico
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Selecione um contacto para ver os detalhes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Clients & Plans Tab */}
          {activeTab === 'clients' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: colors.dark }}>Gestão de Planos</h1>
                  <p className="text-gray-500 mt-1">Configure os planos e suas características</p>
                </div>
                {pricingSaved && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Guardado!</span>
                  </div>
                )}
              </div>

              {loadingPricing ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Starter Plan */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100" style={{ backgroundColor: `${colors.secondary}08` }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: colors.secondary }}
                        >
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Plano Starter</h2>
                          <p className="text-sm text-gray-500">Para pequenos restaurantes</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (€)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={pricing.starter.monthly_price || ''}
                              onChange={(e) => setPricing({
                                ...pricing,
                                starter: { ...pricing.starter, monthly_price: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preço Anual (€)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={pricing.starter.annual_price || ''}
                              onChange={(e) => setPricing({
                                ...pricing,
                                starter: { ...pricing.starter, annual_price: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Equivalente a €{((pricing.starter.annual_price || 0) / 12).toFixed(2)}/mês
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Características do Plano</label>
                          <button
                            onClick={() => {
                              const newFeature = { key: `feature_${Date.now()}`, value: "", label: "Nova característica" };
                              setPricing({
                                ...pricing,
                                starter: {
                                  ...pricing.starter,
                                  features: [...(pricing.starter.features || []), newFeature]
                                }
                              });
                            }}
                            className="text-sm flex items-center gap-1 px-3 py-1 rounded-lg transition-all hover:bg-gray-100"
                            style={{ color: colors.primary }}
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(pricing.starter.features || []).map((feature, index) => (
                            <div key={feature.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group">
                              <GripVertical className="w-4 h-4 text-gray-300" />
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={feature.label}
                                onChange={(e) => {
                                  const newFeatures = [...pricing.starter.features];
                                  newFeatures[index] = { ...feature, label: e.target.value };
                                  setPricing({
                                    ...pricing,
                                    starter: { ...pricing.starter, features: newFeatures }
                                  });
                                }}
                                className="flex-1 bg-transparent border-none focus:outline-none text-gray-700"
                                placeholder="Descrição da característica"
                              />
                              <button
                                onClick={() => {
                                  const newFeatures = pricing.starter.features.filter((_, i) => i !== index);
                                  setPricing({
                                    ...pricing,
                                    starter: { ...pricing.starter, features: newFeatures }
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-white rounded-xl border-2 shadow-sm overflow-hidden" style={{ borderColor: colors.primary }}>
                    <div className="p-6 border-b border-gray-100" style={{ backgroundColor: `${colors.primary}08` }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Plano Pro</h2>
                          <p className="text-sm text-gray-500">O mais popular</p>
                        </div>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: colors.accent }}
                        >
                          Mais Popular
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (€)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={pricing.pro.monthly_price || ''}
                              onChange={(e) => setPricing({
                                ...pricing,
                                pro: { ...pricing.pro, monthly_price: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preço Anual (€)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                            <input
                              type="number"
                              step="0.01"
                              value={pricing.pro.annual_price || ''}
                              onChange={(e) => setPricing({
                                ...pricing,
                                pro: { ...pricing.pro, annual_price: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Equivalente a €{((pricing.pro.annual_price || 0) / 12).toFixed(2)}/mês
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Características do Plano</label>
                          <button
                            onClick={() => {
                              const newFeature = { key: `feature_${Date.now()}`, value: "", label: "Nova característica" };
                              setPricing({
                                ...pricing,
                                pro: {
                                  ...pricing.pro,
                                  features: [...(pricing.pro.features || []), newFeature]
                                }
                              });
                            }}
                            className="text-sm flex items-center gap-1 px-3 py-1 rounded-lg transition-all hover:bg-gray-100"
                            style={{ color: colors.primary }}
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(pricing.pro.features || []).map((feature, index) => (
                            <div key={feature.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group">
                              <GripVertical className="w-4 h-4 text-gray-300" />
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={feature.label}
                                onChange={(e) => {
                                  const newFeatures = [...pricing.pro.features];
                                  newFeatures[index] = { ...feature, label: e.target.value };
                                  setPricing({
                                    ...pricing,
                                    pro: { ...pricing.pro, features: newFeatures }
                                  });
                                }}
                                className="flex-1 bg-transparent border-none focus:outline-none text-gray-700"
                                placeholder="Descrição da característica"
                              />
                              <button
                                onClick={() => {
                                  const newFeatures = pricing.pro.features.filter((_, i) => i !== index);
                                  setPricing({
                                    ...pricing,
                                    pro: { ...pricing.pro, features: newFeatures }
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Plano Enterprise</h2>
                          <p className="text-sm text-gray-500">Para cadeias e franchises</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                          Preço Personalizado
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Nota:</strong> O plano Enterprise tem preço personalizado baseado nas necessidades do cliente. 
                          Configure apenas as características que serão incluídas.
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">Características do Plano</label>
                          <button
                            onClick={() => {
                              const newFeature = { key: `feature_${Date.now()}`, value: "", label: "Nova característica" };
                              setPricing({
                                ...pricing,
                                enterprise: {
                                  ...pricing.enterprise,
                                  features: [...(pricing.enterprise?.features || []), newFeature]
                                }
                              });
                            }}
                            className="text-sm flex items-center gap-1 px-3 py-1 rounded-lg transition-all hover:bg-gray-100"
                            style={{ color: colors.primary }}
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(pricing.enterprise?.features || []).map((feature, index) => (
                            <div key={feature.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group">
                              <GripVertical className="w-4 h-4 text-gray-300" />
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={feature.label}
                                onChange={(e) => {
                                  const newFeatures = [...(pricing.enterprise?.features || [])];
                                  newFeatures[index] = { ...feature, label: e.target.value };
                                  setPricing({
                                    ...pricing,
                                    enterprise: { ...pricing.enterprise, features: newFeatures }
                                  });
                                }}
                                className="flex-1 bg-transparent border-none focus:outline-none text-gray-700"
                                placeholder="Descrição da característica"
                              />
                              <button
                                onClick={() => {
                                  const newFeatures = (pricing.enterprise?.features || []).filter((_, i) => i !== index);
                                  setPricing({
                                    ...pricing,
                                    enterprise: { ...pricing.enterprise, features: newFeatures }
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={savePricing}
                      disabled={savingPricing}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {savingPricing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      Guardar Alterações
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Restaurants Tab */}
          {activeTab === 'restaurants' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold" style={{ color: colors.dark }}>Restaurantes</h1>
                <button
                  onClick={() => setShowAddRestaurantModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Plus className="w-5 h-5" />
                  Novo Restaurante
                </button>
              </div>
              
              {loadingRestaurants ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
                </div>
              ) : restaurants.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                  <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-bold mb-2" style={{ color: colors.dark }}>
                    Nenhum Restaurante
                  </h2>
                  <p className="text-gray-500">
                    Adicione o primeiro restaurante para começar.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {restaurants.map((restaurant) => (
                    <div 
                      key={restaurant.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${colors.primary}15` }}
                          >
                            <Store className="w-6 h-6" style={{ color: colors.primary }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg" style={{ color: colors.dark }}>
                              {restaurant.name}
                            </h3>
                            {restaurant.address && (
                              <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
                            )}
                            {restaurant.phone && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" /> {restaurant.phone}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                {restaurant.admin_count || 0} admin(s)
                              </span>
                              <span className="text-xs text-gray-400">
                                ID: {restaurant.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadRestaurantAdmins(restaurant)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all"
                            title="Ver Administradores"
                          >
                            <Users className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteRestaurant(restaurant.id, restaurant.name)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                            title="Eliminar Restaurante"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Restaurant Admins */}
              {selectedRestaurant && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: colors.dark }}>
                      Administradores - {selectedRestaurant.name}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddAdminModal(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-white text-sm transition-all hover:opacity-90"
                        style={{ backgroundColor: colors.accent }}
                      >
                        <UserPlus className="w-4 h-4" />
                        Adicionar Admin
                      </button>
                      <button
                        onClick={() => setSelectedRestaurant(null)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {restaurantAdmins.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>Nenhum administrador encontrado</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Password</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Criado</th>
                            <th className="px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {restaurantAdmins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium" style={{ color: colors.dark }}>
                                {admin.name}
                              </td>
                              <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                              <td className="px-6 py-4">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                                  {admin.plain_password || '••••••••'}
                                </code>
                              </td>
                              <td className="px-6 py-4 text-gray-500 text-sm">
                                {new Date(admin.created_at).toLocaleDateString('pt-PT')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => deleteAdmin(admin.id, admin.name)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: colors.dark }}>Preços da Landing Page</h1>
                  <p className="text-gray-500 mt-1">Configure os preços dos planos mostrados na página inicial</p>
                </div>
                {pricingSaved && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Guardado!</span>
                  </div>
                )}
              </div>

              {loadingPricing ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Starter Plan */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${colors.secondary}15` }}
                      >
                        <CreditCard className="w-6 h-6" style={{ color: colors.secondary }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Plano Starter</h2>
                        <p className="text-sm text-gray-500">Para pequenos restaurantes</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço Mensal (€)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={pricing.starter.monthly_price}
                            onChange={(e) => setPricing({
                              ...pricing,
                              starter: { ...pricing.starter, monthly_price: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            style={{ '--tw-ring-color': colors.primary }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço Anual (€) <span className="text-gray-400 font-normal">- Total do ano</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={pricing.starter.annual_price}
                            onChange={(e) => setPricing({
                              ...pricing,
                              starter: { ...pricing.starter, annual_price: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            style={{ '--tw-ring-color': colors.primary }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Equivalente a €{(pricing.starter.annual_price / 12).toFixed(2)}/mês
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-white rounded-xl border-2 shadow-sm p-6" style={{ borderColor: colors.primary }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Plano Pro</h2>
                        <p className="text-sm text-gray-500">O mais popular</p>
                      </div>
                      <span 
                        className="ml-auto px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: colors.accent }}
                      >
                        Mais Popular
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço Mensal (€)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={pricing.pro.monthly_price}
                            onChange={(e) => setPricing({
                              ...pricing,
                              pro: { ...pricing.pro, monthly_price: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            style={{ '--tw-ring-color': colors.primary }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço Anual (€) <span className="text-gray-400 font-normal">- Total do ano</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={pricing.pro.annual_price}
                            onChange={(e) => setPricing({
                              ...pricing,
                              pro: { ...pricing.pro, annual_price: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold"
                            style={{ '--tw-ring-color': colors.primary }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Equivalente a €{(pricing.pro.annual_price / 12).toFixed(2)}/mês
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={savePricing}
                  disabled={savingPricing}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {savingPricing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Guardar Alterações
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> Os preços alterados aqui serão refletidos imediatamente na landing page. 
                  O plano Enterprise mantém preço personalizado e requer contacto comercial.
                </p>
              </div>
            </div>
          )}

          {/* Launch Settings Tab */}
          {activeTab === 'launch' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: colors.dark }}>
                    <Sparkles className="w-8 h-8" style={{ color: colors.accent }} />
                    Configurações de Lançamento
                  </h1>
                  <p className="text-gray-500 mt-1">Controle quando os planos ficam disponíveis para venda</p>
                </div>
                {launchSettingsSaved && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Guardado!</span>
                  </div>
                )}
              </div>

              {loadingLaunchSettings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
                </div>
              ) : (
                <div className="max-w-3xl">
                  {/* Main Control Card */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>
                          Vendas de Planos
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                          {launchSettings.plans_sales_enabled 
                            ? '✅ As vendas estão ATIVAS. Os utilizadores podem subscrever planos normalmente.' 
                            : '🚀 Modo "Launching Soon" ATIVO. Os utilizadores veem uma mensagem de lançamento em breve.'}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <p className="font-semibold text-lg mb-1" style={{ color: colors.dark }}>
                          Ativar Vendas de Planos
                        </p>
                        <p className="text-sm text-gray-500">
                          {launchSettings.plans_sales_enabled 
                            ? 'Desativar para entrar em modo "Launching Soon"' 
                            : 'Ativar para permitir vendas de planos'}
                        </p>
                      </div>
                      <button
                        onClick={() => setLaunchSettings({
                          ...launchSettings,
                          plans_sales_enabled: !launchSettings.plans_sales_enabled
                        })}
                        className={`relative w-20 h-10 rounded-full transition-all duration-300 ${
                          launchSettings.plans_sales_enabled 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                        data-testid="plans-sales-toggle"
                      >
                        <div 
                          className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-all duration-300 ${
                            launchSettings.plans_sales_enabled 
                              ? 'left-11' 
                              : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Status Preview */}
                    <div className="mt-6 p-6 rounded-xl border-2 border-dashed" style={{ 
                      borderColor: launchSettings.plans_sales_enabled ? colors.accent : '#FFA500',
                      backgroundColor: launchSettings.plans_sales_enabled ? '#F0FDF4' : '#FFF7ED'
                    }}>
                      <p className="text-sm font-medium mb-2" style={{ 
                        color: launchSettings.plans_sales_enabled ? colors.accent : '#F59E0B'
                      }}>
                        {launchSettings.plans_sales_enabled ? '✅ ESTADO: VENDAS ATIVAS' : '🚀 ESTADO: LAUNCHING SOON'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {launchSettings.plans_sales_enabled 
                          ? 'Os botões "Começar Grátis" estão visíveis e funcionais na Landing Page.' 
                          : 'Os botões mostram "Launching Soon" e estão desativados. Aparece uma mensagem de preparação.'}
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={saveLaunchSettings}
                      disabled={savingLaunchSettings}
                      className="flex items-center gap-2 px-8 py-4 rounded-lg font-medium text-white text-lg transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {savingLaunchSettings ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar Configurações
                        </>
                      )}
                    </button>
                  </div>

                  {/* Info Cards */}
                  <div className="mt-8 grid gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Modo "Launching Soon"
                      </h3>
                      <p className="text-sm text-blue-700">
                        Quando desativado, os utilizadores veem:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                        <li>• Botão "Launching Soon" (desativado)</li>
                        <li>• Mensagem: "Estamos a preparar algo incrível"</li>
                        <li>• Badge "🚀 Lançamento em breve" acima dos planos</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Vendas Ativas
                      </h3>
                      <p className="text-sm text-green-700">
                        Quando ativado, os utilizadores podem subscrever planos normalmente através do botão "Começar Grátis".
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-1">
                        💡 Dica
                      </h3>
                      <p className="text-sm text-purple-700">
                        Use o modo "Launching Soon" antes do lançamento oficial para gerar expectativa. 
                        Ative as vendas quando estiver pronto para receber subscrições!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: colors.dark }}>
                    <Mail className="w-8 h-8" style={{ color: colors.accent }} />
                    Emails Enviados
                  </h1>
                  <p className="text-gray-500 mt-1">Histórico completo de todos os emails enviados pela plataforma</p>
                </div>
                <button
                  onClick={loadEmails}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingEmails ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>

              {loadingEmails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Nenhum email enviado ainda</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Destinatário</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {emails.map((email) => (
                          <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{email.recipient}</p>
                                {email.recipient_name && (
                                  <p className="text-sm text-gray-500">{email.recipient_name}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {email.subject}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 text-xs font-medium rounded-full capitalize"
                                style={{
                                  backgroundColor: email.email_type === 'welcome' ? '#EBF8FF' : '#F0FDF4',
                                  color: email.email_type === 'welcome' ? '#2C5282' : '#065F46'
                                }}
                              >
                                {email.email_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                email.status === 'sent' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {email.status === 'sent' ? '✓ Enviado' : '✗ Falhado'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(email.sent_at).toLocaleString('pt-PT', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => viewEmail(email.id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all"
                                style={{ 
                                  backgroundColor: colors.light,
                                  color: colors.primary
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email View Modal */}
      {showEmailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: colors.dark }}>
                Detalhes do Email
              </h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Email Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Destinatário</p>
                  <p className="text-base font-medium text-gray-900">{selectedEmail.recipient}</p>
                  {selectedEmail.recipient_name && (
                    <p className="text-sm text-gray-600">{selectedEmail.recipient_name}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full ${
                    selectedEmail.status === 'sent' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedEmail.status === 'sent' ? '✓ Enviado' : '✗ Falhado'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="text-base font-medium text-gray-900 capitalize">{selectedEmail.email_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Envio</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(selectedEmail.sent_at).toLocaleString('pt-PT')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Assunto</p>
                  <p className="text-base font-medium text-gray-900">{selectedEmail.subject}</p>
                </div>
                {selectedEmail.error_message && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-red-600 mb-1">Erro</p>
                    <p className="text-sm text-red-700 bg-red-50 p-3 rounded">{selectedEmail.error_message}</p>
                  </div>
                )}
              </div>

              {/* Email Content Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Pré-visualização do Email:</p>
                <div 
                  className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.content_html }}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddRestaurantModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Novo Restaurante</h2>
              <button
                onClick={() => setShowAddRestaurantModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="font-medium text-gray-700 mb-2">Dados do Restaurante</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={newRestaurant.restaurant_name}
                  onChange={(e) => setNewRestaurant({...newRestaurant, restaurant_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Nome do restaurante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newRestaurant.description}
                  onChange={(e) => setNewRestaurant({...newRestaurant, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  rows={2}
                  placeholder="Descrição breve"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
                  <input
                    type="text"
                    value={newRestaurant.address}
                    onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                    placeholder="Morada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={newRestaurant.phone}
                    onChange={(e) => setNewRestaurant({...newRestaurant, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                    placeholder="Telefone"
                  />
                </div>
              </div>

              <hr className="my-4" />
              <h3 className="font-medium text-gray-700 mb-2">Conta de Administrador</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Admin *</label>
                <input
                  type="text"
                  value={newRestaurant.admin_name}
                  onChange={(e) => setNewRestaurant({...newRestaurant, admin_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newRestaurant.admin_email}
                  onChange={(e) => setNewRestaurant({...newRestaurant, admin_email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={newRestaurant.admin_password}
                  onChange={(e) => setNewRestaurant({...newRestaurant, admin_password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Senha de acesso"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddRestaurantModal(false)}
                className="flex-1 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={createRestaurant}
                disabled={savingRestaurant}
                className="flex-1 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                {savingRestaurant ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Criar Restaurante
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdminModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Novo Administrador</h2>
                <p className="text-sm text-gray-500">{selectedRestaurant.name}</p>
              </div>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Senha de acesso"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="flex-1 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={addAdmin}
                disabled={savingAdmin}
                className="flex-1 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.accent }}
              >
                {savingAdmin ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Adicionar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Responder</h2>
                <p className="text-sm text-gray-500">Para: {selectedContact.email}</p>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {replySuccess ? (
                <div className="text-center py-8">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${colors.accent}20` }}
                  >
                    <CheckCircle className="w-8 h-8" style={{ color: colors.accent }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.dark }}>
                    Email Enviado!
                  </h3>
                  <p className="text-gray-500">
                    A sua resposta foi enviada para {selectedContact.email}
                  </p>
                </div>
              ) : (
                <>
                  {replyError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                      {replyError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                        Assunto
                      </label>
                      <input
                        type="text"
                        value={replyData.subject}
                        onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': colors.primary }}
                        data-testid="reply-subject"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                        Mensagem
                      </label>
                      <textarea
                        value={replyData.message}
                        onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
                        rows={6}
                        placeholder="Escreva a sua resposta..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 resize-none"
                        style={{ '--tw-ring-color': colors.primary }}
                        data-testid="reply-message"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowReplyModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={sendReply}
                      disabled={sendingReply}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: colors.primary }}
                      data-testid="send-reply-button"
                    >
                      {sendingReply ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          A enviar...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Enviar Email
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Messages History Modal */}
      {showMessagesModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold" style={{ color: colors.dark }}>Histórico</h2>
                <p className="text-sm text-gray-500">{selectedContact.name}</p>
              </div>
              <button
                onClick={() => setShowMessagesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Original message */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">
                  Mensagem original - {new Date(selectedContact.created_at).toLocaleString('pt-PT')}
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-gray-700">{selectedContact.message}</p>
                </div>
              </div>

              {/* Sent messages */}
              {contactMessages.length > 0 ? (
                <div className="space-y-4">
                  {contactMessages.map((msg) => (
                    <div key={msg.id}>
                      <p className="text-xs text-gray-400 mb-1">
                        Resposta enviada - {new Date(msg.created_at).toLocaleString('pt-PT')}
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <p className="font-medium text-sm mb-1" style={{ color: colors.dark }}>
                          {msg.subject}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhuma resposta enviada ainda</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowMessagesModal(false);
                  openReplyModal(selectedContact);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: colors.accent }}
              >
                <Reply className="w-5 h-5" />
                Enviar Nova Resposta
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BackofficePage;
