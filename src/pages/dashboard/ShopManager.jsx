import React, { useState, useEffect } from 'react';
import ShopCreation from './ShopCreation';
import Menu from './Menu';
import api from '../../services/api';

const ShopManager = () => {
  const [hasShop, setHasShop] = useState(false);

  useEffect(() => {
    checkForShop();
  }, []);

  const checkForShop = async () => {
    try {
      const response = await api.get('/ownerShops');
      setHasShop(response.data.shops.length > 0);
    } catch (error) {
      console.error('Failed to check for shops:', error);
    }
  };

  return (
    <div>
      {hasShop ? <Menu /> : <ShopCreation />}
    </div>
  );
};

export default ShopManager;