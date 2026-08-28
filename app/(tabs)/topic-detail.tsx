import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface TopicData {
  id: string;
  title: string;
  description: string;
  content: string;
  isPaid: boolean;
  price: number;
  icon: string;
}

const TOPICS_DATA: Record<string, TopicData> = {
  "linear-algebra": {
    id: "linear-algebra",
    title: "Linear Algebra",
    description: "Matrices & Vectors for Robotics",
    content: `Linear algebra is the foundation of modern mathematics and engineering. In the context of Industry 4.0, linear algebra is crucial for:

1. **Robotics Control**: Matrix operations are used to control robot movements and transformations.

2. **Machine Learning**: Neural networks rely heavily on matrix multiplications and linear transformations.

3. **Computer Vision**: Image processing and 3D transformations use linear algebra extensively.

4. **Signal Processing**: Fourier transforms and signal analysis depend on linear algebra concepts.

## Key Concepts

### Vectors
A vector is an ordered list of numbers that can represent:
- Position in space
- Direction and magnitude
- Data points in machine learning

### Matrices
A matrix is a rectangular array of numbers. Key operations include:
- Matrix multiplication
- Determinants
- Eigenvalues and eigenvectors

### Applications in Industry 4.0
- Robot kinematics and dynamics
- Image recognition systems
- Data transformation and analysis
- Control systems for manufacturing`,
    isPaid: false,
    price: 0,
    icon: "📐",
  },
  calculus: {
    id: "calculus",
    title: "Calculus",
    description: "Derivatives for Control Systems",
    content: `Calculus is essential for understanding change and optimization in Industry 4.0 systems.

## Derivatives
Derivatives measure the rate of change of a function. In industry applications:
- Control system feedback loops
- Optimization algorithms
- Motion planning for robots

## Integrals
Integrals are used for:
- Calculating areas and volumes
- Accumulating quantities over time
- Energy calculations in systems

## Applications in Industry 4.0
- PID control systems
- Trajectory planning
- Process optimization
- System modeling and simulation`,
    isPaid: true,
    price: 9.99,
    icon: "📈",
  },
  statistics: {
    id: "statistics",
    title: "Statistics",
    description: "Data Analysis for Industry 4.0",
    content: `Statistics enables data-driven decision making in modern manufacturing and industrial systems.

## Descriptive Statistics
- Mean, median, mode
- Standard deviation
- Distribution analysis

## Inferential Statistics
- Hypothesis testing
- Confidence intervals
- Regression analysis

## Applications in Industry 4.0
- Quality control and process monitoring
- Predictive maintenance
- Performance metrics analysis
- Machine learning model evaluation`,
    isPaid: true,
    price: 14.99,
    icon: "📊",
  },
};

export default function TopicDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const topic = topicId ? TOPICS_DATA[topicId] : null;

  if (!topic) {
    return (
      <ScreenContainer className="justify-center items-center gap-4">
        <Text className="text-lg text-foreground">Topic not found</Text>
        <TouchableOpacity className="bg-primary px-6 py-3 rounded-lg" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const handlePayment = async () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please login to purchase this topic");
      return;
    }

    setPurchaseLoading(true);
    try {
      // Navigate to payment screen
      router.push({
        pathname: "/(tabs)/payment",
        params: {
          topicId: topic.id,
          topicTitle: topic.title,
          amount: topic.price,
        },
      } as any);
    } catch (error) {
      Alert.alert("Error", "Failed to initiate payment");
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 gap-3">
          <View className="flex-row items-center gap-3">
            <Text className="text-5xl">{topic.icon}</Text>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">{topic.title}</Text>
              <Text className="text-purple-100">{topic.description}</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 px-6 py-8 gap-6">
          {/* Content Section */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Content</Text>
            <View className="bg-surface border border-border rounded-lg p-4">
              <Text className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {topic.content}
              </Text>
            </View>
          </View>

          {/* Payment Section */}
          {topic.isPaid && (
            <View className="bg-amber-50 border border-amber-200 rounded-lg p-4 gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">🔒</Text>
                <Text className="text-sm font-semibold text-amber-900">Premium Content</Text>
              </View>
              <Text className="text-sm text-amber-800">
                This topic requires a one-time payment to unlock full access.
              </Text>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-2xl font-bold text-amber-900">${topic.price}</Text>
                <Text className="text-xs text-amber-700">Pay with Bitcoin</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            {topic.isPaid ? (
              <TouchableOpacity
                className="bg-primary px-6 py-4 rounded-lg"
                onPress={handlePayment}
                disabled={purchaseLoading}
              >
                <Text className="text-white font-semibold text-center text-lg">
                  {purchaseLoading ? "Processing..." : `Unlock for $${topic.price}`}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="bg-green-600 px-6 py-4 rounded-lg">
                <Text className="text-white font-semibold text-center text-lg">Free Content ✓</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="border border-border px-6 py-4 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-foreground font-semibold text-center">Back to Topics</Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View className="bg-blue-50 rounded-lg p-4 gap-2 mt-4">
            <Text className="text-sm font-semibold text-blue-900">💡 About this topic:</Text>
            <Text className="text-xs text-blue-800">
              This comprehensive guide covers essential mathematics concepts for Industry 4.0. Learn
              how these mathematical principles power modern manufacturing, robotics, and AI systems.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
