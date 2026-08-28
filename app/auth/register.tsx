import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      // In production, call: const response = await trpc.auth.registerWithEmail.mutate({ name, email, password });
      // For now, mock successful registration
      setTimeout(() => {
        Alert.alert("Success", "Account created! Please log in.");
        router.replace("/auth/login");
      }, 1500);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-gradient-to-r from-green-600 to-green-400 px-6 py-12 gap-2">
          <Text className="text-4xl font-bold text-white">Create Account</Text>
          <Text className="text-green-100">Join us to start learning</Text>
        </View>

        <View className="flex-1 px-6 py-8 gap-4">
          {/* Name Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
              className="border border-border rounded-lg px-4 py-3 bg-surface text-foreground"
            />
          </View>

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
            <Text className="text-xs text-muted mt-1">At least 6 characters</Text>
          </View>

          {/* Confirm Password Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Confirm Password</Text>
            <View className="flex-row items-center border border-border rounded-lg px-4 py-3 bg-surface">
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
                className="flex-1 text-foreground"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text className="text-primary text-sm font-semibold">
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms Checkbox */}
          <View className="flex-row items-start gap-3 mt-2">
            <Text className="text-primary text-lg">☑</Text>
            <Text className="text-xs text-muted flex-1">
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className="rounded-lg p-4 bg-primary mt-4"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-center text-lg">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center gap-2 mt-4">
            <Text className="text-sm text-muted">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-sm text-primary font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
