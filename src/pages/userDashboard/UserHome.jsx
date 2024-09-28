import React, { useState, useEffect } from 'react';
import Cart from '../../components/Cart';
import api from '../../services/api';

const UserHome = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/getAllShops');
      setShops(response.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchMenuItems = async (shopId) => {
    try {
      const response = await api.get(`/shop/${shopId}/getAllMenuItems`);
      setMenuItems(response.data.items);
      setSelectedShop(shopId);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchMenuItem = async (shopId, itemId) => {
    try {
      const response = await api.get(`/shop/${shopId}/getMenuItem/${itemId}`);
      setSelectedItem(response.data);
    } catch (error) {
      console.error('Error fetching menu item:', error);
    }
  };

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.item_id === item.item_id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.item_id !== itemId));
  };

  const placeOrder = async () => {
    try {
      const orderData = {
        shop_id: selectedShop,
        items: cartItems.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
        })),
      };

      console.log('Order data:', orderData);

      const response = await api.post('/createOrder', orderData);

      if (response.status === 201) {
        alert('Order placed successfully!');
        setCartItems([]);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Cart cartItems={cartItems} removeFromCart={removeFromCart} placeOrder={placeOrder} />
      
      <h2 className="text-2xl font-bold mb-4">Shops</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 cursor-pointer"
            onClick={() => fetchMenuItems(shop.id)}
          >
            <h3 className="text-xl font-semibold mb-2">{shop.name}</h3>
            <p className="text-gray-600 mb-2">{shop.description}</p>
            <p className="text-sm text-gray-500">{shop.email}</p>
          </div>
        ))}
      </div>

      {selectedShop && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Menu Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.item_id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300 cursor-pointer"
                onClick={() => fetchMenuItem(selectedShop, item.item_id)}
              >
                <h4 className="text-lg font-semibold mb-2">{item.name}</h4>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <p className="font-bold">${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-bold mb-4">Item Details</h3>
          <h4 className="text-lg font-semibold">{selectedItem.name}</h4>
          <p className="text-gray-600 mb-2">{selectedItem.description}</p>
          <p className="font-bold mb-4">${selectedItem.price}</p>
          <button
            onClick={() => addToCart(selectedItem)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default UserHome;