import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Menu = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [error, setError] = useState('');
  const [isCreatingShop, setIsCreatingShop] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsError, setMenuItemsError] = useState('');
  const [newShop, setNewShop] = useState({
    name: '',
    email: '',
    description: '',
    image_url: '',
    phone_number: ''
  });
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  useEffect(() => {
    fetchOwnerShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchShopDetails(selectedShop);
      fetchMenuItems(selectedShop);
    }
  }, [selectedShop]);

  const fetchOwnerShops = async () => {
    try {
      const response = await api.get('/ownerShops');
      setShops(response.data.shops);
      if (response.data.shops.length > 0) {
        setSelectedShop(response.data.shops[0].id);
      }
    } catch (error) {
      setError('Failed to fetch shops. Please try again.');
    }
  };

  const fetchShopDetails = async (shopId) => {
    try {
      const response = await api.get(`/shop/${shopId}`);
      setShopDetails(response.data);
    } catch (error) {
      setError('Failed to fetch shop details. Please try again.');
    }
  };

  const fetchMenuItems = async (shopId) => {
    try {
      const response = await api.get(`/shop/${shopId}/getAllMenuItems`);
      console.log('Fetched menu items:', response.data);
      if (response.data && Array.isArray(response.data.items)) {
        setMenuItems(response.data.items);
        setMenuItemsError('');
      } else if (Array.isArray(response.data)) {
        setMenuItems(response.data);
        setMenuItemsError('');
      } else {
        console.error('Unexpected response format for menu items:', response.data);
        setMenuItems([]);
        setMenuItemsError('Unexpected data format received for menu items.');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
      setMenuItemsError('Failed to fetch menu items. Please try again.');
    }
  };

  const handleShopChange = (event) => {
    const shopId = event.target.value;
    setSelectedShop(shopId);
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      await api.post('/createShop', newShop);
      setIsCreatingShop(false);
      fetchOwnerShops();
    } catch (error) {
      setError('Failed to create shop. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setNewShop({ ...newShop, [e.target.name]: e.target.value });
  };

  const handleMenuItemInputChange = (e) => {
    setNewMenuItem({ ...newMenuItem, [e.target.name]: e.target.value });
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending new menu item:', newMenuItem);
      const response = await api.post(`/shop/${selectedShop}/addMenuItem`, newMenuItem);
      console.log('Response from addMenuItem:', response);

      if (response.data) {
        console.log('Response data:', response.data);
        
        let newItem;
        if (response.data.item) {
          newItem = response.data.item;
        } else if (response.data.data && response.data.data.item) {
          newItem = response.data.data.item;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          newItem = response.data;
        }

        if (newItem) {
          console.log('New item to be added:', newItem);
          setMenuItems(prevItems => [...prevItems, newItem]);
          setNewMenuItem({ name: '', description: '', price: '', category: '' });
          setError('');
        } else {
          console.error('Unable to extract item from response:', response.data);
          setError('Item added, but unable to update display. Please refresh.');
        }
      } else {
        console.error('Unexpected response when adding menu item:', response);
        setError('Unexpected response when adding menu item.');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setError('Failed to add menu item. Please try again.');
    }

    // Fetch menu items again to ensure we have the latest data
    await fetchMenuItems(selectedShop);
  };


  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending updated menu item:', editingMenuItem);
      const response = await api.put(`/shop/${selectedShop}/updateMenuItem/${editingMenuItem.item_id}`, editingMenuItem);
      console.log('Response from updateMenuItem:', response);

      if (response.data) {
        console.log('Response data:', response.data);
        
        let updatedItem;
        if (response.data.item) {
          updatedItem = response.data.item;
        } else if (response.data.data && response.data.data.item) {
          updatedItem = response.data.data.item;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          updatedItem = response.data;
        }

        if (updatedItem) {
          console.log('Updated item:', updatedItem);
          setMenuItems(prevItems => 
            prevItems.map(item => 
              item.item_id === updatedItem.item_id ? updatedItem : item
            )
          );
          setEditingMenuItem(null);
          setError('');
        } else {
          console.error('Unable to extract updated item from response:', response.data);
          setError('Item updated, but unable to update display. Please refresh.');
        }
      } else {
        console.error('Unexpected response when updating menu item:', response);
        setError('Unexpected response when updating menu item.');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setError('Failed to update menu item. Please try again.');
    }

    // Fetch menu items again to ensure we have the latest data
    await fetchMenuItems(selectedShop);
  };



  const handleDeleteMenuItem = async (itemId) => {
    try {
      await api.delete(`/shop/${selectedShop}/deleteMenuItem/${itemId}`);
      setMenuItems(menuItems.filter(item => item.item_id !== itemId));
    } catch (error) {
      setError('Failed to delete menu item. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">Shop Manager</h1>
      
      {error && <p className="text-red-500 mb-6 text-center bg-red-100 py-2 px-4 rounded-lg">{error}</p>}

      {isCreatingShop ? (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Create a New Shop</h2>
          <form onSubmit={handleCreateShop} className="space-y-4">
            <input
              type="text"
              name="name"
              value={newShop.name}
              onChange={handleInputChange}
              placeholder="Shop Name"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={newShop.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              name="description"
              value={newShop.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="url"
              name="image_url"
              value={newShop.image_url}
              onChange={handleInputChange}
              placeholder="Image URL"
              className="w-full p-2 border rounded"
            />
            <input
              type="tel"
              name="phone_number"
              value={newShop.phone_number}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Create Shop
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Shop Selection</h2>
            <select
              id="shop-select"
              value={selectedShop}
              onChange={handleShopChange}
              className="w-full p-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>

            {shopDetails && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2 text-indigo-600">Shop Details</h3>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p><span className="font-semibold">Name:</span> {shopDetails.name}</p>
                  <p><span className="font-semibold">Email:</span> {shopDetails.email}</p>
                  <p><span className="font-semibold">Description:</span> {shopDetails.description}</p>
                  <p><span className="font-semibold">Phone:</span> {shopDetails.phone_number}</p>
                </div>
                {shopDetails.image_url && (
                  <img src={shopDetails.image_url} alt={shopDetails.name} className="mt-4 rounded-lg shadow-md max-w-full h-auto" />
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">
              {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem} className="space-y-4">
              <input
                type="text"
                name="name"
                value={editingMenuItem ? editingMenuItem.name : newMenuItem.name}
                onChange={editingMenuItem ? (e) => setEditingMenuItem({...editingMenuItem, name: e.target.value}) : handleMenuItemInputChange}
                placeholder="Item Name"
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="description"
                value={editingMenuItem ? editingMenuItem.description : newMenuItem.description}
                onChange={editingMenuItem ? (e) => setEditingMenuItem({...editingMenuItem, description: e.target.value}) : handleMenuItemInputChange}
                placeholder="Description"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                name="price"
                value={editingMenuItem ? editingMenuItem.price : newMenuItem.price}
                onChange={editingMenuItem ? (e) => setEditingMenuItem({...editingMenuItem, price: e.target.value}) : handleMenuItemInputChange}
                placeholder="Price"
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                {editingMenuItem ? 'Update Item' : 'Add Item'}
              </button>
              {editingMenuItem && (
                <button
                  type="button"
                  onClick={() => setEditingMenuItem(null)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {!isCreatingShop && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Menu Items</h2>
          {menuItemsError && <p className="text-red-500 mb-4 bg-red-100 py-2 px-4 rounded-lg">{menuItemsError}</p>}
          {menuItems.length === 0 ? (
            <p className="text-center text-gray-600">No menu items available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.item_id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-indigo-600">{item.name}</h3>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <p className="text-indigo-500 font-semibold">Price: ${item.price}</p>
                  </div>
                  <div className="bg-gray-100 px-4 py-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingMenuItem(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.item_id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;