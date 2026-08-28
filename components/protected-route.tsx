import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}

/**
 * Protected Route Component
 * Ensures user is authenticated before accessing content
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({ children, requiredRole = "user" }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace("/auth/login" as any);
    }

    if (!loading && requiredRole === "admin" && user?.role !== "admin") {
      // Redirect if user doesn't have required role
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, loading, user, requiredRole, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole === "admin" && user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user is authenticated
 */
export function useProtectedRoute(requiredRole?: "user" | "admin") {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login" as any);
    }

    if (!loading && requiredRole === "admin" && user?.role !== "admin") {
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, loading, user, requiredRole, router]);

  return {
    isAuthenticated,
    isLoading: loading,
    user,
    hasRequiredRole: requiredRole ? user?.role === requiredRole : true,
  };
}
