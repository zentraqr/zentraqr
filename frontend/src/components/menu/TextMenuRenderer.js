import React from 'react';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CafeTemplate from './templates/CafeTemplate';

/**
 * TextMenuRenderer - Componente compartilhado para renderizar menus de texto
 * Usado tanto no MenuPage (cliente) como no preview do backoffice
 * Agora usa categories/products unificados
 */
const TextMenuRenderer = ({ 
  categories = [],
  products = [],
  template = 'classic',
  onAddToCart,
  brandPrimary = '#1E2A4A',
  brandSecondary = '#10B981',
  previewMode = false
}) => {
  // Select template component
  const TemplateComponent = 
    template === 'modern' ? ModernTemplate :
    template === 'cafe' ? CafeTemplate :
    ClassicTemplate;

  // If no data, show placeholder
  if (categories.length === 0 || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {previewMode 
              ? 'Adicione categorias e produtos para visualizar o menu' 
              : 'Menu não disponível'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TemplateComponent
      categories={categories}
      products={products}
      onAddToCart={onAddToCart}
      brandPrimary={brandPrimary}
      brandSecondary={brandSecondary}
    />
  );
};

export default TextMenuRenderer;
