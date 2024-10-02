import React from 'react';

const Cart = ({ cartItems, removeFromCart, updateQuantity, placeOrder, total }) => {
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return typeof numPrice === 'number' && !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>
      {cartItems.length > 0 ? (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.item_id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${formatPrice(item.price)} each</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.item_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total:</span>
              <span className="font-bold">${formatPrice(total)}</span>
            </div>
            <button
              onClick={placeOrder}
              className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Place Order
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600">Your cart is empty</p>
      )}
    </div>
  );
};

export default Cart;