import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      // In production, call: const response = await trpc.auth.loginWithEmail.mutate({ email, password });
      // For now, mock successful login
      setTimeout(() => {
        Alert.alert("Success", "Logged in successfully!");
        router.replace("/(tabs)");
      }, 1500);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // In production, implement Google OAuth:
      // const result = await trpc.auth.loginWithGoogle.mutate({ idToken });
      // For now, mock successful login
      setTimeout(() => {
        Alert.alert("Success", "Logged in with Google!");
        router.replace("/(tabs)");
      }, 1500);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-12 gap-2">
          <Text className="text-4xl font-bold text-white">Welcome Back</Text>
          <Text className="text-blue-100">Login to continue learning</Text>
        </View>

        <View className="flex-1 px-6 py-8 gap-6">
          {/* Email Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              className="border border-border rounded-lg px-4 py-3 bg-surface text-foreground"
            />
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
            <View className="flex-row items-center border border-border rounded-lg px-4 py-3 bg-surface">
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                className="flex-1 text-foreground"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text className="text-primary text-sm font-semibold">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity>
            <Text className="text-sm text-primary font-semibold">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Email Login Button */}
          <TouchableOpacity
            className="rounded-lg p-4 bg-primary"
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-center text-lg">Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-sm text-muted">Or continue with</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-3 border border-border rounded-lg p-4 bg-surface"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text className="text-2xl">🔵</Text>
            <Text className="text-foreground font-semibold">Login with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center gap-2 mt-4">
            <Text className="text-sm text-muted">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/register" as any)}>
              <Text className="text-sm text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms */}
        <View className="px-6 py-4 border-t border-border">
          <Text className="text-xs text-muted text-center">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
