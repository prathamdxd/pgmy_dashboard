import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const colors = {
  primary: "#1a1e23",
  primaryDark: "#252a32",
  secondary: "#2d343f",
  accent: "#f5b301",
  accentLight: "#fed053",
  textLight: "#f8f9fa",
  textDark: "#212529",
  textGray: "#a0a8b0",
  cardBg: "rgba(37, 42, 50, 0.95)",
  cardBorder: "#3b424e",
};

const ContactScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Use URLSearchParams instead of FormData for better compatibility
      const params = new URLSearchParams();
      params.append("name", formData.name);
      params.append("email", formData.email);
      params.append("phone", formData.phone || "");
      params.append("message", formData.message);

      const scriptURL =
        "https://script.google.com/macros/s/AKfycbxxrn5a3BSzTsuUbOg7qRi3tn8Irnlkz5JzFp-hpP7ya2UXTfRU2Q6pbQRXFv2bTmHfTw/exec";

      const response = await fetch(`${scriptURL}?${params.toString()}`, {
        method: "GET", // Using GET instead of POST for better reliability
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // First try to read as text
      const responseText = await response.text();

      // Then try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails but response contains success indicators
        if (
          responseText.includes("success") ||
          responseText.includes("Thank you")
        ) {
          result = { result: "success" };
        } else {
          throw new Error("Invalid server response format");
        }
      }

      if (result && result.result === "success") {
        Alert.alert("Success", "Thank you! Your submission was received.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        throw new Error(
          result?.error || "Submission failed without error details"
        );
      }
    } catch (error) {
      console.error("Full submission error:", error);
      Alert.alert(
        "Submission Error",
        error.message || "Failed to submit the form. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} />
      <ImageBackground
        source={require("./assets/img1.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.menuButton}
          >
            <FontAwesome name="arrow-left" size={24} color="#f5b301" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Contact Us</Text>
          </View>
        </View>

        {/* Contact Form Content */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: 30 },
          ]}
        >
          <View style={styles.paddedContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Get in Touch</Text>
              <Text style={styles.cardText}>
                Have questions or feedback? Fill out the form below and we'll
                get back to you as soon as possible.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                  placeholder="Your name"
                  placeholderTextColor={colors.textGray}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange("phone", text)}
                  placeholder="Your phone number"
                  placeholderTextColor={colors.textGray}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.message}
                  onChangeText={(text) => handleInputChange("message", text)}
                  placeholder="Your message..."
                  placeholderTextColor={colors.textGray}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  paddedContent: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    elevation: 25,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    marginLeft: 15,
  },
  headerTitle: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 70,
    textAlign: "center",
    flex: 1,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  cardText: {
    color: colors.textLight,
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.textLight,
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    padding: 12,
    color: colors.textLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ContactScreen;
