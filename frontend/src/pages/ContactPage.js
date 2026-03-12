import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Menu,
  X,
  Send,
  Mail,
  Phone,
  User,
  MessageSquare,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

// Color palette (same as landing page)
const colors = {
  primary: '#1E40AF',
  secondary: '#2563EB',
  accent: '#10B981',
  dark: '#111827',
  light: '#F3F4F6',
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl" style={{ color: colors.dark }}>
                  QRMenu
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Success Message */}
        <div className="pt-24 min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.light }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${colors.accent}20` }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: colors.accent }} />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.dark }}>
              Mensagem Enviada!
            </h2>
            <p className="text-gray-600 mb-8">
              Obrigado pelo seu contacto. Responderemos em breve.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Voltar ao Início
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl" style={{ color: colors.dark }}>
                QRMenu
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/admin/login')}
                className="px-5 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: colors.dark }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: colors.dark }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 py-4 px-4"
          >
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 py-2 text-left font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/admin/login')}
                className="px-5 py-3 rounded-lg font-semibold text-center"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* CONTACT SECTION */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 min-h-screen" style={{ backgroundColor: colors.light }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 
                className="text-4xl sm:text-5xl font-bold leading-tight mb-6"
                style={{ color: colors.dark }}
              >
                Entre em
                <span style={{ color: colors.secondary }}> Contacto</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Tem alguma dúvida ou quer saber mais sobre o QRMenu? 
                Preencha o formulário e entraremos em contacto consigo em breve.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${colors.secondary}15` }}
                  >
                    <Mail className="w-6 h-6" style={{ color: colors.secondary }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: colors.dark }}>Email</p>
                    <p className="text-gray-600">zentraqr@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${colors.accent}15` }}
                  >
                    <Phone className="w-6 h-6" style={{ color: colors.accent }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: colors.dark }}>Telefone</p>
                    <p className="text-gray-600">+351 936563655 </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: colors.dark }}>
                  Envie-nos uma mensagem
                </h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                      Nome *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="O seu nome"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{ '--tw-ring-color': colors.primary }}
                        data-testid="contact-name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{ '--tw-ring-color': colors.primary }}
                        data-testid="contact-email"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+351 912 345 678"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{ '--tw-ring-color': colors.primary }}
                        data-testid="contact-phone"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                      Mensagem *
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Como podemos ajudar?"
                        rows={4}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                        style={{ '--tw-ring-color': colors.primary }}
                        data-testid="contact-message"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-lg font-bold text-lg text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: colors.accent }}
                    data-testid="contact-submit"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        A enviar...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Mensagem
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold" style={{ color: colors.dark }}>
                QRMenu
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 QRMenu. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
