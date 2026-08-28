import { ScrollView, Text, View, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    unlocked: true,
  },
  {
    id: "2",
    title: "Quiz Master",
    description: "Pass 5 quizzes",
    icon: "🏆",
    unlocked: true,
  },
  {
    id: "3",
    title: "Consistent Learner",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "4",
    title: "Math Expert",
    description: "Complete all topics",
    icon: "🧠",
    unlocked: false,
  },
  {
    id: "5",
    title: "Speed Demon",
    description: "Complete a quiz in under 5 minutes",
    icon: "⚡",
    unlocked: true,
  },
  {
    id: "6",
    title: "Perfect Score",
    description: "Get 100% on a quiz",
    icon: "⭐",
    unlocked: false,
  },
];

export default function ProgressScreen() {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6 pb-6">
          {/* Header */}
          <View className="bg-gradient-to-r from-primary to-accent px-6 py-6 gap-2">
            <Text className="text-3xl font-bold text-white">Your Progress</Text>
            <Text className="text-sm text-white/90">Track your learning journey</Text>
          </View>

          {/* Statistics Dashboard */}
          <View className="px-6 gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-3xl font-bold text-primary">12</Text>
                <Text className="text-xs text-muted">Lessons Completed</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-3xl font-bold text-success">8</Text>
                <Text className="text-xs text-muted">Quizzes Passed</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-3xl font-bold text-warning">5</Text>
                <Text className="text-xs text-muted">Day Streak</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-3xl font-bold text-accent">78%</Text>
                <Text className="text-xs text-muted">Overall Progress</Text>
              </View>
            </View>
          </View>

          {/* Learning Path */}
          <View className="px-6 gap-3">
            <Text className="text-lg font-bold text-foreground">Learning Path</Text>
            <View className="bg-surface rounded-xl p-4 border border-border gap-4">
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">Algebra Fundamentals</Text>
                  <Text className="text-xs font-semibold text-success">✓ Completed</Text>
                </View>
                <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <View className="h-full bg-success rounded-full" style={{ width: "100%" }} />
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">Linear Algebra</Text>
                  <Text className="text-xs font-semibold text-primary">75%</Text>
                </View>
                <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">Calculus</Text>
                  <Text className="text-xs font-semibold text-primary">50%</Text>
                </View>
                <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: "50%" }} />
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-muted">Statistics</Text>
                  <Text className="text-xs font-semibold text-muted">0%</Text>
                </View>
                <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <View className="h-full bg-border rounded-full" style={{ width: "0%" }} />
                </View>
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View className="px-6 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Achievements</Text>
              <Text className="text-sm font-semibold text-muted">
                {unlockedCount}/{ACHIEVEMENTS.length}
              </Text>
            </View>

            <FlatList
              data={ACHIEVEMENTS}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <View
                  className={`flex-1 rounded-xl p-4 border gap-2 ${
                    item.unlocked
                      ? "bg-surface border-border"
                      : "bg-muted/10 border-muted/30"
                  }`}
                >
                  <Text className={`text-3xl ${item.unlocked ? "" : "opacity-50"}`}>
                    {item.icon}
                  </Text>
                  <Text
                    className={`text-sm font-semibold ${
                      item.unlocked ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs text-muted">{item.description}</Text>
                </View>
              )}
            />
          </View>

          {/* Recommendations */}
          <View className="px-6 gap-3">
            <Text className="text-lg font-bold text-foreground">Recommended Next</Text>
            <View className="bg-accent/10 border border-accent rounded-xl p-4 gap-2">
              <Text className="text-sm font-semibold text-foreground">📊 Statistics & Probability</Text>
              <Text className="text-xs text-muted">
                Based on your progress, this is the perfect next topic to master data analysis for
                Industry 4.0 applications.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
