import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShopOrders();
  }, []);

  const fetchShopOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/listShopOrders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      setError('Failed to fetch shop orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const response = await api.put(`/updateOrderStatus/${orderId}`, { status: newStatus });
      
      if (response.data.message === 'Order status updated successfully') {
        setOrders(orders.map(order => 
          order.order_id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        setError('');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shop Owner Dashboard</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">Shop Orders</h3>
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <ul className="space-y-4">
            {orders.map(order => (
              <li key={order.order_id} className="border p-4 rounded">
                <p>Order ID: {order.order_id}</p>
                <p>User: {order.user_name} ({order.email})</p>
                <p>Status: {order.status}</p>
                <p>Total Amount: ${order.total_price}</p>
                <p>Created At: {new Date(order.created_at).toLocaleString()}</p>
                <h4 className="font-bold mt-2">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items.map((item, index) => (
                    <li key={index}>{item.quantity}x {item.item_name} - ${item.price}</li>
                  ))}
                </ul>
                <div className="mt-2">
                  <select 
                    onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value)}
                    className="p-1 border rounded mr-2"
                  >
                    <option value="">Update Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="delivered">Delivered</option>
                    <option value="discarded">Discarded</option>
                  </select>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                  >
                    View Details
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedOrder && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Order Details</h3>
          <p>Order ID: {selectedOrder.order_id}</p>
          <p>User: {selectedOrder.user_name} ({selectedOrder.email})</p>
          <p>Status: {selectedOrder.status}</p>
          <p>Total Amount: ${selectedOrder.total_price}</p>
          <p>Created At: {new Date(selectedOrder.created_at).toLocaleString()}</p>
          <p>Updated At: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
          <h4 className="font-bold mt-2">Items:</h4>
          <ul className="list-disc list-inside">
            {selectedOrder.items.map((item, index) => (
              <li key={index}>{item.quantity}x {item.item_name} - ${item.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Orders;