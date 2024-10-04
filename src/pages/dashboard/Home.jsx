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
          console.log(dashboardResponse.data);
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

  const { shopDetails, topSellingItems, recentOrders, revenueOverTime, customerInsights, revenue} = dashboardData;
  console.log(dashboardData);
 
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard for {shopDetails.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Revenue", value: `$${dashboardData.revenue}`, icon: "💰" },
          { title: "Total Orders", value: shopDetails.total_orders, icon: "📦" },
          { title: "Menu Items", value: shopDetails.total_menu_items, icon: "🍽️" },
          { title: "Avg. Order Value", value: `$${parseFloat(shopDetails.average_order_value).toFixed(2)}`, icon: "📈" },
        ].map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="text-4xl mb-2">{item.icon}</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-600">{item.title}</h3>
            <p className="text-3xl font-bold text-indigo-600">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Top Selling Items</h3>
          <ul className="space-y-3">
            {topSellingItems.items.map((item) => (
              <li key={item.item_id} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-indigo-600 font-semibold">{item.total_quantity_sold} sold</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Orders</h3>
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li key={order.order_id} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-700">{order.user_name}</span>
                <span className="text-indigo-600 font-semibold">${parseFloat(order.total_price).toFixed(2)}</span>
                <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Revenue Over Time</h3>
        <div className="h-80">
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Customer Insights</h3>
        <ul className="space-y-3">
          {customerInsights.map((customer) => (
            <li key={customer.user_id} className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">{customer.user_name}</span>
              <span className="text-indigo-600 font-semibold">{customer.order_count} orders</span>
              <span className="text-green-600 font-semibold">${parseFloat(customer.total_spent).toFixed(2)} spent</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;