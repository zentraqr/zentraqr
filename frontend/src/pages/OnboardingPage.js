import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import {
  QrCode,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mail,
  Lock,
  Store,
  Phone,
  Users,
  CreditCard,
  Sparkles,
  Shield,
  Clock,
  Globe,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Color palette
const colors = {
  primary: '#1E2A4A',
  secondary: '#3B5998',
  accent: '#1a2342',
  dark: '#1E2A4A',
  light: '#F8FAFC',
  white: '#FFFFFF',
  gray: '#64748B',
  border: '#E2E8F0',
  green: '#10B981',
  red: '#EF4444',
};

// Logo URL
const logoUrl = 'https://customer-assets.emergentagent.com/job_qr-order-hub-5/artifacts/43m0gij6_zentra_qr.png';

// Translations
const t = {
  pt: {
    title: 'Criar Conta',
    subtitle: 'Configure o seu restaurante em poucos minutos',
    step1: 'Conta',
    step2: 'Restaurante',
    step3: 'Confirmar',
    // Step 1
    yourInfo: 'Os seus dados',
    name: 'Nome completo',
    namePlaceholder: 'João Silva',
    email: 'Email',
    emailPlaceholder: 'joao@restaurante.pt',
    password: 'Password',
    passwordPlaceholder: 'Mínimo 6 caracteres',
    // Step 2
    restaurantInfo: 'Dados do restaurante',
    restaurantName: 'Nome do restaurante',
    restaurantNamePlaceholder: 'Restaurante O Bom Sabor',
    restaurantPhone: 'Telefone (opcional)',
    restaurantPhonePlaceholder: '+351 912 345 678',
    tablesCount: 'Número de mesas',
    tablesHelp: 'Pode alterar depois no painel',
    // Step 3
    confirmTitle: 'Confirmar subscrição',
    selectedPlan: 'Plano selecionado',
    billingCycle: 'Ciclo de faturação',
    monthly: 'Mensal',
    annual: 'Anual',
    price: 'Preço',
    trialInfo: '14 dias grátis, depois',
    perMonth: '/mês',
    perYear: '/ano',
    features: 'Incluído no plano',
    // Buttons
    next: 'Continuar',
    back: 'Voltar',
    createAccount: 'Criar Conta e Pagar',
    processing: 'A processar...',
    // Errors
    errorRequired: 'Este campo é obrigatório',
    errorEmail: 'Email inválido',
    errorPassword: 'Password deve ter pelo menos 6 caracteres',
    errorGeneric: 'Ocorreu um erro. Tente novamente.',
    // Success
    redirecting: 'A redirecionar para pagamento...',
    // Launching Soon
    launchingSoon: 'Lançamento em Breve',
    launchingMessage: 'Estamos a preparar algo incrível. Lançamento em breve.',
    launchingBadge: '🚀 Lançamento em breve',
    // Plan features
    tables10: 'Até 10 mesas',
    tables30: 'Até 30 mesas',
    menuUnlimited: 'Menu ilimitado',
    dashboardBasic: 'Dashboard básico',
    dashboardAdvanced: 'Dashboard avançado',
    emailSupport: 'Suporte por email',
    prioritySupport: 'Suporte prioritário',
    onlinePayments: 'Pagamentos online',
    realTimeNotifications: 'Notificações em tempo real',
  },
  en: {
    title: 'Create Account',
    subtitle: 'Set up your restaurant in minutes',
    step1: 'Account',
    step2: 'Restaurant',
    step3: 'Confirm',
    // Step 1
    yourInfo: 'Your information',
    name: 'Full name',
    namePlaceholder: 'John Smith',
    email: 'Email',
    emailPlaceholder: 'john@restaurant.com',
    password: 'Password',
    passwordPlaceholder: 'Minimum 6 characters',
    // Step 2
    restaurantInfo: 'Restaurant details',
    restaurantName: 'Restaurant name',
    restaurantNamePlaceholder: 'The Good Taste Restaurant',
    restaurantPhone: 'Phone (optional)',
    restaurantPhonePlaceholder: '+1 234 567 8900',
    tablesCount: 'Number of tables',
    tablesHelp: 'You can change this later',
    // Step 3
    confirmTitle: 'Confirm subscription',
    selectedPlan: 'Selected plan',
    billingCycle: 'Billing cycle',
    monthly: 'Monthly',
    annual: 'Annual',
    price: 'Price',
    trialInfo: '14 days free, then',
    perMonth: '/month',
    perYear: '/year',
    features: 'Included in plan',
    // Buttons
    next: 'Continue',
    back: 'Back',
    createAccount: 'Create Account & Pay',
    processing: 'Processing...',
    // Errors
    errorRequired: 'This field is required',
    errorEmail: 'Invalid email',
    errorPassword: 'Password must be at least 6 characters',
    errorGeneric: 'An error occurred. Please try again.',
    // Success
    redirecting: 'Redirecting to payment...',
    // Launching Soon
    launchingSoon: 'Launching Soon',
    launchingMessage: 'We are preparing something incredible. Launching soon.',
    launchingBadge: '🚀 Launching Soon',
    // Plan features
    tables10: 'Up to 10 tables',
    tables30: 'Up to 30 tables',
    menuUnlimited: 'Unlimited menu',
    dashboardBasic: 'Basic dashboard',
    dashboardAdvanced: 'Advanced dashboard',
    emailSupport: 'Email support',
    prioritySupport: 'Priority support',
    onlinePayments: 'Online payments',
    realTimeNotifications: 'Real-time notifications',
  }
};

// Plan details
const plans = {
  starter: {
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 276,
    featuresKeys: ['tables10', 'menuUnlimited', 'dashboardBasic', 'emailSupport']
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 59,
    annualPrice: 564,
    featuresKeys: ['tables30', 'menuUnlimited', 'dashboardAdvanced', 'onlinePayments', 'realTimeNotifications', 'prioritySupport']
  }
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const txt = t[language] || t.pt;
  
  // Get plan from URL params
  const planId = searchParams.get('plan') || 'starter';
  const billingFromUrl = searchParams.get('billing') || 'monthly';
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [plansSalesEnabled, setPlansSalesEnabled] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Load global settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('🔍 Loading global settings from:', `${API_URL}/api/settings/global`);
        const response = await fetch(`${API_URL}/api/settings/global`);
        const data = await response.json();
        console.log('📦 Settings loaded:', data);
        console.log('🚀 Plans sales enabled:', data.plans_sales_enabled);
        setPlansSalesEnabled(data.plans_sales_enabled ?? true);
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        setPlansSalesEnabled(true); // Default to enabled on error
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurantName: '',
    restaurantPhone: '',
    tablesCount: 5,
    planId: planId,
    billingCycle: billingFromUrl
  });
  
  const plan = plans[formData.planId] || plans.starter;
  const price = formData.billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const monthlyEquivalent = formData.billingCycle === 'annual' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
  
  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = txt.errorRequired;
      if (!formData.email.trim()) {
        newErrors.email = txt.errorRequired;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = txt.errorEmail;
      }
      if (!formData.password) {
        newErrors.password = txt.errorRequired;
      } else if (formData.password.length < 6) {
        newErrors.password = txt.errorPassword;
      }
    }
    
    if (step === 2) {
      if (!formData.restaurantName.trim()) newErrors.restaurantName = txt.errorRequired;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };
  
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Step 1: Register
      const registerResponse = await fetch(`${API_URL}/api/subscription/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          restaurant_name: formData.restaurantName,
          restaurant_phone: formData.restaurantPhone || null,
          tables_count: formData.tablesCount,
          plan_id: formData.planId,
          billing_cycle: formData.billingCycle
        })
      });
      
      const registerData = await registerResponse.json();
      
      if (!registerResponse.ok) {
        throw new Error(registerData.detail || txt.errorGeneric);
      }
      
      // Step 2: Create checkout session
      const checkoutResponse = await fetch(`${API_URL}/api/subscription/${registerData.subscription_id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_url: window.location.origin
        })
      });
      
      const checkoutData = await checkoutResponse.json();
      
      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.detail || txt.errorGeneric);
      }
      
      // Redirect to Stripe
      if (checkoutData.checkout_url) {
        window.location.href = checkoutData.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || txt.errorGeneric);
      setIsLoading(false);
    }
  };
  
  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };
  
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.light }}>
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity"
              style={{ color: colors.gray }}
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'pt' ? 'Voltar ao início' : 'Back to home'}
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <img src={logoUrl} alt="ZentraQR" className="w-10 h-10 object-contain" />
              <span className="font-bold text-xl" style={{ color: colors.primary }}>ZentraQR</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>{txt.title}</h1>
            <p style={{ color: colors.gray }}>{txt.subtitle}</p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep >= step ? 'text-white' : ''
                  }`}
                  style={{ 
                    backgroundColor: currentStep >= step ? colors.primary : colors.border,
                    color: currentStep >= step ? 'white' : colors.gray
                  }}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div 
                    className="flex-1 h-1 rounded"
                    style={{ backgroundColor: currentStep > step ? colors.primary : colors.border }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-lg flex items-center gap-3"
                style={{ backgroundColor: `${colors.red}15`, color: colors.red }}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Step 1: Account Info */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="font-semibold text-lg mb-4" style={{ color: colors.dark }}>
                  <User className="w-5 h-5 inline mr-2" />
                  {txt.yourInfo}
                </h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    {txt.name}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder={txt.namePlaceholder}
                    className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-300 focus:ring-red-200' : 'focus:ring-blue-200'
                    }`}
                    style={{ borderColor: errors.name ? colors.red : colors.border }}
                    data-testid="input-name"
                  />
                  {errors.name && <p className="text-sm mt-1" style={{ color: colors.red }}>{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    {txt.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder={txt.emailPlaceholder}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-red-300 focus:ring-red-200' : 'focus:ring-blue-200'
                      }`}
                      style={{ borderColor: errors.email ? colors.red : colors.border }}
                      data-testid="input-email"
                    />
                  </div>
                  {errors.email && <p className="text-sm mt-1" style={{ color: colors.red }}>{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    {txt.password}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder={txt.passwordPlaceholder}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                        errors.password ? 'border-red-300 focus:ring-red-200' : 'focus:ring-blue-200'
                      }`}
                      style={{ borderColor: errors.password ? colors.red : colors.border }}
                      data-testid="input-password"
                    />
                  </div>
                  {errors.password && <p className="text-sm mt-1" style={{ color: colors.red }}>{errors.password}</p>}
                </div>
                
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.accent }}
                  data-testid="btn-next-step1"
                >
                  {txt.next}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
            
            {/* Step 2: Restaurant Info */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="font-semibold text-lg mb-4" style={{ color: colors.dark }}>
                  <Store className="w-5 h-5 inline mr-2" />
                  {txt.restaurantInfo}
                </h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    {txt.restaurantName}
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => updateField('restaurantName', e.target.value)}
                    placeholder={txt.restaurantNamePlaceholder}
                    className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                      errors.restaurantName ? 'border-red-300 focus:ring-red-200' : 'focus:ring-blue-200'
                    }`}
                    style={{ borderColor: errors.restaurantName ? colors.red : colors.border }}
                    data-testid="input-restaurant-name"
                  />
                  {errors.restaurantName && <p className="text-sm mt-1" style={{ color: colors.red }}>{errors.restaurantName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    {txt.restaurantPhone}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray }} />
                    <input
                      type="tel"
                      value={formData.restaurantPhone}
                      onChange={(e) => updateField('restaurantPhone', e.target.value)}
                      placeholder={txt.restaurantPhonePlaceholder}
                      className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-200"
                      style={{ borderColor: colors.border }}
                      data-testid="input-restaurant-phone"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    {txt.tablesCount}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max={formData.planId === 'pro' ? 30 : 10}
                      value={formData.tablesCount}
                      onChange={(e) => updateField('tablesCount', parseInt(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: colors.primary }}
                    />
                    <span 
                      className="w-12 h-10 flex items-center justify-center rounded-lg font-bold"
                      style={{ backgroundColor: colors.light, color: colors.primary }}
                    >
                      {formData.tablesCount}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: colors.gray }}>{txt.tablesHelp}</p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-lg font-semibold border transition-all hover:bg-gray-50"
                    style={{ borderColor: colors.border, color: colors.gray }}
                    data-testid="btn-back-step2"
                  >
                    {txt.back}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.accent }}
                    data-testid="btn-next-step2"
                  >
                    {txt.next}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Confirm */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="font-semibold text-lg mb-4" style={{ color: colors.dark }}>
                  <CreditCard className="w-5 h-5 inline mr-2" />
                  {txt.confirmTitle}
                </h2>
                
                {/* Launching Soon Badge */}
                {!plansSalesEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-xl border-2 border-orange-400 bg-orange-50 text-center"
                  >
                    <p className="text-orange-600 font-bold flex items-center justify-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5" />
                      {txt.launchingBadge}
                    </p>
                    <p className="text-sm text-orange-700">
                      {txt.launchingMessage}
                    </p>
                  </motion.div>
                )}
                
                {/* Debug Info (remove in production) */}
                {console.log('🔍 DEBUG - plansSalesEnabled:', plansSalesEnabled, 'loadingSettings:', loadingSettings)}
                
                {/* Plan Summary */}
                <div 
                  className="p-5 rounded-xl border"
                  style={{ backgroundColor: colors.white, borderColor: colors.border }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm" style={{ color: colors.gray }}>{txt.selectedPlan}</p>
                      <p className="font-bold text-lg" style={{ color: colors.primary }}>{plan.name}</p>
                    </div>
                    <Sparkles className="w-8 h-8" style={{ color: colors.accent }} />
                  </div>
                  
                  {/* Billing Toggle */}
                  <div className="mb-4">
                    <p className="text-sm mb-2" style={{ color: colors.gray }}>{txt.billingCycle}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateField('billingCycle', 'monthly')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.billingCycle === 'monthly' ? 'text-white' : ''
                        }`}
                        style={{ 
                          backgroundColor: formData.billingCycle === 'monthly' ? colors.primary : colors.light,
                          color: formData.billingCycle === 'monthly' ? 'white' : colors.gray
                        }}
                      >
                        {txt.monthly}
                      </button>
                      <button
                        onClick={() => updateField('billingCycle', 'annual')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                          formData.billingCycle === 'annual' ? 'text-white' : ''
                        }`}
                        style={{ 
                          backgroundColor: formData.billingCycle === 'annual' ? colors.primary : colors.light,
                          color: formData.billingCycle === 'annual' ? 'white' : colors.gray
                        }}
                      >
                        {txt.annual}
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: colors.accent, color: 'white' }}
                        >
                          -20%
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-3xl font-bold" style={{ color: colors.dark }}>€{price}</span>
                      <span style={{ color: colors.gray }}>
                        {formData.billingCycle === 'monthly' ? txt.perMonth : txt.perYear}
                      </span>
                    </div>
                    <p className="text-sm flex items-center gap-1" style={{ color: colors.green }}>
                      <Clock className="w-4 h-4" />
                      {txt.trialInfo} €{monthlyEquivalent}{txt.perMonth}
                    </p>
                  </div>
                </div>
                
                {/* Features */}
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: colors.dark }}>{txt.features}:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {plan.featuresKeys.map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" style={{ color: colors.green }} />
                        <span className="text-sm" style={{ color: colors.gray }}>{txt[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 py-2 text-sm" style={{ color: colors.gray }}>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" style={{ color: colors.green }} />
                    {language === 'pt' ? 'Pagamento seguro' : 'Secure payment'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" style={{ color: colors.green }} />
                    {language === 'pt' ? '14 dias grátis' : '14 days free'}
                  </span>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleBack}
                    disabled={isLoading || loadingSettings}
                    className="flex-1 py-3 rounded-lg font-semibold border transition-all hover:bg-gray-50 disabled:opacity-50"
                    style={{ borderColor: colors.border, color: colors.gray }}
                    data-testid="btn-back-step3"
                  >
                    {txt.back}
                  </button>
                  <button
                    onClick={plansSalesEnabled ? handleSubmit : undefined}
                    disabled={isLoading || loadingSettings || !plansSalesEnabled}
                    className="flex-1 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: plansSalesEnabled ? colors.accent : colors.gray 
                    }}
                    data-testid="btn-submit"
                  >
                    {loadingSettings ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {language === 'pt' ? 'A carregar...' : 'Loading...'}
                      </>
                    ) : !plansSalesEnabled ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        {txt.launchingSoon}
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {txt.processing}
                      </>
                    ) : (
                      <>
                        {txt.createAccount}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Launching Soon Message below button */}
                {!plansSalesEnabled && !loadingSettings && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-center text-orange-600 italic mt-2"
                  >
                    {txt.launchingMessage}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Language Toggle */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: colors.gray }}
            >
              <Globe className="w-4 h-4" />
              {language === 'pt' ? 'English' : 'Português'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Visual */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center p-12"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-2xl mx-auto mb-8 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {language === 'pt' ? 'Comece em minutos' : 'Get started in minutes'}
          </h2>
          <p className="text-white/70 mb-8">
            {language === 'pt' 
              ? 'Configure o seu menu digital, imprima os QR codes e comece a receber pedidos hoje mesmo.'
              : 'Set up your digital menu, print QR codes, and start receiving orders today.'}
          </p>
          <div className="space-y-4">
            {[
              { icon: Clock, text: language === 'pt' ? 'Configuração em 5 minutos' : '5 minute setup' },
              { icon: Shield, text: language === 'pt' ? '14 dias grátis' : '14 days free trial' },
              { icon: CheckCircle2, text: language === 'pt' ? 'Sem compromisso' : 'No commitment' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-white/80">
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
