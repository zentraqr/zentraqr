import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, Store, Hash, ArrowRight, Loader2,
  CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const colors = {
  primary: '#1E2A4A',
  accent: '#1a2342',
  green: '#10B981',
  gray: '#64748B',
  light: '#F8FAFC',
  border: '#E2E8F0',
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurantName: '',
    tablesCount: 5
  });

  const API = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.restaurantName) {
      setError('Por favor preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A password deve ter no mínimo 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao criar conta');
      }

      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to onboarding
      navigate('/onboarding');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.light }}>
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
              ZentraQR
            </h1>
            <p style={{ color: colors.gray }}>
              Crie a sua conta e comece a digitalizar o seu restaurante
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border" style={{ borderColor: colors.border }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
              Criar Conta
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: colors.border,
                      '--tw-ring-color': colors.primary
                    }}
                    placeholder="João Silva"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: colors.border,
                      '--tw-ring-color': colors.primary
                    }}
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: colors.border,
                      '--tw-ring-color': colors.primary
                    }}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: colors.gray }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: colors.gray }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                  Nome do Restaurante *
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => updateField('restaurantName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: colors.border,
                      '--tw-ring-color': colors.primary
                    }}
                    placeholder="Restaurante Example"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Tables Count */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primary }}>
                  Número de Mesas
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                  <input
                    type="number"
                    value={formData.tablesCount}
                    onChange={(e) => updateField('tablesCount', parseInt(e.target.value) || 1)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: colors.border,
                      '--tw-ring-color': colors.primary
                    }}
                    min="1"
                    max="100"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: colors.gray }}>
                  Pode adicionar mais mesas depois
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
                style={{ backgroundColor: colors.primary }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar Conta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Trial Info */}
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.light }}>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.green }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.primary }}>
                    14 dias de teste grátis
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.gray }}>
                    Sem necessidade de cartão de crédito. Cancele a qualquer momento.
                  </p>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm mt-6" style={{ color: colors.gray }}>
              Já tem conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold hover:underline"
                style={{ color: colors.primary }}
              >
                Entrar
              </button>
            </p>
          </div>

          {/* Back to Landing */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm hover:underline"
              style={{ color: colors.gray }}
            >
              ← Voltar à página inicial
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Benefits (Hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">
            Digitalize o seu restaurante em minutos
          </h2>
          <ul className="space-y-4">
            {[
              'Menu digital via QR Code',
              'Gestão de pedidos em tempo real',
              'Dashboard com estatísticas',
              'Notificações instantâneas',
              'Suporte técnico dedicado'
            ].map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: colors.green }} />
                <span className="text-lg">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 p-6 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-sm opacity-90">
              "A ZentraQR transformou completamente a forma como gerimos o nosso restaurante. 
              Pedidos mais rápidos, clientes mais satisfeitos!"
            </p>
            <p className="text-sm font-semibold mt-3">
              — Chef Mário, Restaurante O Porto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
