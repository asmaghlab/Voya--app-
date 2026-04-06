import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/routes/store";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast, { BaseToast } from "react-native-toast-message";

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />

      <Toast
        config={{
          success: (props) => (
            <BaseToast
              {...props}
              style={{
                borderLeftColor: "#00A6E8",
                backgroundColor: "#fff",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#00A6E8",
              }}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              text1Style={{ fontSize: 16, fontWeight: "700", color: "#00A6E8" }}
            />
          ),
          error: (props) => (
            <BaseToast
              {...props}
              style={{
                borderLeftColor: "#FF3B30",
                backgroundColor: "#fff",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#FF3B30",
              }}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              text1Style={{ fontSize: 16, fontWeight: "700", color: "#FF3B30" }}
              text2Style={{ fontSize: 13, color: "#555" }}
            />
          ),
        }}
      />
    </Provider>
  );
}
