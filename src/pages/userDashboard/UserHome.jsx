import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import Cart from "../../components/Cart";
import PaymentUpload from "../../components/PaymentUpload";
import api from "../../services/api";

const UserHome = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [showPaymentUpload, setShowPaymentUpload] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [shopPaymentDetails, setShopPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchShops();
    fetchUserOrders();

    const socket = io(process.env.API);

    socket.on("orderUpdate", (updatedOrder) => {
      setUserOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === updatedOrder.order_id ? updatedOrder : order
        )
      );
      toast.info(
        `Order ${updatedOrder.order_id} status updated to ${updatedOrder.status}`
      );
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(total);
  }, [cartItems]);

  const formatPrice = (price) => {
    // Convert string to number if it's a string, or return 0 if invalid
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return typeof numPrice === "number" && !isNaN(numPrice)
      ? numPrice.toFixed(2)
      : "0.00";
  };

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/getAllShops");
      setShops(response.data);
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error("Failed to fetch shops");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShopPaymentDetails = async (shopId) => {
    try {
      const response = await api.get(`/shop/${shopId}/payment-details`);
      setShopPaymentDetails(response.data);
    } catch (error) {
      console.error("Error fetching shop payment details:", error);
      toast.error("Failed to fetch shop payment details");
    }
  };

  const fetchMenuItems = async (shopId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/shop/${shopId}/getAllMenuItems`);
      setMenuItems(response.data.items);
      setSelectedShop(shopId);
      setSelectedItem(null);
      await fetchShopPaymentDetails(shopId);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItem = async (shopId, itemId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/shop/${shopId}/getMenuItem/${itemId}`);
      setSelectedItem(response.data);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      toast.error("Failed to fetch menu item details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/listUserOrders");
      setUserOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      toast.error("Failed to fetch your orders");
      setUserOrders([]);
    } finally {
      setIsLoading(false);
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
    toast.success(`${item.name} added to cart`);
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.item_id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.item_id !== itemId)
    );
    toast.info("Item removed from cart");
  };

  const initiatePayment = () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }
    setShowPaymentUpload(true);
  };

  const handlePaymentComplete = async (orderDetails) => {
    setShowPaymentUpload(false);
    setCartItems([]);
    setSelectedPaymentMethod(null);
    await fetchUserOrders();
    toast.success("Order placed successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />

      {/* Payment Method Selection */}
      {cartItems.length > 0 && shopPaymentDetails && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Payment Method
              </label>
              <select
                value={selectedPaymentMethod || ""}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="">Select a method</option>
                {shopPaymentDetails.methods.map((method) => (
                  <option key={method.id} value={method.type}>
                    {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {selectedPaymentMethod && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Payment Details
                </h4>
                {shopPaymentDetails.methods
                  .find((m) => m.type === selectedPaymentMethod)
                  ?.details.map((detail, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {detail}
                    </p>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart */}
      <Cart
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        updateQuantity={updateCartItemQuantity}
        placeOrder={initiatePayment}
        total={cartTotal}
      />

      {/* Payment Upload Modal */}
      {showPaymentUpload && (
        <PaymentUpload
          cartTotal={cartTotal}
          shopId={selectedShop}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setShowPaymentUpload(false)}
          selectedPaymentMethod={selectedPaymentMethod}
          paymentDetails={shopPaymentDetails?.methods.find(
            (m) => m.type === selectedPaymentMethod
          )}
          items={cartItems}
        />
      )}

      {/* Shops List */}
      <h2 className="text-2xl font-bold mb-4">Shops</h2>
      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
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
      )}

      {/* Menu Items */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Your Orders</h3>
        <div className="space-y-4">
          {userOrders && userOrders.length > 0 ? (
            userOrders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order ID: {order.order_id}</p>
                    <p className="text-sm text-gray-600">
                      Status: {order.status}
                    </p>
                  </div>
                  <p className="font-bold text-lg">
                    ${formatPrice(order.total_price)}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-2">
                    {order.items &&
                      order.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span>
                            {item.quantity}x {item.item_name}
                          </span>
                          <span>
                            ${formatPrice(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Ordered on: {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No orders found.</p>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div
            key={item.item_id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300"
          >
            <h4 className="text-lg font-semibold mb-2">{item.name}</h4>
            <p className="text-gray-600 mb-2">{item.description}</p>
            <p className="font-bold mb-2">${formatPrice(item.price)}</p>
            <button
              onClick={() => addToCart(item)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHome;
