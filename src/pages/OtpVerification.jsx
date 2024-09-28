import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import api from '../services/api';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
    if (!user) {
      navigate('/signup');
    }
  }, [user, navigate]);
 

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
  
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
  
    if (element.value !== '') {
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      } else {
        inputRefs.current[index].blur();
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
  
    if (otpString.length !== 6) {
      setError('Please enter a complete 6-digit OTP.');
      return;
    }
  
    try {
      const response = await api.post('/verifyOTP', { otp: otpString });
      if (response.status === 200) {
        const { user: updatedUser, role } = response.data;
        login(user.token, { ...updatedUser, role });
        localStorage.setItem("token", user.token);
        if (role === 'student' || role === 'teacher') {
            console.log("User is a student or teacher");
          navigate('/userdashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('OTP verification failed', error);
      setError(error.response?.data?.message || 'OTP verification failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/resendOTP');
      setError('');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Failed to resend OTP', error);
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Enter OTP</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="flex justify-between mb-6">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-12 h-12 border-2 rounded-lg text-center text-xl font-bold text-gray-700 focus:border-blue-500 focus:outline-none"
            />
          ))}
        </div>
        <button
          onClick={handleVerify}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 mb-4"
        >
          Verify OTP
        </button>
        <button
          onClick={handleResendOTP}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}