import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import api from "../../services/api";
import Modal from "../../components/Modal";


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchShopOrders();

    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("newOrder", (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      toast.success("New order received!");
    });

    socket.on("orderUpdate", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === updatedOrder.order_id ? updatedOrder : order
        )
      );
      if (selectedOrder && selectedOrder.order_id === updatedOrder.order_id) {
        setSelectedOrder(updatedOrder);
      }
      toast.info(
        `Order ${updatedOrder.order_id} status updated to ${updatedOrder.status}`
      );
    });

    return () => socket.disconnect();
  }, []);

  const fetchShopOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/listShopOrders");
      const ordersWithPaymentInfo = await Promise.all(
        response.data.orders.map(async (order) => {
          const paymentInfo = await fetchPaymentDetails(order.order_id);
          return { ...order, paymentInfo };
        })
      );
      setOrders(ordersWithPaymentInfo);
    } catch (error) {
      console.error("Error fetching shop orders:", error);
      setError("Failed to fetch shop orders. Please try again.");
      toast.error("Failed to fetch shop orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      console.log(orderId, newStatus);
      await api.put(`/updateOrderStatus/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status: newStatus } : order
      ));
      setError("");
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerificationStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const order = orders.find(o => o.order_id === orderId);
      if (!order || !order.paymentInfo) {
        throw new Error("Payment information not found");
      }
      await api.put(`/updatePaymentStatus/${orderId}`, {
        paymentId: order.paymentInfo.payment_id,
        status: newStatus,
      });
      setOrders(orders.map(o => 
        o.order_id === orderId ? { ...o, payment_status: newStatus } : o
      ));
      setError("");
      toast.success("Verification status updated successfully");
    } catch (error) {
      console.error("Error updating verification status:", error);
      setError("Failed to update verification status. Please try again.");
      toast.error("Failed to update verification status");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentDetails = async (orderId) => {
    try {
      const response = await api.get(`/getPaymentId/${orderId}`);
      const paymentId = response.data.paymentInfo.payment_id;
      const paymentDetails = await api.get(`/paymentDetails/${paymentId}`);
      return { ...response.data.paymentInfo, ...paymentDetails.data.data };
    } catch (error) {
      console.error("Error fetching payment details:", error);
      toast.error("Failed to fetch payment details");
      return null;
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Shop Owner Dashboard</h2>

      {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">{error}</p>}

      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Shop Orders</h3>
        {loading ? (
          <p className="text-gray-600">Loading orders...</p>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li key={order.order_id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <p><span className="font-semibold">Order ID:</span> {order.order_id}</p>
                  <p><span className="font-semibold">User:</span> {order.user_name} ({order.email})</p>
                  <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>{order.status}</span></p>
                  <p><span className="font-semibold">Verification:</span> <span className={`px-2 py-1 rounded ${getVerificationColor(order.payment_status)}`}>{order.payment_status}</span></p>
                  <p><span className="font-semibold">Total Amount:</span> ${order.total_price}</p>
                  <p><span className="font-semibold">Created At:</span> {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <h4 className="font-semibold mt-4 mb-2 text-gray-700">Items:</h4>
                <ul className="list-disc list-inside mb-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-gray-600">
                      {item.quantity}x {item.item_name} - ${item.price}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex space-x-4">
                  <select
                    onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value)}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Update Status</option>
                    <option value="preparing">Preparing</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="delivered">Delivered</option>
                    <option value="discarded">Discarded</option>
                  </select>

                  <select
                    onChange={(e) => handleUpdateVerificationStatus(order.order_id, e.target.value)}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Update Verification</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => handleViewDetails(order)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                  >
                    View Details
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Order Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-semibold">Order ID:</span> {selectedOrder.order_id}</p>
                <p><span className="font-semibold">User:</span> {selectedOrder.user_name}</p>
                <p><span className="font-semibold">Email:</span> {selectedOrder.email}</p>
                <p><span className="font-semibold">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-semibold">Verification:</span> {selectedOrder.payment_status}</p>
                <p><span className="font-semibold">Total Amount:</span> ${selectedOrder.total_price}</p>
                <p><span className="font-semibold">Created:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p><span className="font-semibold">Updated:</span> {new Date(selectedOrder.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Order Items</h3>
              <ul className="list-disc list-inside">
                {selectedOrder.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x {item.item_name} - ${item.price}
                  </li>
                ))}
              </ul>
            </div>

            {selectedOrder.paymentInfo && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-semibold">Customer:</span> {selectedOrder.paymentInfo.customerName}</p>
                  <p><span className="font-semibold">Role:</span> {selectedOrder.paymentInfo.role}</p>
                  <p><span className="font-semibold">Method:</span> {selectedOrder.paymentInfo.payment.method}</p>
                  {selectedOrder.paymentInfo.payment.geminiResponse && (
                    <>
                      <p><span className="font-semibold">From:</span> {selectedOrder.paymentInfo.payment.geminiResponse.from}</p>
                      <p><span className="font-semibold">To:</span> {selectedOrder.paymentInfo.payment.geminiResponse.to}</p>
                      <p><span className="font-semibold">Bank:</span> {selectedOrder.paymentInfo.payment.geminiResponse.bankName}</p>
                      <p><span className="font-semibold">Amount:</span> Rs. {selectedOrder.paymentInfo.payment.geminiResponse.totalAmount}</p>
                    </>
                  )}
                </div>
                {selectedOrder.paymentInfo.payment.screenshotUrl && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-gray-700">Payment Screenshot</h4>
                    <img
                      src={selectedOrder.paymentInfo.payment.screenshotUrl}
                      alt="Payment Screenshot"
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// Helper functions for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'preparing': return 'bg-yellow-100 text-yellow-800';
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'delivered': return 'bg-blue-100 text-blue-800';
    case 'discarded': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getVerificationColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'verified': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Orders;