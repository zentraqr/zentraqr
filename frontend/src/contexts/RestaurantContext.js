import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children, restaurantId }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/${restaurantId}`);
      setRestaurant(response.data);
      
      // Apply custom CSS variables
      if (response.data.primary_color) {
        document.documentElement.style.setProperty('--primary-color', response.data.primary_color);
      }
      if (response.data.secondary_color) {
        document.documentElement.style.setProperty('--secondary-color', response.data.secondary_color);
      }
    } catch (error) {
      console.error('Erro ao carregar restaurante:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    restaurant,
    loading,
    primaryColor: restaurant?.primary_color || '#FF5500',
    secondaryColor: restaurant?.secondary_color || '#10B981',
    logoUrl: restaurant?.logo_url || null,
    restaurantName: restaurant?.name || 'Menu QR'
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
