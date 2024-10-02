import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api.js';

const PaymentUpload = ({ cartTotal, shopId, onPaymentComplete, onCancel, selectedPaymentMethod, items }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  console.log(cartTotal, shopId, selectedPaymentMethod);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const response = await api.post('/imageupload', formData);
      setUploadedImage(response.data.data);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedImage) {
      toast.error('Please upload a payment screenshot');
      return;
    }
    const PaymentData = {
      payment_screenshot_url: uploadedImage.url,
      shop_id: shopId,
      amount: cartTotal,
      payment_method: selectedPaymentMethod,
      items: items

    }


    try {
      // Verify payment and create order
      const response = await api.post('/verifyPaymentAndCreateOrder', PaymentData);
      console.log(response.data);

      if (response.data.status === 'success') {
        toast.success('Payment verified and order placed successfully');
        onPaymentComplete(response.data.order);
      } else {
        toast.error('Payment verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Upload Payment Screenshot</h2>
        
        <div className="mb-4">
          <p className="text-gray-700">Total Amount: ${cartTotal}</p>
          <p className="text-gray-700">Payment Method: {selectedPaymentMethod}</p>
        </div>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full"
          />
        </div>

        {uploadedImage && (
          <div className="mb-4">
            <img
              src={uploadedImage.url}
              alt="Payment Screenshot"
              className="w-40 rounded-lg"
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || !uploadedImage}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              (isUploading || !uploadedImage) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            Verify & Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentUpload;