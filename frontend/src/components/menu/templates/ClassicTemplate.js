import React from 'react';
import { Plus } from 'lucide-react';

const ClassicTemplate = ({ categories, products, onAddToCart, brandPrimary, brandSecondary }) => {
  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Menu Header */}
        <div className="text-center mb-12 pb-8 border-b-2 border-[#d4af37]">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-3">
            Menu
          </h1>
        </div>

        {/* Menu Sections (Categories) */}
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryProducts = products.filter(p => p.category_id === category.id);
            
            if (categoryProducts.length === 0) return null;
            
            return (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-[#d4af37]">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 italic mb-4">{category.description}</p>
                )}
                
                <div className="space-y-6">
                  {categoryProducts.map((product) => (
                    <div key={product.id} className="group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            {product.highlighted && (
                              <span className="text-xs bg-[#d4af37] text-white px-2 py-0.5 rounded">
                                ⭐ Chef
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm leading-relaxed">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-serif font-bold text-[#d4af37] dark:text-[#e5c158] whitespace-nowrap">
                            €{product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onAddToCart(product)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-[#d4af37] hover:text-white text-gray-600 dark:text-gray-400"
                            title="Adicionar ao carrinho"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Decorative divider */}
                      <div className="mt-4 border-b border-dotted border-gray-300 dark:border-gray-600"></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer decoration */}
        <div className="mt-12 text-center">
          <div className="inline-block px-8 py-2 border-t-2 border-b-2 border-[#d4af37]">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-serif italic">
              Bon Appétit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicTemplate;
