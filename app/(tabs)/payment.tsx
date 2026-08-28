import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { usePaymentStatus, usePaymentStatusDisplay } from "@/hooks/use-payment-status";

interface PaymentState {
  amountUsd: string;
  amountBtc: string;
  walletAddress: string;
  paymentAddress: string;
  status: "idle" | "loading" | "pending" | "confirmed" | "error";
  message: string;
  txHash?: string;
}

export default function PaymentScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [btcPrice, setBtcPrice] = useState<number>(40000);
  const [payment, setPayment] = useState<PaymentState>({
    amountUsd: "",
    amountBtc: "",
    walletAddress: "",
    paymentAddress: "",
    status: "idle",
    message: "",
  });

  // Real-time payment monitoring
  const { status: paymentStatus, startMonitoring, stopMonitoring } = usePaymentStatus({
    paymentAddress: payment.paymentAddress,
    expectedBtc: parseFloat(payment.amountBtc) || 0,
    pollInterval: 30000, // Check every 30 seconds
    maxAttempts: 120, // Monitor for up to 1 hour
    onStatusChange: (newStatus) => {
      console.log("[Payment] Status changed:", newStatus);
      setPayment((prev) => ({
        ...prev,
        status: newStatus.status as any,
        message: getStatusMessage(newStatus.status),
      }));
    },
    onConfirmed: () => {
      Alert.alert("Success!", "Your Bitcoin payment has been confirmed!");
      setPayment((prev) => ({
        ...prev,
        status: "confirmed",
        message: "Payment confirmed! Thank you.",
      }));
    },
    onExpired: () => {
      Alert.alert("Expired", "Payment request has expired. Please create a new one.");
      setPayment((prev) => ({
        ...prev,
        status: "error",
        message: "Payment request expired",
      }));
    },
  });

  const statusDisplay = usePaymentStatusDisplay(paymentStatus);

  // Fetch BTC price
  useEffect(() => {
    fetchBtcPrice();
  }, []);

  // Start monitoring when payment address is created
  useEffect(() => {
    if (payment.paymentAddress && payment.status === "pending") {
      startMonitoring();
    }

    return () => {
      if (payment.status === "pending") {
        stopMonitoring();
      }
    };
  }, [payment.paymentAddress, payment.status, startMonitoring, stopMonitoring]);

  const fetchBtcPrice = async () => {
    try {
      // In production, call API endpoint
      // const price = await trpc.payment.getBtcPrice.query();
      // setBtcPrice(price);
      setBtcPrice(40000); // Mock price
    } catch (error) {
      console.error("Failed to fetch BTC price:", error);
    }
  };

  const handleUsdChange = (value: string) => {
    setPayment((prev) => ({
      ...prev,
      amountUsd: value,
      amountBtc:
        value && btcPrice ? (parseFloat(value) / btcPrice).toFixed(8) : "",
    }));
  };

  const handleBtcChange = (value: string) => {
    setPayment((prev) => ({
      ...prev,
      amountBtc: value,
      amountUsd:
        value && btcPrice ? (parseFloat(value) * btcPrice).toFixed(2) : "",
    }));
  };

  const handleCreatePayment = async () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please login to create a payment");
      return;
    }

    if (!payment.amountUsd || !payment.walletAddress) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setPayment((prev) => ({ ...prev, status: "loading", message: "Creating payment..." }));

      // In production, call API
      // const result = await trpc.payment.createPaymentRequest.mutate({
      //   amountUsd: parseFloat(payment.amountUsd),
      //   walletAddress: payment.walletAddress,
      // });

      // Mock payment creation
      const mockPaymentAddress = `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`;
      setPayment((prev) => ({
        ...prev,
        status: "pending",
        paymentAddress: mockPaymentAddress,
        message: "Payment request created. Waiting for payment...",
      }));

      // Monitoring will start automatically via useEffect
    } catch (error) {
      setPayment((prev) => ({
        ...prev,
        status: "error",
        message: error instanceof Error ? error.message : "Failed to create payment",
      }));
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "confirmed":
        return "✓ Payment Confirmed";
      case "pending":
        return "⏳ Waiting for Confirmation";
      case "expired":
        return "✗ Payment Expired";
      default:
        return "Checking...";
    }
  };

  const copyToClipboard = (text: string) => {
    // In production, use react-native-clipboard
    Alert.alert("Copied", text);
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center items-center gap-4">
        <Text className="text-lg text-foreground">Please login to make payments</Text>
        <TouchableOpacity className="bg-primary px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">Go to Home</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8 gap-2">
          <Text className="text-3xl font-bold text-white">Bitcoin Payment</Text>
          <Text className="text-orange-100">Pay with cryptocurrency</Text>
        </View>

        <View className="flex-1 px-4 py-6 gap-6">
          {/* Current BTC Price */}
          <View className="bg-surface border border-border rounded-lg p-4">
            <Text className="text-sm text-muted mb-2">Current BTC Price</Text>
            <Text className="text-2xl font-bold text-foreground">
              ${btcPrice.toLocaleString()}
            </Text>
            <Text className="text-xs text-muted mt-2">Updated: Just now</Text>
          </View>

          {/* Amount Input */}
          <View className="gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Amount (USD)</Text>
              <View className="flex-row items-center border border-border rounded-lg px-4 py-3 bg-surface">
                <Text className="text-lg text-muted mr-2">$</Text>
                <TextInput
                  placeholder="Enter amount in USD"
                  placeholderTextColor={colors.muted}
                  value={payment.amountUsd}
                  onChangeText={handleUsdChange}
                  keyboardType="decimal-pad"
                  className="flex-1 text-foreground"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Amount (BTC)</Text>
              <View className="flex-row items-center border border-border rounded-lg px-4 py-3 bg-surface">
                <Text className="text-lg text-muted mr-2">₿</Text>
                <TextInput
                  placeholder="Enter amount in BTC"
                  placeholderTextColor={colors.muted}
                  value={payment.amountBtc}
                  onChangeText={handleBtcChange}
                  keyboardType="decimal-pad"
                  className="flex-1 text-foreground"
                />
              </View>
            </View>
          </View>

          {/* Wallet Address Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Your Wallet Address</Text>
            <TextInput
              placeholder="Enter your Bitcoin wallet address"
              placeholderTextColor={colors.muted}
              value={payment.walletAddress}
              onChangeText={(text) =>
                setPayment((prev) => ({ ...prev, walletAddress: text }))
              }
              className="border border-border rounded-lg px-4 py-3 bg-surface text-foreground"
              multiline
              numberOfLines={3}
            />
            <Text className="text-xs text-muted mt-2">
              This is where you'll receive the payment
            </Text>
          </View>

          {/* Real-time Payment Status */}
          {payment.status !== "idle" && (
            <View
              className={`rounded-lg p-4 ${
                paymentStatus.status === "confirmed"
                  ? "bg-green-50"
                  : paymentStatus.status === "expired" || paymentStatus.status === "failed"
                    ? "bg-red-50"
                    : "bg-blue-50"
              }`}
            >
              {/* Status Header */}
              <View className="flex-row items-center gap-3 mb-3">
                {payment.status === "loading" && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
                {payment.status === "pending" && (
                  <Text className="text-2xl">⏳</Text>
                )}
                {payment.status === "confirmed" && (
                  <Text className="text-2xl">✓</Text>
                )}
                {payment.status === "error" && (
                  <Text className="text-2xl">✗</Text>
                )}
                <Text
                  className={`flex-1 font-semibold text-lg ${
                    paymentStatus.status === "confirmed"
                      ? "text-green-700"
                      : paymentStatus.status === "expired" || paymentStatus.status === "failed"
                        ? "text-red-700"
                        : "text-blue-700"
                  }`}
                >
                  {statusDisplay.label}
                </Text>
              </View>

              {/* Status Message */}
              <Text
                className={`text-sm mb-3 ${
                  paymentStatus.status === "confirmed"
                    ? "text-green-600"
                    : paymentStatus.status === "expired" || paymentStatus.status === "failed"
                      ? "text-red-600"
                      : "text-blue-600"
                }`}
              >
                {statusDisplay.message}
              </Text>

              {/* Confirmation Progress */}
              {payment.status === "pending" && paymentStatus.confirmations > 0 && (
                <View className="mb-3 gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-muted">Confirmations</Text>
                    <Text className="text-xs font-semibold text-blue-700">
                      {paymentStatus.confirmations}/3
                    </Text>
                  </View>
                  <View className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min((paymentStatus.confirmations / 3) * 100, 100)}%`,
                      }}
                    />
                  </View>
                </View>
              )}

              {/* Payment Address */}
              {payment.paymentAddress && (
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Send payment to:
                  </Text>
                  <TouchableOpacity
                    className="bg-white border border-border rounded-lg p-3 flex-row items-center justify-between"
                    onPress={() => copyToClipboard(payment.paymentAddress)}
                  >
                    <Text className="text-xs text-foreground font-mono flex-1">
                      {payment.paymentAddress.substring(0, 20)}...
                    </Text>
                    <Text className="text-xs text-primary">Copy</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Transaction Hash */}
              {payment.txHash && (
                <View className="mt-3 pt-3 border-t border-blue-200">
                  <Text className="text-xs text-muted">
                    Transaction: {payment.txHash.substring(0, 20)}...
                  </Text>
                </View>
              )}

              {/* Poll Count */}
              {payment.status === "pending" && (
                <View className="mt-3 pt-3 border-t border-blue-200">
                  <Text className="text-xs text-muted">
                    Checking... (attempt {paymentStatus.pollCount}/120)
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Create Payment Button */}
          <TouchableOpacity
            className={`rounded-lg p-4 ${
              payment.status === "loading" ? "opacity-50" : ""
            }`}
            style={{ backgroundColor: colors.primary }}
            onPress={handleCreatePayment}
            disabled={payment.status === "loading"}
          >
            {payment.status === "loading" ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-center text-lg">
                Create Payment Request
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Section */}
          <View className="bg-blue-50 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-blue-900">How it works:</Text>
            <Text className="text-xs text-blue-800">
              1. Enter the amount you want to pay{"\n"}
              2. Provide your Bitcoin wallet address{"\n"}
              3. We'll generate a payment address for you{"\n"}
              4. Send the Bitcoin to the address{"\n"}
              5. Payment will be confirmed automatically (real-time updates)
            </Text>
          </View>

          {/* Security Notice */}
          <View className="bg-amber-50 rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-amber-900">🔒 Security:</Text>
            <Text className="text-xs text-amber-800">
              All transactions are verified on the Bitcoin blockchain. We use BlockCypher API for
              real-time payment verification with automatic status updates.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
