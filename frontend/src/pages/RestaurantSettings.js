import React, { useState, useEffect } from 'react';
import { Save, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RestaurantSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    logo_url: '',
    primary_color: '#1E2A4A',
    secondary_color: '#10B981'
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/${user.restaurant_id}`);
      setRestaurant(response.data);
      setFormData({
        name: response.data.name || '',
        description: response.data.description || '',
        address: response.data.address || '',
        phone: response.data.phone || '',
        logo_url: response.data.logo_url || '',
        primary_color: response.data.primary_color || '#1E2A4A',
        secondary_color: response.data.secondary_color || '#10B981'
      });
    } catch (error) {
      console.error('Erro ao carregar restaurante:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ficheiro muito grande. Máximo 5MB.' });
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor selecione uma imagem.' });
        return;
      }
      
      // Upload immediately
      setUploading(true);
      setMessage(null);

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const token = localStorage.getItem('token');
        const response = await axios.post(`${API}/upload/image`, formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        const uploadedUrl = `${BACKEND_URL}${response.data.url}`;
        setFormData({...formData, logo_url: uploadedUrl});
        setMessage({ type: 'success', text: 'Logo carregado! Clique em "Guardar Configurações" para aplicar.' });
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        setMessage({ type: 'error', text: 'Erro ao fazer upload da imagem' });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await axios.put(`${API}/restaurants/${user.restaurant_id}`, formData);
      setMessage({ type: 'success', text: 'Configurações guardadas! A atualizar...' });
      
      // Wait a bit before reload to show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the page to update logo in sidebar
      window.location.reload();
    } catch (error) {
      console.error('Erro ao guardar:', error);
      setMessage({ type: 'error', text: 'Erro ao guardar configurações' });
      setSaving(false);
    }
    // Don't set setSaving(false) here because we're reloading
  };

  const handlePreviewMenu = () => {
    // Get first table to use in preview
    axios.get(`${API}/tables/restaurant/${user.restaurant_id}`)
      .then(response => {
        const tables = response.data;
        if (tables && tables.length > 0) {
          const firstTable = tables[0];
          navigate(`/menu?restaurant_id=${user.restaurant_id}&table_id=${firstTable.id}&preview=true`);
        } else {
          // Create a dummy table ID for preview if no tables exist
          navigate(`/menu?restaurant_id=${user.restaurant_id}&table_id=preview-table&preview=true`);
        }
      })
      .catch(error => {
        console.error('Erro ao carregar mesas:', error);
        // Fallback to dummy table
        navigate(`/menu?restaurant_id=${user.restaurant_id}&table_id=preview-table&preview=true`);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E2A4A] dark:border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#18181B] dark:text-white mb-8">Configurações do Restaurante</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sticky top-6">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Pré-visualização</h2>
            
            <div 
              className="rounded-xl p-6 mb-4 text-white"
              style={{ 
                background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                {formData.logo_url ? (
                  <img 
                    src={formData.logo_url} 
                    alt="Logo" 
                    className="w-16 h-16 rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/60" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xl">{formData.name || 'Nome do Restaurante'}</h3>
                  <p className="text-sm text-white/80">Mesa 1</p>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={handlePreviewMenu}
                className="w-full py-3 px-4 rounded-full font-bold shadow-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: formData.primary_color, color: 'white' }}
              >
                Ver Menu
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[#71717A] dark:text-gray-400 mb-1">Cor Primária</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: formData.primary_color }}
                  ></div>
                  <span className="font-mono text-gray-900 dark:text-gray-300">{formData.primary_color}</span>
                </div>
              </div>
              
              <div>
                <p className="text-[#71717A] dark:text-gray-400 mb-1">Cor Secundária</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: formData.secondary_color }}
                  ></div>
                  <span className="font-mono text-gray-900 dark:text-gray-300">{formData.secondary_color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Informações Básicas</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#18181B] dark:text-white mb-2">
                  Nome do Restaurante *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A4A] dark:focus:ring-blue-500"
                  placeholder="Ex: Restaurante Demo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#18181B] dark:text-white mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A4A] dark:focus:ring-blue-500"
                  rows={3}
                  placeholder="Breve descrição do restaurante"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#18181B] dark:text-white mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A4A] dark:focus:ring-blue-500"
                    placeholder="Rua, número"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#18181B] dark:text-white mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A4A] dark:focus:ring-blue-500"
                    placeholder="+351 912 345 678"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-6 mb-6">
              <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Branding</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#18181B] dark:text-white mb-2">
                    Logo do Restaurante
                  </label>
                  
                  {/* Current Logo Preview */}
                  {formData.logo_url && (
                    <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo atual" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#18181B] dark:text-white">Logo atual</p>
                        <p className="text-xs text-[#71717A] dark:text-gray-400">Escolha um novo ficheiro para substituir</p>
                      </div>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="flex flex-col gap-3">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#1E2A4A] dark:hover:border-blue-500 transition-all">
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#1E2A4A] dark:border-blue-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">A carregar...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Clique para escolher ficheiro</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    
                    <p className="text-xs text-[#71717A] dark:text-gray-400">
                      Formatos aceites: JPG, PNG, GIF, WebP. Máximo 5MB. Recomendado: 200x200px
                    </p>
                    
                    {/* Or URL input */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">ou use um URL</span>
                      </div>
                    </div>
                    
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A4A] dark:focus:ring-blue-500"
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#18181B] dark:text-white mb-2">
                      Cor Primária
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="w-16 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A4A] dark:focus:ring-blue-500 font-mono text-sm"
                        placeholder="#1E2A4A"
                      />
                    </div>
                    <p className="text-xs text-[#71717A] dark:text-gray-400 mt-1">
                      Usada em botões e destaques
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#18181B] dark:text-white mb-2">
                      Cor Secundária
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="w-16 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A4A] dark:focus:ring-blue-500 font-mono text-sm"
                        placeholder="#10B981"
                      />
                    </div>
                    <p className="text-xs text-[#71717A] dark:text-gray-400 mt-1">
                      Usada em elementos de sucesso
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pagamentos
              </h2>

              <div className="space-y-6">
                {/* Online Payments Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[#18181B]">Pagamentos Online</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        Em breve
                      </span>
                    </div>
                    <p className="text-sm text-[#71717A]">
                      Permitir que os clientes paguem online através de cartão de crédito/débito
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      disabled
                      className="relative w-14 h-8 bg-gray-300 rounded-full cursor-not-allowed opacity-60"
                      title="Pagamentos online serão ativados numa próxima versão da plataforma."
                    >
                      <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow transition-all" />
                    </button>
                  </div>
                </div>

                {/* Info box about current payment method */}
                <div className="p-4 bg-[#1E2A4A]/5 rounded-xl border border-[#1E2A4A]/10">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#1E2A4A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-[#1E2A4A] font-medium">
                        Método de Pagamento Atual
                      </p>
                      <p className="text-sm text-[#1E2A4A]/70 mt-1">
                        Os seus clientes fazem o pedido através da aplicação e o pagamento é realizado diretamente no restaurante (balcão ou mesa).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coming soon features */}
                <div className="border border-dashed border-gray-300 rounded-xl p-4">
                  <p className="text-sm font-medium text-[#71717A] mb-3">Funcionalidades em desenvolvimento:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-[#71717A]">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Pagamentos com cartão via Stripe
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#71717A]">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      MB Way
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#71717A]">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Divisão de conta
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#1E2A4A] dark:bg-blue-700 hover:bg-[#0f1529] dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Configurações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;
