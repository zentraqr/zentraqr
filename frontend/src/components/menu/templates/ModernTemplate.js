import React from 'react';
import { Plus } from 'lucide-react';

const ModernTemplate = ({ categories, products, onAddToCart, brandPrimary, brandSecondary }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Menu Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light tracking-wide text-gray-900 dark:text-white mb-4">
            Menu
          </h1>
        </div>

        {/* Menu Sections (Categories) */}
        <div className="space-y-20">
          {categories.map((category) => {
            const categoryProducts = products.filter(p => p.category_id === category.id);
            
            if (categoryProducts.length === 0) return null;
            
            return (
              <div key={category.id}>
                <h2 className="text-3xl font-light tracking-wide text-gray-900 dark:text-white mb-10 text-center">
                  {category.name}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative bg-gray-50 dark:bg-gray-800 p-6 rounded-none hover:shadow-xl transition-all duration-300 border-l-2 border-transparent hover:border-gray-900 dark:hover:border-white"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-medium text-gray-900 dark:text-white tracking-wide">
                                {product.name}
                              </h3>
                              {product.highlighted && (
                                <span className="w-2 h-2 bg-gray-900 dark:bg-white rounded-full" title="Recomendação do Chef"></span>
                              )}
                            </div>
                            {product.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4">
                          <span className="text-2xl font-light text-gray-900 dark:text-white tracking-wider">
                            {product.price.toFixed(2)}€
                          </span>
                          <button
                            onClick={() => onAddToCart(product)}
                            className="opacity-0 group-hover:opacity-100 transition-all p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:scale-110"
                            title="Adicionar"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
          <div className="inline-block w-16 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
