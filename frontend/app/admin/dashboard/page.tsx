"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  LogIn,
  AlertTriangle,
  TrendingUp,
  Globe,
  Clock,
  LogOut,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const COLORS = ["#FF8C42", "#FF5C3E", "#C8561E", "#6B4423"];

interface DashboardData {
  total_logins: number;
  successful_logins: number;
  failed_logins: number;
  success_rate: number;
  unique_users: number;
  unique_ips: number;
  logins_last_24h: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardData | null>(null);
  const [recentLogins, setRecentLogins] = useState<any[]>([]);
  const [failedLogins, setFailedLogins] = useState<any[]>([]);
  const [ipAnalysis, setIpAnalysis] = useState<any[]>([]);
  const [userAnalysis, setUserAnalysis] = useState<any[]>([]);
  const [hourlyStats, setHourlyStats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDashboardData(token);
  }, []);

  async function fetchDashboardData(token: string) {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, recentRes, failedRes, ipRes, userRes, hourlyRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/dashboard/overview`, { headers }),
        axios.get(`${API_BASE}/api/admin/dashboard/recent-logins`, { headers }),
        axios.get(`${API_BASE}/api/admin/dashboard/failed-logins`, { headers }),
        axios.get(`${API_BASE}/api/admin/dashboard/ip-analysis`, { headers }),
        axios.get(`${API_BASE}/api/admin/dashboard/user-analysis`, { headers }),
        axios.get(`${API_BASE}/api/admin/dashboard/hourly-stats`, { headers }),
      ]);

      setOverview(overviewRes.data);
      setRecentLogins(recentRes.data);
      setFailedLogins(failedRes.data);
      setIpAnalysis(ipRes.data);
      setUserAnalysis(userRes.data);
      setHourlyStats(hourlyRes.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_role");
    toast.success("Logged out successfully");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-peach-600"></div>
          <p className="mt-4 text-stone-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-peach-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-peach-200/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-peach-200/30 pb-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "analytics", label: "Analytics" },
            { id: "security", label: "Security" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-peach-600 border-b-2 border-peach-600 pb-4 mb-[-4px]"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && overview && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm font-medium">Total Logins</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">
                      {overview.total_logins}
                    </p>
                  </div>
                  <LogIn className="w-10 h-10 text-peach-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm font-medium">Success Rate</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {overview.success_rate}%
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm font-medium">Unique Users</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">
                      {overview.unique_users}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-500 text-sm font-medium">Unique IPs</p>
                    <p className="text-3xl font-bold text-stone-900 mt-2">
                      {overview.unique_ips}
                    </p>
                  </div>
                  <Globe className="w-10 h-10 text-indigo-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-peach-200/30">
              <h2 className="text-lg font-bold text-stone-900 mb-4">Recent Logins</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-peach-200/30">
                    <tr>
                      <th className="text-left py-2 text-stone-600 font-medium">Email</th>
                      <th className="text-left py-2 text-stone-600 font-medium">IP Address</th>
                      <th className="text-left py-2 text-stone-600 font-medium">Status</th>
                      <th className="text-left py-2 text-stone-600 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogins.slice(0, 10).map((login, i) => (
                      <tr key={i} className="border-b border-peach-100">
                        <td className="py-3">{login.email}</td>
                        <td className="py-3 text-stone-500">{login.ip_address || "Unknown"}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              login.login_status === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {login.login_status}
                          </span>
                        </td>
                        <td className="py-3 text-stone-500">
                          {new Date(login.login_timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Hourly Stats Chart */}
            {hourlyStats.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Login Trends (Last 24h)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total_logins" stroke="#FF8C42" />
                    <Line type="monotone" dataKey="successful_logins" stroke="#22c55e" />
                    <Line type="monotone" dataKey="failed_logins" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* IP Analysis */}
            {ipAnalysis.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Top IP Addresses</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ipAnalysis.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ip_address" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_logins" fill="#FF8C42" />
                    <Bar dataKey="failed_logins" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* User Analysis */}
            {userAnalysis.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Top Active Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-peach-200/30">
                      <tr>
                        <th className="text-left py-2 text-stone-600 font-medium">Email</th>
                        <th className="text-left py-2 text-stone-600 font-medium">Total Logins</th>
                        <th className="text-left py-2 text-stone-600 font-medium">Success</th>
                        <th className="text-left py-2 text-stone-600 font-medium">Failed</th>
                        <th className="text-left py-2 text-stone-600 font-medium">Unique IPs</th>
                        <th className="text-left py-2 text-stone-600 font-medium">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAnalysis.slice(0, 20).map((user, i) => (
                        <tr key={i} className="border-b border-peach-100">
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">{user.total_logins}</td>
                          <td className="py-3 text-green-600">{user.successful_logins}</td>
                          <td className="py-3 text-red-600">{user.failed_logins}</td>
                          <td className="py-3">{user.unique_ips}</td>
                          <td className="py-3 text-stone-500">
                            {new Date(user.last_login).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Failed Logins */}
            <div className="bg-white rounded-xl p-6 border border-red-200/30">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-stone-900">Failed Login Attempts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-red-200/30">
                    <tr>
                      <th className="text-left py-2 text-stone-600 font-medium">Email</th>
                      <th className="text-left py-2 text-stone-600 font-medium">IP Address</th>
                      <th className="text-left py-2 text-stone-600 font-medium">Device</th>
                      <th className="text-left py-2 text-stone-600 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedLogins.slice(0, 20).map((login, i) => (
                      <tr key={i} className="border-b border-red-100">
                        <td className="py-3">{login.email}</td>
                        <td className="py-3 text-stone-500">{login.ip_address || "Unknown"}</td>
                        <td className="py-3 text-stone-500 text-xs">
                          {login.device_info
                            ? login.device_info.substring(0, 50) + "..."
                            : "Unknown"}
                        </td>
                        <td className="py-3 text-stone-500">
                          {new Date(login.login_timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Login Status Distribution */}
            {overview && (
              <div className="bg-white rounded-xl p-6 border border-peach-200/30">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Login Status Distribution</h2>
                <div className="flex justify-center">
                  <ResponsiveContainer width={300} height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Success", value: overview.successful_logins },
                          { name: "Failed", value: overview.failed_logins },
                        ]}
                        cx={150}
                        cy={150}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
