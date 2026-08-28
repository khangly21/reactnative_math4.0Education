import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";

interface DashboardStats {
  totalUsers: number;
  totalPayments: number;
  confirmedPayments: number;
  pendingPayments: number;
  totalBtcReceived: number;
}

interface Payment {
  id: number;
  email?: string;
  amount: string;
  amountUSD: string;
  status: "pending" | "confirmed" | "failed" | "expired";
  createdAt: Date;
  txHash?: string;
}

export default function AdminScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "users">("overview");

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/(tabs)");
    }
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stats and payments from API
        // This would use tRPC calls in production
        setStats({
          totalUsers: 156,
          totalPayments: 42,
          confirmedPayments: 38,
          pendingPayments: 4,
          totalBtcReceived: 0.125,
        });
        setPayments([
          {
            id: 1,
            amount: "0.001",
            amountUSD: "40",
            status: "confirmed",
            createdAt: new Date(),
            txHash: "abc123...",
          },
          {
            id: 2,
            amount: "0.0025",
            amountUSD: "100",
            status: "pending",
            createdAt: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-lg text-error">Access Denied</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 gap-2">
          <Text className="text-3xl font-bold text-white">Admin Dashboard</Text>
          <Text className="text-blue-100">Welcome, {user.name || "Admin"}</Text>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row border-b border-border px-4 bg-surface">
          {(["overview", "payments", "users"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-2 border-b-2 ${
                activeTab === tab ? "border-primary" : "border-transparent"
              }`}
            >
              <Text
                className={`text-center font-semibold capitalize ${
                  activeTab === tab ? "text-primary" : "text-muted"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View className="flex-1 px-4 py-6">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : activeTab === "overview" ? (
            <OverviewTab stats={stats} colors={colors} />
          ) : activeTab === "payments" ? (
            <PaymentsTab payments={payments} colors={colors} />
          ) : (
            <UsersTab colors={colors} />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function OverviewTab({
  stats,
  colors,
}: {
  stats: DashboardStats | null;
  colors: any;
}) {
  if (!stats) return null;

  const StatCard = ({
    label,
    value,
    icon,
    bgColor,
  }: {
    label: string;
    value: string | number;
    icon: string;
    bgColor: string;
  }) => (
    <View className={`${bgColor} rounded-xl p-4 gap-2 mb-4`}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-sm text-muted mb-1">{label}</Text>
          <Text className="text-2xl font-bold text-foreground">{value}</Text>
        </View>
        <Text className="text-3xl">{icon}</Text>
      </View>
    </View>
  );

  return (
    <View className="gap-4">
      <StatCard label="Total Users" value={stats.totalUsers} icon="👥" bgColor="bg-blue-50" />
      <StatCard
        label="Total Payments"
        value={stats.totalPayments}
        icon="💳"
        bgColor="bg-green-50"
      />
      <StatCard
        label="Confirmed Payments"
        value={stats.confirmedPayments}
        icon="✅"
        bgColor="bg-emerald-50"
      />
      <StatCard
        label="Pending Payments"
        value={stats.pendingPayments}
        icon="⏳"
        bgColor="bg-amber-50"
      />
      <StatCard
        label="Total BTC Received"
        value={`${stats.totalBtcReceived} BTC`}
        icon="₿"
        bgColor="bg-orange-50"
      />

      {/* Quick Actions */}
      <View className="mt-6 gap-3">
        <Text className="text-lg font-semibold text-foreground">Quick Actions</Text>
        <TouchableOpacity className="bg-primary rounded-lg p-4 active:opacity-80">
          <Text className="text-white font-semibold text-center">Export Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-surface border border-border rounded-lg p-4 active:opacity-80">
          <Text className="text-foreground font-semibold text-center">View Logs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PaymentsTab({
  payments,
  colors,
}: {
  payments: Payment[];
  colors: any;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100";
      case "pending":
        return "bg-amber-100";
      case "failed":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-700";
      case "pending":
        return "text-amber-700";
      case "failed":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">Recent Payments</Text>
      {payments.map((payment) => (
        <View
          key={payment.id}
          className="bg-surface border border-border rounded-lg p-4 gap-3"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-sm text-muted">Payment #{payment.id}</Text>
              <Text className="text-lg font-semibold text-foreground mt-1">
                {payment.amount} BTC
              </Text>
              <Text className="text-sm text-muted">${payment.amountUSD}</Text>
            </View>
            <View className={`${getStatusColor(payment.status)} rounded-full px-3 py-1`}>
              <Text className={`text-xs font-semibold capitalize ${getStatusTextColor(payment.status)}`}>
                {payment.status}
              </Text>
            </View>
          </View>
          {payment.txHash && (
            <Text className="text-xs text-muted font-mono">TX: {payment.txHash}</Text>
          )}
          <Text className="text-xs text-muted">
            {payment.createdAt.toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );
}

function UsersTab({ colors }: { colors: any }) {
  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-foreground">User Management</Text>
      <View className="bg-surface border border-border rounded-lg p-4 gap-3">
        <Text className="text-sm text-muted">Total Active Users: 156</Text>
        <Text className="text-sm text-muted">New Users (7 days): 12</Text>
        <Text className="text-sm text-muted">Admin Users: 1</Text>
      </View>

      <TouchableOpacity className="bg-primary rounded-lg p-4 active:opacity-80 mt-4">
        <Text className="text-white font-semibold text-center">Manage Users</Text>
      </TouchableOpacity>
    </View>
  );
}
