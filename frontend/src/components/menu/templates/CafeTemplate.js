import React from 'react';
import { Plus, Coffee } from 'lucide-react';

const CafeTemplate = ({ categories, products, onAddToCart, brandPrimary, brandSecondary }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Menu Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Coffee className="w-12 h-12 text-amber-700 dark:text-amber-500 mx-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 dark:text-amber-500 mb-3">
            Menu
          </h1>
        </div>

        {/* Menu Sections (Categories) */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryProducts = products.filter(p => p.category_id === category.id);
            
            if (categoryProducts.length === 0) return null;
            
            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-amber-200 dark:border-amber-900"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-500">
                    {category.name}
                  </h2>
                  <div className="flex-1 h-1 bg-amber-200 dark:bg-amber-900 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-amber-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-amber-100 dark:hover:bg-gray-600 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-amber-900 dark:text-white">
                              {product.name}
                            </h3>
                            {product.highlighted && (
                              <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full font-medium">
                                🌟 Popular
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-amber-800 dark:text-gray-300 text-sm">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-amber-700 dark:text-amber-500 whitespace-nowrap">
                            €{product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onAddToCart(product)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
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
        <div className="mt-10 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-600">
            ☕ Feito com carinho
          </p>
        </div>
      </div>
    </div>
  );
};

export default CafeTemplate;
