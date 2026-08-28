import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScreenContainer } from "@/components/screen-container";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState("Intermediate");

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would persist this preference
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6 pb-6">
          {/* Header */}
          <View className="bg-gradient-to-r from-primary to-accent px-6 py-6 gap-2">
            <Text className="text-3xl font-bold text-white">Settings</Text>
            <Text className="text-sm text-white/90">Customize your learning experience</Text>
          </View>

          {/* Profile Section */}
          <View className="px-6 gap-3">
            <Text className="text-lg font-bold text-foreground">Profile</Text>
            <View className="bg-surface rounded-xl p-4 border border-border gap-4">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                  <Text className="text-2xl">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Student</Text>
                  <Text className="text-sm text-muted">Learning Mathematics 4.0</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="px-6 gap-3">
            <Text className="text-lg font-bold text-foreground">Preferences</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* Theme Toggle */}
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <View className="gap-1">
                  <Text className="text-base font-semibold text-foreground">Dark Mode</Text>
                  <Text className="text-xs text-muted">
                    {isDarkMode ? "Enabled" : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: "#E0E7FF", true: "#0066CC" }}
                  thumbColor={isDarkMode ? "#FFFFFF" : "#F0F4FF"}
                />
              </View>

              {/* Notifications Toggle */}
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <View className="gap-1">
                  <Text className="text-base font-semibold text-foreground">Notifications</Text>
                  <Text className="text-xs text-muted">
                    {notificationsEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#E0E7FF", true: "#0066CC" }}
                  thumbColor={notificationsEnabled ? "#FFFFFF" : "#F0F4FF"}
                />
              </View>

              {/* Difficulty Level */}
              <View className="px-4 py-4">
                <Text className="text-base font-semibold text-foreground mb-3">Difficulty Level</Text>
                <View className="gap-2">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setDifficulty(level)}
                      className={`px-4 py-3 rounded-lg border ${
                        difficulty === level
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          difficulty === level ? "text-white" : "text-foreground"
                        }`}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Learning Section */}
          <View className="px-6 gap-3">
            <Text className="text-lg font-bold text-foreground">Learning</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-border active:opacity-80">
                <View className="gap-1">
                  <Text className="text-base font-semibold text-foreground">Download Offline Content</Text>
                  <Text className="text-xs text-muted">Save topics for offline learning</Text>
                </View>
                <Text className="text-lg text-muted">›</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 active:opacity-80">
                <View className="gap-1">
                  <Text className="text-base font-semibold text-foreground">Clear Progress</Text>
                  <Text className="text-xs text-muted">Reset all learning data</Text>
                </View>
                <Text className="text-lg text-muted">›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About Section */}
          <View className="px-6 gap-3">
            <Text className="text-lg font-bold text-foreground">About</Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <Text className="text-base font-semibold text-foreground">App Version</Text>
                <Text className="text-sm text-muted">1.0.0</Text>
              </View>

              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <Text className="text-base font-semibold text-foreground">Build Number</Text>
                <Text className="text-sm text-muted">1</Text>
              </View>

              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-border active:opacity-80">
                <Text className="text-base font-semibold text-foreground">Privacy Policy</Text>
                <Text className="text-lg text-muted">›</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 active:opacity-80">
                <Text className="text-base font-semibold text-foreground">Terms of Service</Text>
                <Text className="text-lg text-muted">›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Section */}
          <View className="px-6 gap-3">
            <View className="bg-accent/10 border border-accent rounded-xl p-4 gap-2">
              <Text className="text-sm font-semibold text-foreground">💡 Need Help?</Text>
              <Text className="text-xs text-muted">
                Check out our FAQ or contact support for assistance with your learning journey.
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <View className="px-6">
            <TouchableOpacity className="bg-error/10 border border-error rounded-xl py-4 px-6 active:opacity-80">
              <Text className="text-center text-error font-semibold text-base">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
