import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // First, fetch the owner's shops
        const shopsResponse = await api.get('/ownerShops');
        const shops = shopsResponse.data.shops;
        
        if (shops.length > 0) {
          // Use the first shop's ID to fetch dashboard data
          const shopId = shops[0].id;
          const dashboardResponse = await api.get(`/shopDashboard/${shopId}`);
          setDashboardData(dashboardResponse.data);
        } else {
          setError('No shops found for this owner.');
        }
      } catch (error) {
        setError('Failed to fetch dashboard data. Please try again.');
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="p-4">Loading...</div>;
  }

  const { shopDetails, topSellingItems, recentOrders, revenueOverTime, customerInsights } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard for {shopDetails.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold">${parseFloat(shopDetails.total_revenue).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Total Orders</h3>
          <p className="text-2xl font-bold">{shopDetails.total_orders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Menu Items</h3>
          <p className="text-2xl font-bold">{shopDetails.total_menu_items}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Avg. Order Value</h3>
          <p className="text-2xl font-bold">${parseFloat(shopDetails.average_order_value).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Top Selling Items</h3>
        <ul className="space-y-2">
          {topSellingItems.items.map((item) => (
            <li key={item.item_id} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.total_quantity_sold} sold</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Recent Orders</h3>
        <ul className="space-y-2">
          {recentOrders.map((order) => (
            <li key={order.order_id} className="flex justify-between">
              <span>{order.user_name}</span>
              <span>${parseFloat(order.total_price).toFixed(2)}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Revenue Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueOverTime}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                scale="band"
                padding={{ left: 10, right: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="daily_revenue" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Customer Insights</h3>
        <ul className="space-y-2">
          {customerInsights.map((customer) => (
            <li key={customer.user_id} className="flex justify-between">
              <span>{customer.user_name}</span>
              <span>{customer.order_count} orders</span>
              <span>${parseFloat(customer.total_spent).toFixed(2)} spent</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;