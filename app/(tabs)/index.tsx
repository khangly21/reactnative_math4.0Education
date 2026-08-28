import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

interface FeaturedTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const FEATURED_TOPICS: FeaturedTopic[] = [
  {
    id: "1",
    title: "Linear Algebra",
    description: "Matrices & Vectors for Robotics",
    icon: "⬜",
    color: "bg-blue-100",
  },
  {
    id: "2",
    title: "Calculus",
    description: "Derivatives for Control Systems",
    icon: "📈",
    color: "bg-purple-100",
  },
  {
    id: "3",
    title: "Statistics",
    description: "Data Analysis for Industry 4.0",
    icon: "📊",
    color: "bg-green-100",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6 pb-6">
          {/* Hero Section */}
          <View className="bg-gradient-to-r from-primary to-accent px-6 py-8 gap-2">
            <Text className="text-4xl font-bold text-white">Mathematics 4.0</Text>
            <Text className="text-base text-white/90">
              Master mathematics in the industrial era
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="px-6 gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-primary">12</Text>
                <Text className="text-xs text-muted mt-1">Lessons Completed</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-success">8</Text>
                <Text className="text-xs text-muted mt-1">Quizzes Passed</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-warning">5</Text>
                <Text className="text-xs text-muted mt-1">Day Streak</Text>
              </View>
            </View>
          </View>

          {/* Featured Topics Section */}
          <View className="px-6 gap-3">
            <Text className="text-xl font-bold text-foreground">Featured Topics</Text>
            <FlatList
              data={FEATURED_TOPICS}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                onPress={() => router.push("../topics")}
                  className={`${item.color} rounded-xl p-4 mb-3 border border-border`}
                  activeOpacity={0.7}
                >
                  <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl">{item.icon}</Text>
                      <Text className="text-lg font-semibold text-foreground flex-1">
                        {item.title}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted">{item.description}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Call-to-Action */}
          <View className="px-6 gap-3">
            <TouchableOpacity
              onPress={() => router.push("../topics")}
              className="bg-primary rounded-xl py-4 px-6 active:opacity-80"
            >
              <Text className="text-center text-white font-semibold text-base">
                Start Learning
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("../progress")}
              className="bg-surface border border-border rounded-xl py-4 px-6 active:opacity-80"
            >
              <Text className="text-center text-foreground font-semibold text-base">
                View Progress
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View className="px-6 gap-2">
            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <Text className="text-sm font-semibold text-foreground">💡 Tip</Text>
              <Text className="text-xs text-muted leading-relaxed">
                Mathematics is the foundation of Industry 4.0. Learn how calculus powers control
                systems, linear algebra drives robotics, and statistics enables data analytics.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
