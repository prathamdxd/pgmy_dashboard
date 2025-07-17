import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Modal,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import CalculatePCIScreen from "./CalculatePCIScreen";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// FAQ Screen Component
const FAQScreen = ({ navigation }) => {
  const faqData = [
    {
      question: "What is this app about?",
      answer:
        "This app helps predict the condition of rural roads under the PMGSY program using Markov Chain modeling to optimize maintenance planning and resource allocation.",
    },
    {
      question: "What maintenance strategies does the app support?",
      answer:
        "Our model recommends 3+ optimized maintenance strategies including preventive maintenance, minor rehabilitation, and major reconstruction based on predicted road conditions.",
    },
    {
      question: "What is PCI?",
      answer:
        "PCI stands for Pavement Condition Index, which is a numerical rating (0-100) that indicates the condition of a road section, with 100 being the best possible condition.",
    },
    {
      question: "How far into the future can the app predict?",
      answer:
        "The app can predict road conditions up to 10 years into the future based on current conditions and deterioration patterns.",
    },
    {
      question: "What data do I need to use the prediction tools?",
      answer:
        "You'll need basic information about the road section including current condition, traffic volume, and environmental factors for accurate predictions.",
    },
    {
      question: "How can I contact the development team?",
      answer:
        "You can reach out to us through the 'Contact Us' option in the sidebar menu for any queries or feedback.",
    },
    {
      question: "Is there a cost to use this app?",
      answer:
        "No, this app is completely free to use as it's developed as part of academic research to benefit rural road maintenance planning.",
    },
    {
      question: "Can I use this for roads outside PMGSY?",
      answer:
        "While optimized for PMGSY roads, the prediction model can be adapted for other rural roads with similar characteristics.",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} />
      <ImageBackground
        source={require("./assets/img1.jpg")} // Updated path for Expo
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
            <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          </View>
        </View>

        {/* FAQ Content */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: 30 },
          ]}
        >
          <View style={styles.paddedContent}>
            {faqData.map((item, index) => (
              <View key={index} style={[styles.card, { marginBottom: 15 }]}>
                <Text style={[styles.cardTitle, { color: colors.accent }]}>
                  {item.question}
                </Text>
                <Text style={styles.cardText}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

// TeamMember component
const TeamMember = ({ name, id, role }) => (
  <View style={styles.teamMember}>
    <View style={[styles.teamAvatar, { backgroundColor: colors.primaryDark }]}>
      <FontAwesome name="user" size={24} color={colors.accent} />
    </View>
    <View>
      <Text style={styles.teamMemberName}>{name}</Text>
      <Text style={styles.teamMemberId}>{id}</Text>
      {role && <Text style={styles.teamMemberRole}>{role}</Text>}
    </View>
  </View>
);

// Main App Component
const App = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_WIDTH));

  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const StatCard = ({ value, label }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} />
      <ImageBackground
        source={require("./assets/img1.jpg")} // Updated path for Expo
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>
          {/* Header with menu button */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.navLogoIcon}>
                <Text style={styles.navLogoIconText}>RPM</Text>
              </View>
              <Text style={styles.headerTitle}>Rural Roads</Text>
            </View>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
              <FontAwesome name="bars" size={24} color="#f5b301" />
            </TouchableOpacity>
          </View>

          {/* Sidebar */}
          <Modal
            animationType="none"
            transparent={true}
            visible={sidebarVisible}
            onRequestClose={toggleSidebar}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={styles.overlayTouchable}
                activeOpacity={1}
                onPress={toggleSidebar}
              />
              <Animated.View
                style={[
                  styles.sidebar,
                  {
                    transform: [{ translateX: slideAnim }],
                    right: 0,
                    left: "auto",
                  },
                ]}
              >
                <View style={styles.sidebarHeader}>
                  <View style={styles.sidebarLogo}>
                    <View style={styles.sidebarLogoIcon}>
                      <Text style={styles.sidebarLogoIconText}>RPM</Text>
                    </View>
                    <Text style={styles.sidebarLogoText}>Rural Roads</Text>
                  </View>
                  <TouchableOpacity
                    onPress={toggleSidebar}
                    style={styles.closeSidebar}
                  >
                    <FontAwesome name="times" size={24} color="#f5b301" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sidebarLinks}>
                  <TouchableOpacity
                    style={styles.sidebarLink}
                    onPress={toggleSidebar}
                  >
                    <Text style={styles.sidebarLinkText}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sidebarLink}
                    onPress={() => {
                      toggleSidebar();
                      navigation.navigate("CalculatePCI");
                    }}
                  >
                    <Text style={styles.sidebarLinkText}>Calculate PCI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sidebarLink}>
                    <Text style={styles.sidebarLinkText}>Calculate Budget</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sidebarLink}>
                    <Text style={styles.sidebarLinkText}>Contact Us</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sidebarLink}
                    onPress={() => {
                      toggleSidebar();
                      navigation.navigate("FAQ");
                    }}
                  >
                    <Text style={styles.sidebarLinkText}>FAQ</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>

          {/* Main Content */}
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                Development of Prediction Model for{" "}
                <Text style={{ color: colors.accent }}>PMGSY Roads</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Advanced predictive analytics for rural road maintenance
                planning using Markov Chain modeling
              </Text>
            </View>

            {/* Wrapped padded content */}
            <View style={styles.paddedContent}>
              {/* About Project Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>About Our Project</Text>
                <Text style={styles.cardText}>
                  Our project focuses on developing a software tool for
                  predicting the condition of rural roads under the Pradhan
                  Mantri Gram Sadak Yojana (PMGSY) program.
                </Text>

                <View style={styles.statsContainer}>
                  <StatCard value="70" label="Road Sections Analyzed" />
                  <StatCard value="279.3 km" label="Total Road Length" />
                  <StatCard value="10" label="Year Prediction" />
                  <StatCard value="3+" label="Maintenance Strategies" />
                </View>
              </View>

              {/* Grid Cards */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Project Objectives</Text>
                <View style={styles.featureList}>
                  {[
                    "Assess the condition of PMGSY roads visual surveys and PCI rating",
                    "Predict future road conditions using Markov Chain modeling",
                    "Develop a decision support system for maintenance planning",
                    "Optimize resources and extend rural road lifespan",
                  ].map((item, index) => (
                    <View key={index} style={styles.listItem}>
                      <FontAwesome
                        name="circle"
                        size={8}
                        color={colors.accent}
                        style={styles.bulletIcon}
                      />
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Why Project Matters Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Why This Project Matters</Text>
                <Text style={styles.cardText}>
                  Rural roads are vital for economic growth and connectivity.
                  While PMGSY has improved access, maintaining these roads
                  remains a challenge due to limited resources. Our model helps:
                </Text>

                <View style={styles.featureList}>
                  {[
                    "Identify roads needing attention",
                    "Plan proactive maintenance",
                    "Use budgets more effectively",
                    "Improve safety and longevity",
                  ].map((item, index) => (
                    <View key={index} style={styles.listItem}>
                      <FontAwesome
                        name="circle"
                        size={8}
                        color={colors.accent}
                        style={styles.bulletIcon}
                      />
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <Text style={[styles.cardText, { marginTop: 10 }]}>
                  The right treatment at the right time can cut costs and boost
                  long-term performance.
                </Text>
              </View>

              {/* Team Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Our Team</Text>

                <View>
                  <TeamMember name="Vaishnavi C R" id="4JN22CV030" />
                  <TeamMember name="Usha S K" id="4JN22CV029" />
                  <TeamMember name="Shriraksha" id="4JN22CV024" />
                </View>
                <View>
                  <TeamMember name="Sinchana N" id="4JN22CV025" />
                  <TeamMember
                    name="Prathamesh V"
                    id="4JN22CS114"
                    role="Developer"
                  />
                </View>

                <Text style={[styles.cardTitle, { marginTop: 20 }]}>
                  Under the guidance of
                </Text>
                <View style={styles.teamMember}>
                  <View
                    style={[
                      styles.teamAvatar,
                      { backgroundColor: colors.primaryDark },
                    ]}
                  >
                    <FontAwesome
                      name="graduation-cap"
                      size={24}
                      color={colors.accent}
                    />
                  </View>
                  <View>
                    <Text style={styles.teamMemberName}>Dr. Arun V</Text>
                    <Text style={styles.teamMemberId}>M.Tech, Ph.D</Text>
                    <Text style={styles.teamMemberRole}>
                      Assistant Professor, {"\n"}Dept. of Civil Engineering,
                      JNNCE
                    </Text>
                  </View>
                </View>
              </View>

              {/* Get Started Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Get Started</Text>
                <Text style={styles.cardText}>
                  Ready to analyze your rural roads? Use our tools to assess
                  current conditions and predict future performance.
                </Text>

                <View style={styles.btnGroup}>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => navigation.navigate("CalculatePCI")}
                  >
                    <Text style={styles.btnPrimaryText}>Calculate PCI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnAccent}>
                    <Text style={styles.btnAccentText}>Estimate Budget</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Floating FAQ Button */}
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => navigation.navigate("FAQ")}
          >
            <FontAwesome name="question" size={24} color={colors.primary} />
            <Text style={styles.floatingButtonText}>FAQ</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

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
  navLogoIcon: {
    width: 50,
    height: 22,
    backgroundColor: colors.accent,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  navLogoIconText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  menuButton: {
    marginLeft: 15,
  },
  headerTitle: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: "bold",
  },
  heroSection: {
    paddingVertical: 40,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  heroTitle: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: 32,
  },
  heroSubtitle: {
    color: colors.textLight,
    fontSize: 16,
    lineHeight: 24,
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
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  statCard: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    width: "48%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.accent,
    marginBottom: 5,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureList: {
    marginLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: 6,
  },
  listText: {
    color: colors.textLight,
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  teamAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 3,
    borderColor: colors.accent,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  teamMemberName: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  teamMemberId: {
    color: colors.textGray,
    fontSize: 14,
    marginBottom: 2,
  },
  teamMemberRole: {
    color: colors.textGray,
    fontSize: 14,
  },
  btnGroup: {
    flexDirection: "row",
    marginTop: 15,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  btnPrimaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  btnAccent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  btnAccentText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "bold",
  },
  sidebar: {
    width: SCREEN_WIDTH * 0.75,
    height: "100%",
    backgroundColor: colors.primaryDark,
    position: "absolute",
    top: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: -5,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  sidebarHeader: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    elevation: 25,
  },
  sidebarLogo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sidebarLogoIcon: {
    width: 50,
    height: 22,
    backgroundColor: colors.accent,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sidebarLogoIconText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  sidebarLogoText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeSidebar: {
    padding: 5,
  },
  sidebarLinks: {
    marginTop: 10,
    backgroundColor: colors.primaryDark,
  },
  sidebarLink: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  sidebarLinkText: {
    color: colors.textLight,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlayTouchable: {
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
});

// Create stack navigator
const Stack = createStackNavigator();

const AppWrapper = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={App} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="CalculatePCI" component={CalculatePCIScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppWrapper;

