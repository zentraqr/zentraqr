import React from 'react';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CafeTemplate from './templates/CafeTemplate';

/**
 * TextMenuRenderer - Componente compartilhado para renderizar menus de texto
 * Usado tanto no MenuPage (cliente) como no preview do backoffice
 */
const TextMenuRenderer = ({ 
  menuData, 
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

  // If no menu data, show placeholder
  if (!menuData || !menuData.sections || menuData.sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {previewMode 
              ? 'Adicione secções e items para visualizar o menu' 
              : 'Menu não disponível'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TemplateComponent
      menuData={menuData}
      onAddToCart={onAddToCart}
      brandPrimary={brandPrimary}
      brandSecondary={brandSecondary}
    />
  );
};

export default TextMenuRenderer;
