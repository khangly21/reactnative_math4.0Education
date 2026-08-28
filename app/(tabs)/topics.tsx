import { ScrollView, Text, View, TouchableOpacity, FlatList, TextInput, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  icon: string;
}

const ALL_TOPICS: Topic[] = [
  {
    id: "1",
    title: "Linear Algebra Basics",
    description: "Matrices, vectors, and operations for robotics",
    category: "Linear Algebra",
    difficulty: "Beginner",
    progress: 75,
    icon: "⬜",
  },
  {
    id: "2",
    title: "Calculus Fundamentals",
    description: "Derivatives and integrals for control systems",
    category: "Calculus",
    difficulty: "Intermediate",
    progress: 50,
    icon: "📈",
  },
  {
    id: "3",
    title: "Statistics & Probability",
    description: "Data analysis and probability for analytics",
    category: "Statistics",
    difficulty: "Intermediate",
    progress: 60,
    icon: "📊",
  },
  {
    id: "4",
    title: "Discrete Mathematics",
    description: "Logic and algorithms for computing",
    category: "Discrete Math",
    difficulty: "Advanced",
    progress: 0,
    icon: "🔢",
  },
  {
    id: "5",
    title: "Algebra Fundamentals",
    description: "Equations, variables, and functions",
    category: "Algebra",
    difficulty: "Beginner",
    progress: 100,
    icon: "✖️",
  },
  {
    id: "6",
    title: "Geometry & Spatial Reasoning",
    description: "3D modeling and spatial concepts",
    category: "Geometry",
    difficulty: "Beginner",
    progress: 40,
    icon: "🔷",
  },
];

const CATEGORIES = ["All", "Linear Algebra", "Calculus", "Statistics", "Discrete Math", "Algebra", "Geometry"];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100";
    case "Intermediate":
      return "bg-yellow-100";
    case "Advanced":
      return "bg-red-100";
    default:
      return "bg-gray-100";
  }
};

const getDifficultyTextColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "text-green-700";
    case "Intermediate":
      return "text-yellow-700";
    case "Advanced":
      return "text-red-700";
    default:
      return "text-gray-700";
  }
};

export default function TopicsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleTopicPress = (topicId: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login Required",
        "Please login to view topic details and purchase premium content.",
        [
          { text: "Cancel", onPress: () => {} },
          {
            text: "Login",
            onPress: () => router.push("/(auth)/login" as any),
          },
        ]
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/topic-detail",
      params: { topicId },
    } as any);
  };

  const filteredTopics = ALL_TOPICS.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-4 pb-6">
          {/* Header */}
          <View className="bg-gradient-to-r from-primary to-accent px-6 py-6 gap-2">
            <Text className="text-3xl font-bold text-white">Topics</Text>
            <Text className="text-sm text-white/90">
              {filteredTopics.length} topic{filteredTopics.length !== 1 ? "s" : ""} available
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-6">
            <TextInput
              placeholder="Search topics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Category Filter */}
          <View className="px-6">
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    selectedCategory === item
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedCategory === item ? "text-white" : "text-foreground"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Topics List */}
          <View className="px-6 gap-3">
            {filteredTopics.length > 0 ? (
              <FlatList
                data={filteredTopics}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="bg-surface rounded-xl p-4 border border-border gap-3 active:opacity-80"
                    activeOpacity={0.7}
                    onPress={() => handleTopicPress(item.id)}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 gap-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-2xl">{item.icon}</Text>
                          <Text className="text-lg font-semibold text-foreground flex-1">
                            {item.title}
                          </Text>
                        </View>
                        <Text className="text-sm text-muted">{item.description}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className={`${getDifficultyColor(item.difficulty)} rounded-full px-3 py-1`}>
                        <Text className={`text-xs font-semibold ${getDifficultyTextColor(item.difficulty)}`}>
                          {item.difficulty}
                        </Text>
                      </View>
                      <Text className="text-xs font-semibold text-muted">{item.progress}%</Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View className="items-center justify-center py-12">
                <Text className="text-lg font-semibold text-muted">No topics found</Text>
                <Text className="text-sm text-muted mt-2">Try adjusting your search or filters</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
