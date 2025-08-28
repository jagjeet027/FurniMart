import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Trophy,
  Compass,
  Mountain,
  Star,
  Flame,
  Shield,
  Ship,
  Target,
  BookOpen,
  Zap,
  Flag,
  Users,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Activity,
  DollarSign,
  BarChart2,
  PieChart,
  TrendingUp,
  Calendar,
  Loader,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import api from "../../../axios/axiosInstance";
const Admin = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");
  const [manufacturers, setManufacturers] = useState([]);
  const [error, setError] = useState(null);

 const fetchManufacturers = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await api.get('/manufacturers/all');
    
    console.log('Response:', response.data); // Debug log
    
    // Handle the response properly
    if (response.data && response.data.success) {
      const manufacturersArray = response.data.data || [];
      setManufacturers(manufacturersArray);
    } else {
      // If response doesn't have expected structure, try direct data
      const manufacturersArray = Array.isArray(response.data) ? response.data : [];
      setManufacturers(manufacturersArray);
    }
    
  } catch (error) {
    console.error("Error fetching manufacturers:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      originalError: error
    });
    
    // More specific error messages
    let errorMessage = "Failed to load manufacturers";
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
        // Redirect to login or refresh token
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (error.response.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = error.response.data?.message || "Unable to connect to server";
      }
    } else if (error.request) {
      errorMessage = "Unable to connect to the server. Please check your internet connection.";
    }
    
    setError(errorMessage);
    setManufacturers([]);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchManufacturers();
  }, []);

  const dashboardStats = [
    {
      label: "Total Users",
      value: "12,456",
      trend: "+23%",
      color: "from-emerald-500 to-teal-700",
      icon: Compass,
      description: "Active quests and missions",
      animation: "hover:transform hover:scale-105 hover:rotate-2",
    },
    {
      label: "Achievements Unlocked",
      value: "0",
      trend: "+15%",
      color: "from-purple-500 to-indigo-700",
      icon: Trophy,
      description: "New milestones reached",
      animation: "hover:transform hover:scale-105 hover:-rotate-2",
    },
    {
      label: "Total Manufacturers",
      value: manufacturers.length.toString(),
      trend: "+18%",
      color: "from-orange-500 to-red-700",
      icon: TrendingUp,
      description: "Active manufacturers",
      animation: "hover:transform hover:scale-105 hover:translate-y-[-5px]",
      onClick: () => navigate("/manufactdetails"),
    },
    {
      label: "Revenue Generated",
      value: "$89,234",
      trend: "+28%",
      color: "from-blue-500 to-cyan-700",
      icon: DollarSign,
      description: "Total earnings this period",
      animation: "hover:transform hover:scale-105 hover:brightness-110",
    },
  ];

  const recentActivities = [
    {
      user: "Sarah Johnson",
      action: "Completed Advanced Quest",
      time: "2 hours ago",
      icon: Star,
      status: "success",
    },
    {
      user: "Mike Anderson",
      action: "Unlocked New Achievement",
      time: "3 hours ago",
      icon: Trophy,
      status: "warning",
    },
    {
      user: "Emily Parker",
      action: "Started New Mission",
      time: "5 hours ago",
      icon: Flag,
      status: "info",
    },
  ];

  const quickActions = [
    {
      label: "New Quest",
      icon: BookOpen,
      color: "from-green-500 to-emerald-700",
      onClick: () => handleQuickAction("quest"),
    },
    {
      label: "Track Progress",
      icon: Activity,
      color: "from-blue-500 to-indigo-700",
      onClick: () => handleQuickAction("progress"),
    },
    {
      label: "View Reports",
      icon: BarChart2,
      color: "from-purple-500 to-pink-700",
      onClick: () => handleQuickAction("reports"),
    },
  ];

  const navigateToUserDashboard = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/userdashboard");
      setIsLoading(false);
    }, 800);
  };

  const navigateToManufacturerDashboard = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/manufactdetails");
      setIsLoading(false);
    }, 800);
  };

  const handleQuickAction = (action) => {
    console.log(`Quick action triggered: ${action}`);
  };

  useEffect(() => {
    const generateData = () => {
      return Array.from({ length: 7 }, (_, i) => ({
        name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        users: Math.floor(Math.random() * 1000) + 500,
        quests: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 10000) + 5000,
      }));
    };
    setChartData(generateData());
  }, [selectedTimeRange]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#112a45] text-white">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Loader className="animate-spin h-8 w-8 text-white" />
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/50 text-white rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
              Admin Command Center
            </h1>
            <p className="text-gray-400 mt-2">
              Master control panel for all operations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={() => navigate("/userdashboard")}
              className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg 
                transform transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto"
            >
              <Users className="mr-2" size={20} />
              User Dashboard
            </button>
            <button
              onClick={() => navigate("/recruitment")}
              className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg 
                transform transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto"
            >
              <Target className="mr-2" size={20} />
              Recruitment Dashboard
            </button>
            <button
              onClick={() => navigate("/manufactdetails")}
              className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg 
                transform transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto"
            >
              <Settings className="mr-2" size={20} />
              Manufacturer Dashboard
            </button>
          </div>  
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              onClick={stat.onClick}
              className={`p-4 md:p-6 rounded-xl bg-gradient-to-br ${stat.color} 
                transform transition-all duration-500 ${stat.animation}
                shadow-lg backdrop-blur-sm bg-opacity-90 cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-white/80 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-xs md:text-sm text-white/70">
                    {stat.description}
                  </p>
                  <span className="inline-flex items-center mt-2 px-2 py-1 bg-white/20 rounded-full text-xs md:text-sm">
                    <TrendingUp size={14} className="mr-1" />
                    {stat.trend}
                  </span>
                </div>
                <div className="p-2 md:p-3 bg-white/20 rounded-full">
                  <stat.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white/10 rounded-xl p-4 md:p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg md:text-xl font-semibold">
                Activity Overview
              </h2>
              <select
                className="bg-white/10 rounded-lg px-3 py-1 w-full sm:w-auto"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a2b3c",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    fill="url(#colorUsers)"
                    stroke="#8884d8"
                  />
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Revenue Analytics</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
                  Daily
                </button>
                <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
                  Weekly
                </button>
                <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
                  Monthly
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a2b3c",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ fill: "#4ade80" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 
                    transition-all duration-300"
                >
                  <div
                    className={`p-3 rounded-full bg-opacity-20
                    ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  >
                    <activity.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{activity.user}</p>
                    <p className="text-sm text-gray-400">{activity.action}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`w-full flex items-center justify-between p-4 rounded-lg 
                    bg-gradient-to-r ${action.color} transform transition-all duration-300 
                    hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex items-center">
                    <action.icon size={20} className="mr-3" />
                    <span className="font-semibold">{action.label}</span>
                  </div>
                  <ChevronDown size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;