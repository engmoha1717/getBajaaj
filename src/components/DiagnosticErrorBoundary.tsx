// TEMPORARY — debugging the "Couldn't find a navigation context" crash.
// console.error's raw stack + component stack get forwarded to the
// Metro terminal (unlike LogBox's on-device summary), so this should
// reveal exactly which internal function throws, instead of guessing.
// Remove once the root cause is found.
import { Component, type ReactNode } from "react";
import { Text, View } from "react-native";

export class DiagnosticErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("=== DIAGNOSTIC: error boundary caught ===");
    console.error("message:", error.message);
    console.error("RAW STACK:\n" + error.stack);
    console.error("REACT COMPONENT STACK:\n" + info.componentStack);
    console.error("=== END DIAGNOSTIC ===");
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          <Text>Something broke — details logged to the terminal.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
