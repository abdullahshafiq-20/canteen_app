import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import Cart from "../../components/Cart";
import api from "../../services/api";

const UserHome = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    fetchShops();
    fetchUserOrders();

    const socket = io("https://my-sql-backend.vercel.app"); // Replace with your server URL

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

  const fetchShops = async () => {
    try {
      const response = await api.get("/getAllShops");
      setShops(response.data);
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error("Failed to fetch shops");
    }
  };

  const fetchMenuItems = async (shopId) => {
    try {
      const response = await api.get(`/shop/${shopId}/getAllMenuItems`);
      setMenuItems(response.data.items);
      setSelectedShop(shopId);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items");
    }
  };

  const fetchMenuItem = async (shopId, itemId) => {
    try {
      const response = await api.get(`/shop/${shopId}/getMenuItem/${itemId}`);
      setSelectedItem(response.data);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      toast.error("Failed to fetch menu item details");
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await api.get("/listUserOrders");
      setUserOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      toast.error("Failed to fetch your orders");
      setUserOrders([]); // Set to empty array in case of error
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

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.item_id !== itemId)
    );
    toast.info("Item removed from cart");
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

      const response = await api.post("/createOrder", orderData);

      if (response.status === 201) {
        toast.success("Order placed successfully!");
        setCartItems([]);
        fetchUserOrders(); // Refresh user orders
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("An error occurred while placing the order.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <Cart
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        placeOrder={placeOrder}
      />

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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>
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

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Your Orders</h3>
        <div className="space-y-4">
          {userOrders && userOrders.length > 0 ? (
            userOrders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <p>Order ID: {order.order_id}</p>
                <p>Status: {order.status}</p>
                <p>Total Amount: ${order.total_price}</p>
                <p>Created At: {new Date(order.created_at).toLocaleString()}</p>
                <h4 className="font-bold mt-2">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items &&
                    order.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity}x {item.item_name} - ${item.price}
                      </li>
                    ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
