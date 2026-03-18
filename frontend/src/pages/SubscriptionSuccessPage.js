import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  PartyPopper,
  QrCode,
  Clock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Color palette
const colors = {
  primary: '#1E2A4A',
  accent: '#1a2342',
  green: '#10B981',
  red: '#EF4444',
  gray: '#64748B',
  light: '#F8FAFC',
  border: '#E2E8F0',
};

const logoUrl = 'https://customer-assets.emergentagent.com/job_qr-order-hub-5/artifacts/43m0gij6_zentra_qr.png';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { login } = useAuth();
  
  const sessionId = searchParams.get('session_id');
  const subscriptionId = searchParams.get('subscription_id');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [pollCount, setPollCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  
  const maxPolls = 10;
  const pollInterval = 2000;
  
  const t = {
    pt: {
      loading: 'A verificar pagamento...',
      success: 'Pagamento confirmado!',
      welcomeTitle: 'Bem-vindo ao ZentraQR!',
      welcomeSubtitle: 'A sua conta foi criada com sucesso',
      trialInfo: 'O seu período de teste de 14 dias começa agora',
      trialEnds: 'Termina em',
      goToDashboard: 'Ir para o Dashboard',
      setupTips: 'Próximos passos',
      tip1: 'Adicione os produtos ao menu',
      tip2: 'Personalize as cores do restaurante',
      tip3: 'Imprima os QR codes das mesas',
      error: 'Erro ao verificar pagamento',
      errorRetry: 'Por favor, aguarde ou contacte o suporte',
      retry: 'Tentar novamente'
    },
    en: {
      loading: 'Verifying payment...',
      success: 'Payment confirmed!',
      welcomeTitle: 'Welcome to ZentraQR!',
      welcomeSubtitle: 'Your account has been created successfully',
      trialInfo: 'Your 14-day trial starts now',
      trialEnds: 'Ends on',
      goToDashboard: 'Go to Dashboard',
      setupTips: 'Next steps',
      tip1: 'Add products to your menu',
      tip2: 'Customize restaurant colors',
      tip3: 'Print QR codes for tables',
      error: 'Error verifying payment',
      errorRetry: 'Please wait or contact support',
      retry: 'Try again'
    }
  };
  
  const txt = t[language] || t.pt;
  
  // Poll for payment status
  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/subscription/checkout/status/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }
        
        const data = await response.json();
        
        if (data.payment_status === 'paid') {
          setStatus('success');
          
          if (data.user) {
            setUserData(data.user);
          }
          
          if (data.trial_ends_at) {
            setTrialEndsAt(new Date(data.trial_ends_at));
          }
          
          // Auto-login if token is provided
          if (data.token && data.user) {
            login(data.token, data.user);
          }
          
          return; // Stop polling
        }
        
        // Continue polling
        if (pollCount < maxPolls) {
          setPollCount(prev => prev + 1);
          setTimeout(checkStatus, pollInterval);
        } else {
          setStatus('error');
        }
        
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (pollCount < maxPolls) {
          setPollCount(prev => prev + 1);
          setTimeout(checkStatus, pollInterval);
        } else {
          setStatus('error');
        }
      }
    };
    
    checkStatus();
  }, [sessionId]);
  
  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.light }}>
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src={logoUrl} alt="ZentraQR" className="w-10 h-10 object-contain" />
          <span className="font-bold text-xl" style={{ color: colors.primary }}>ZentraQR</span>
        </div>
        
        {/* Loading State */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border text-center"
            style={{ borderColor: colors.border }}
          >
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: colors.primary }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>{txt.loading}</h2>
            <p style={{ color: colors.gray }}>
              {language === 'pt' ? 'Por favor, aguarde...' : 'Please wait...'}
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[...Array(maxPolls)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ 
                    backgroundColor: i < pollCount ? colors.primary : colors.border 
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Success State */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border"
            style={{ borderColor: colors.border }}
          >
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${colors.green}15` }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: colors.green }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>{txt.welcomeTitle}</h2>
              <p style={{ color: colors.gray }}>{txt.welcomeSubtitle}</p>
            </div>
            
            {/* Trial Info */}
            <div 
              className="p-4 rounded-xl mb-6 flex items-center gap-3"
              style={{ backgroundColor: `${colors.green}10` }}
            >
              <Clock className="w-6 h-6" style={{ color: colors.green }} />
              <div>
                <p className="font-semibold" style={{ color: colors.green }}>{txt.trialInfo}</p>
                {trialEndsAt && (
                  <p className="text-sm" style={{ color: colors.gray }}>
                    {txt.trialEnds}: {formatDate(trialEndsAt)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Setup Tips */}
            <div className="mb-6">
              <p className="font-semibold mb-3" style={{ color: colors.primary }}>{txt.setupTips}:</p>
              <div className="space-y-2">
                {[txt.tip1, txt.tip2, txt.tip3].map((tip, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: colors.light }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {index + 1}
                    </div>
                    <span style={{ color: colors.gray }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={handleGoToDashboard}
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.accent }}
              data-testid="btn-go-dashboard"
            >
              {txt.goToDashboard}
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
        
        {/* Error State */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border text-center"
            style={{ borderColor: colors.border }}
          >
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${colors.red}15` }}
            >
              <AlertCircle className="w-8 h-8" style={{ color: colors.red }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>{txt.error}</h2>
            <p className="mb-6" style={{ color: colors.gray }}>{txt.errorRetry}</p>
            <button
              onClick={() => {
                setPollCount(0);
                setStatus('loading');
              }}
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary, color: 'white' }}
            >
              {txt.retry}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
