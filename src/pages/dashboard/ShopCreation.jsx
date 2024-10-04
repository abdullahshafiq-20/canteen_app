import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ShopCreation = () => {
  const [shops, setShops] = useState([]);
  const [isCreatingShop, setIsCreatingShop] = useState(false);
  const [error, setError] = useState('');
  const [newShop, setNewShop] = useState({
    name: '',
    description: '',
    image_url: '',
    email: '',
    contact_number: '',
    full_name: '',
    account_title: '',
    payment_method: '',
    payment_details: ''
  });

  const paymentMethods = ['jazzcash', 'easypaisa', 'sadapay', 'nayapay'];

  useEffect(() => {
    fetchOwnerShops();
  }, []);

  const fetchOwnerShops = async () => {
    try {
      const response = await api.get('/ownerShops');
      setShops(response.data.shops);
      if (response.data.shops.length === 0) {
        setIsCreatingShop(true);
      }
    } catch (error) {
      setError('Failed to fetch shops. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setNewShop({ ...newShop, [e.target.name]: e.target.value });
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/createShop', newShop);
      setIsCreatingShop(false);
      setShops([response.data]);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create shop. Please try again.');
    }
  };

  if (!isCreatingShop && shops.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Your Shop</h2>
        <p className="text-gray-600">You have already created a shop.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">Create Your Shop</h1>
      
      {error && <p className="text-red-500 mb-6 text-center bg-red-100 py-2 px-4 rounded-lg">{error}</p>}

      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Shop Details</h2>
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
            type="email"
            name="email"
            value={newShop.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="tel"
            name="contact_number"
            value={newShop.contact_number}
            onChange={handleInputChange}
            placeholder="Contact Number"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="full_name"
            value={newShop.full_name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="account_title"
            value={newShop.account_title}
            onChange={handleInputChange}
            placeholder="Account Title"
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="payment_method"
            value={newShop.payment_method}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Payment Method</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </option>
            ))}
          </select>
          <textarea
            name="payment_details"
            value={newShop.payment_details}
            onChange={handleInputChange}
            placeholder="Payment Details"
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            Create Shop
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopCreation;