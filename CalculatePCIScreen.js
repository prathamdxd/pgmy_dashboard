import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import ViewShot from "react-native-view-shot";
import DateTimePicker from "@react-native-community/datetimepicker";
const colors = {
  primary: "#1e2328",
  primaryDark: "#2a2e34",
  secondary: "#3b3f46",
  accent: "#f5b301",
  accentLight: "#fed053",
  gray: "#52575d",
  light: "#f8f9fa",
  dark: "#212529",
  white: "#ffffff",
  textLight: "#f8f9fa",
};

const getConditionBackgroundColor = (condition) => {
  switch (condition) {
    case "Very Good":
      return "#2ecc71"; // Green
    case "Good":
      return "#27ae60"; // Darker Green
    case "Fair":
      return "#f39c12"; // Orange
    case "Poor":
      return "#e74c3c"; // Red
    case "Very Poor":
      return "#c0392b"; // Dark Red
    case "Failed":
      return "#7f8c8d"; // Gray
    default:
      return "#3b3f46"; // Default (secondary)
  }
};

const CustomScrollView = ({ children, ...props }) => {
  if (Platform.OS === "android") {
    return (
      <ScrollView
        {...props}
        style={[styles.scrollView, props.style]}
        contentContainerStyle={[
          styles.scrollViewContent,
          props.contentContainerStyle,
        ]}
        persistentScrollbar={true}
        indicatorStyle="white"
        scrollIndicatorInsets={{ right: 1 }}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <ScrollView
      {...props}
      indicatorStyle="white"
      scrollIndicatorInsets={{ right: 1 }}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={true}
    >
      {children}
    </ScrollView>
  );
};

const screenWidth = Dimensions.get("window").width;
const MAX_ROADS_PER_CHART = 5;

const CalculatePCIScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [year1, setYear1] = useState("");
  const [year2, setYear2] = useState("");
  const [numRoads, setNumRoads] = useState("1");
  const [roads, setRoads] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelSelectLoading, setExcelSelectLoading] = useState(false);
  const [roadForms, setRoadForms] = useState([]);
  const [currentScreen, setCurrentScreen] = useState("userInfo");
  const [showLineCharts, setShowLineCharts] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;

  // Refs
  const resultsScrollViewRef = useRef();
  const inputScrollViewRef = useRef();
  const analyzeButtonRef = useRef();
  const lineChartRefs = useRef([]);
  const pieChartRefs = useRef([]);

  const [surveyDate, setSurveyDate] = useState(null); // Change from new Date() to null
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [yearError, setYearError] = useState("");
  // Add this function
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSurveyDate(selectedDate);
    }
  };
  // PCI Dataset
  const pciDataset = {
    "4-4": { 2: 56.32, 4: 42.58, 6: 31.08, 8: 22.84, 10: 17.49 },
    "3-3": { 2: 40.74, 4: 28.94, 6: 21.03, 8: 16.2, 10: 13.4 },
    "4-3": { 2: 40.74, 4: 28.94, 6: 21.03, 8: 16.2, 10: 13.4 },
    "5-5": { 2: 68.35, 4: 54.04, 6: 40.73, 8: 29.91, 10: 22.18 },
    "5-4": { 2: 56.32, 4: 42.58, 6: 31.08, 8: 22.84, 10: 17.49 },
    "2-1": { 2: 10.0, 4: 10.0, 6: 10.0, 8: 10.0, 10: 10.0 },
    "3-2": { 2: 18.37, 4: 13.51, 6: 11.47, 8: 10.61, 10: 10.26 },
    "1-1": { 2: 10.0, 4: 10.0, 6: 10.0, 8: 10.0, 10: 10.0 },
    "2-2": { 2: 18.37, 4: 13.51, 6: 11.47, 8: 10.61, 10: 10.26 },
  };

  // Animate screen transitions
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentScreen]);

  // Scroll to top when results screen is shown
  useEffect(() => {
    if (currentScreen === "results" && resultsScrollViewRef.current) {
      setTimeout(() => {
        resultsScrollViewRef.current.scrollTo({ y: 0, animated: true });
      }, 100);
    }
  }, [currentScreen, results]);

  // Scroll to analyze button after Excel upload

  // Animate modal
  const animateModal = (show) => {
    Animated.timing(modalSlideAnim, {
      toValue: show ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Function to capture and share graph
  const captureAndShareGraph = async (ref, name) => {
    try {
      if (ref && ref.current) {
        const uri = await ref.current.capture();
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: `Share ${name}`,
          UTI: "public.jpeg",
        });
      }
    } catch (error) {
      console.error("Error capturing graph:", error);
      Alert.alert("Error", "Failed to save graph image");
    }
  };

  // Excel Upload Handler
  const uploadExcel = async () => {
    try {
      setExcelSelectLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });

      if (result.type === "cancel") {
        setExcelSelectLoading(false);
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error("No file selected");
      }

      const file = result.assets[0];
      if (!file.uri) {
        throw new Error("File URI is invalid");
      }

      setExcelSelectLoading(false);
      setExcelLoading(true);

      const fileUri = file.uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileContent, { type: "base64" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const requiredColumns = [
        "roadname",
        `pcivalue_${year1}`,
        `pcivalue_${year2}`,
      ];
      const sampleRow = jsonData[0] || {};
      const missingColumns = requiredColumns.filter(
        (col) => !(col in sampleRow)
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(", ")}`
        );
      }

      const forms = jsonData.map((item, index) => ({
        id: index,
        roadName: item.roadname || "",
        pciYear1: item[`pcivalue_${year1}`]
          ? item[`pcivalue_${year1}`].toString()
          : "",
        pciYear2: item[`pcivalue_${year2}`]
          ? item[`pcivalue_${year2}`].toString()
          : "",
      }));

      setRoadForms(forms);
      setNumRoads(forms.length.toString());

      // Scroll to analyze button only after Excel upload
      if (inputScrollViewRef.current) {
        setTimeout(() => {
          inputScrollViewRef.current.scrollToEnd({ animated: true });
        }, 350);
      }

      Alert.alert("Success", "Excel data loaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to process Excel file");
    } finally {
      setExcelSelectLoading(false);
      setExcelLoading(false);
    }
  };

  const createRoadForms = () => {
    const num = parseInt(numRoads);
    if (isNaN(num) || num < 1) {
      Alert.alert("Error", "Please enter a valid number of roads (at least 1)");
      return;
    }

    const forms = [];
    for (let i = 0; i < num; i++) {
      forms.push({
        id: i,
        roadName: "",
        pciYear1: "",
        pciYear2: "",
      });
    }

    setRoadForms(forms);

    // No scrolling here
  };

  const handleRoadInputChange = (index, field, value) => {
    const updatedForms = [...roadForms];
    updatedForms[index][field] = value;
    setRoadForms(updatedForms);
  };

  const predictPCIs = (roads) => {
    const yearGap = parseInt(year2) - parseInt(year1);
    const startYear = parseInt(year2);
    const predictionYears = Array.from(
      { length: 5 },
      (_, i) => startYear + (i + 1) * yearGap
    );

    return {
      roads: roads.map((road) => {
        const key = `${road.pciYear1}-${road.pciYear2}`;
        const predictions =
          pciDataset[key] || getDefaultPrediction(road.pciYear2);

        return {
          name: road.roadName,
          pci_year2: road.pciYear2,
          projections: Object.fromEntries(
            predictionYears.map((year, idx) => {
              const yearDiff = year - startYear;
              const pciValue =
                predictions[yearDiff] || predictions[10] * (10 / yearDiff);
              return [
                year,
                {
                  pci: pciValue,
                  condition: classifyPCI(pciValue),
                },
              ];
            })
          ),
        };
      }),
      years: predictionYears,
    };
  };

  const getDefaultPrediction = (currentPCI) => {
    const baseValue = currentPCI * 20;
    return {
      2: baseValue * 0.9,
      4: baseValue * 0.75,
      6: baseValue * 0.6,
      8: baseValue * 0.45,
      10: baseValue * 0.3,
    };
  };

  const classifyPCI = (value) => {
    if (value > 85) return "Very Good";
    if (value > 65) return "Good";
    if (value > 50) return "Fair";
    if (value > 25) return "Poor";
    if (value > 10) return "Very Poor";
    return "Failed";
  };

  const getBadgeStyle = (condition) => {
    switch (condition) {
      case "Very Good":
        return styles.badgeVeryGood;
      case "Good":
        return styles.badgeGood;
      case "Fair":
        return styles.badgeFair;
      case "Poor":
        return styles.badgePoor;
      case "Very Poor":
        return styles.badgeVeryPoor;
      case "Failed":
        return styles.badgeFailed;
      default:
        return {};
    }
  };

  const saveUserInfo = () => {
    if (!userName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!surveyDate) {
      Alert.alert("Error", "Please select survey date");
      return;
    }

    if (!year1 || isNaN(year1) || !year2 || isNaN(year2)) {
      Alert.alert("Error", "Please enter valid years");
      return;
    }

    const year1Num = parseInt(year1);
    const year2Num = parseInt(year2);

    // Validate exact 2-year difference
    if (year2Num !== year1Num + 2) {
      Alert.alert(
        "Invalid Year Gap",
        `Year 2 must be exactly 2 years after Year 1.\nExample: If Year 1 is ${year1Num}, Year 2 should be ${
          year1Num + 2
        }`
      );
      return;
    }

    setCurrentScreen("input");
  };

  const analyzeRoads = async () => {
    for (let i = 0; i < roadForms.length; i++) {
      const form = roadForms[i];
      if (!form.roadName.trim()) {
        Alert.alert("Error", `Please enter a road name for Road ${i + 1}`);
        return;
      }

      if (!form.pciYear1 || isNaN(form.pciYear1)) {
        Alert.alert(
          "Error",
          `Please enter a valid PCI ${year1} value for Road ${i + 1}`
        );
        return;
      }

      if (!form.pciYear2 || isNaN(form.pciYear2)) {
        Alert.alert(
          "Error",
          `Please enter a valid PCI ${year2} value for Road ${i + 1}`
        );
        return;
      }

      const pciYear1 = parseInt(form.pciYear1);
      const pciYear2 = parseInt(form.pciYear2);

      if (pciYear1 < 1 || pciYear1 > 5 || pciYear2 < 1 || pciYear2 > 5) {
        Alert.alert(
          "Error",
          `PCI values must be between 1 and 5 for Road ${i + 1}`
        );
        return;
      }
    }

    setLoading(true);

    const roadsData = roadForms.map((form) => ({
      roadName: form.roadName,
      pciYear1: parseInt(form.pciYear1),
      pciYear2: parseInt(form.pciYear2),
    }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const results = predictPCIs(roadsData);
    setResults(results);
    setLoading(false);
    setCurrentScreen("results");
  };

  const downloadCSV = async () => {
    if (!results) return;

    const formattedDate = surveyDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    let csvContent = `Surveyor Name:,${userName}\n`;
    csvContent += `Survey Date:,${formattedDate}\n\n`;

    // Create header row
    csvContent += `Road Name,PCI ${year2}`;
    results.years.forEach((year) => {
      csvContent += `,PCI ${year}`;
    });
    csvContent += "\n";

    // Add data rows with PCI values and conditions
    results.roads.forEach((road) => {
      csvContent += `${road.name},${road.pci_year2}(${classifyPCI(
        road.pci_year2 * 20
      )})`;

      results.years.forEach((year) => {
        const pciValue = road.projections[year].pci.toFixed(2);
        const condition = road.projections[year].condition;
        csvContent += `,${pciValue}(${condition})`;
      });

      csvContent += "\n";
    });

    const fileUri =
      FileSystem.documentDirectory + "rural_roads_pci_analysis.csv";
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Share PCI Analysis Results",
      UTI: "public.comma-separated-values-text",
    });
  };

  const renderUserInfoScreen = () => (
    <Animated.View
      style={[
        styles.userInfoContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        <Text
          style={[
            styles.cardTitle,
            {
              color: colors.accent,
              borderRadius: 5,
            },
          ]}
        >
          Enter Your Information
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Name:</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Survey Date:</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={surveyDate ? styles.dateText : styles.placeholderText}>
              {surveyDate
                ? surveyDate.toLocaleDateString("en-GB")
                : "Enter survey date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={surveyDate || new Date()} // Fallback to current date if null
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Year (e.g., 2025):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={year1}
            onChangeText={setYear1}
            placeholder="Enter first year (e.g., 2025)"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Second Year (must be {year1 ? parseInt(year1) + 2 : "Year 2027"}):
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={year2}
            onChangeText={setYear2}
            placeholder={`Enter ${year1 ? parseInt(year1) + 2 : "Year 2027"}`}
            placeholderTextColor="#999"
          />
          {yearError ? <Text style={styles.errorText}>{yearError}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={saveUserInfo}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: colors.accent }]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  useEffect(() => {
    if (year1 && year2) {
      const year1Num = parseInt(year1);
      const year2Num = parseInt(year2);

      if (year2Num !== year1Num + 2) {
        setYearError(`Year 2 must be ${year1Num + 2}`);
      } else {
        setYearError("");
      }
    } else {
      setYearError("");
    }
  }, [year1, year2]);
  const renderInputScreen = () => (
    <Animated.ScrollView
      ref={inputScrollViewRef}
      contentContainerStyle={[styles.scrollContainer, { paddingBottom: 30 }]}
      showsVerticalScrollIndicator={true}
      scrollEventThrottle={16}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      indicatorStyle="white"
      scrollIndicatorInsets={{ right: 1 }}
    >
      <View style={styles.paddedContent}>
        <View style={[styles.card, { marginTop: 10 }]}>
          <Text style={[styles.cardTitle, { color: colors.accent }]}>
            PCI Calculator
          </Text>
          <Text style={styles.userInfoText}>
            Surveyor: {userName} | Years: {year1} and {year2}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Excel File:</Text>
            <Text style={styles.helperText}>
              Required columns: roadname, pcivalue_{year1}, pcivalue_{year2}
            </Text>
            <TouchableOpacity
              style={styles.excelButton}
              onPress={uploadExcel}
              disabled={excelLoading || excelSelectLoading}
              activeOpacity={0.7}
            >
              {excelSelectLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.excelButtonText}>Select Excel File</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <Text style={[styles.label, { textAlign: "center" }]}>
              Or enter manually:
            </Text>
            <Text style={styles.label}>Number of roads:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={numRoads}
              onChangeText={setNumRoads}
              placeholder="Enter number of roads"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={createRoadForms}
            disabled={loading || excelLoading || excelSelectLoading}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.accent }]}>
              Create Forms
            </Text>
          </TouchableOpacity>

          {roadForms.map((form, index) => (
            <Animated.View
              key={index}
              style={[
                styles.roadForm,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.accent }]}>
                Road {index + 1} Details
              </Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Road Name:</Text>
                <TextInput
                  style={styles.input}
                  value={form.roadName}
                  onChangeText={(text) =>
                    handleRoadInputChange(index, "roadName", text)
                  }
                  placeholder="Enter road name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>PCI {year1} (1-5):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.pciYear1}
                  onChangeText={(text) =>
                    handleRoadInputChange(index, "pciYear1", text)
                  }
                  placeholder={`Enter PCI (1-5) for ${year1}`}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>PCI {year2} (1-5):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.pciYear2}
                  onChangeText={(text) =>
                    handleRoadInputChange(index, "pciYear2", text)
                  }
                  placeholder={`Enter PCI (1-5) for ${year2}`}
                  placeholderTextColor="#999"
                />
              </View>
            </Animated.View>
          ))}

          {roadForms.length > 0 && (
            <TouchableOpacity
              ref={analyzeButtonRef}
              style={[
                styles.toggleButton,
                { width: "100%", marginBottom: 10, padding: 12 },
              ]}
              onPress={analyzeRoads}
              disabled={loading || excelLoading || excelSelectLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {loading ? "Analyzing..." : "Analyze Roads"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.ScrollView>
  );

  const renderResultsScreen = () => {
    if (!results) return null;

    const colorPalette = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#8AC24A",
      "#FF5733",
      "#5D6D7E",
      "#A569BD",
      "#16A085",
      "#E74C3C",
    ];

    const conditions = [
      "Very Good",
      "Good",
      "Fair",
      "Poor",
      "Very Poor",
      "Failed",
    ];

    const conditionColors = {
      "Very Good": "#2ecc71",
      Good: "#27ae60",
      Fair: "#f39c12",
      Poor: "#e74c3c",
      "Very Poor": "#c0392b",
      Failed: "#7f8c8d",
    };

    // Prepare pie chart data for each year
    const pieCharts = results.years.map((year, index) => {
      const conditionCounts = {};
      const conditionRoads = {};

      conditions.forEach((condition) => {
        conditionCounts[condition] = 0;
        conditionRoads[condition] = [];
      });

      results.roads.forEach((road) => {
        const condition = road.projections[year].condition;
        conditionCounts[condition]++;
        conditionRoads[condition].push(road.name);
      });

      return {
        year,
        data: conditions
          .filter((condition) => conditionCounts[condition] > 0)
          .map((condition) => ({
            name: condition,
            population: conditionCounts[condition],
            color: conditionColors[condition],
            legendFontColor: "#f8f9fa",
            legendFontSize: 12,
            legendFontWeight: "bold",
          })),
        conditionRoads,
      };
    });

    // Initialize pie chart refs
    pieChartRefs.current = Array(pieCharts.length)
      .fill()
      .map((_, i) => pieChartRefs.current[i] || React.createRef());

    // Split roads into chunks for line charts
    const roadChunks = [];
    for (let i = 0; i < results.roads.length; i += MAX_ROADS_PER_CHART) {
      roadChunks.push(results.roads.slice(i, i + MAX_ROADS_PER_CHART));
    }

    // Initialize line chart refs
    lineChartRefs.current = Array(roadChunks.length)
      .fill()
      .map((_, i) => lineChartRefs.current[i] || React.createRef());

    return (
      <Animated.ScrollView
        ref={resultsScrollViewRef}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 30 }]}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        indicatorStyle="white"
        scrollIndicatorInsets={{ right: 1 }}
      >
        <View style={styles.paddedContent}>
          <View style={styles.resultsSection}>
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.accent }]}>
                Analysis Results
              </Text>
              <Text style={styles.userInfoText}>
                Analyst: {userName} | Years: {year1} and {year2}
              </Text>

              <CustomScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                scrollEventThrottle={16}
                indicatorStyle="white"
                scrollIndicatorInsets={{ right: 1 }}
              >
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { width: 100 }]}>
                      Road Name
                    </Text>
                    <Text style={[styles.tableHeaderText, { width: 100 }]}>
                      PCI {year2}
                    </Text>
                    {results.years.map((year) => (
                      <Text
                        key={year}
                        style={[styles.tableHeaderText, { width: 120 }]}
                      >
                        PCI {year}
                      </Text>
                    ))}
                  </View>

                  {results.roads.map((road) => (
                    <View key={road.name} style={styles.tableRow}>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: 120, fontWeight: "bold" },
                        ]}
                      >
                        {road.name}
                      </Text>
                      <Text style={[styles.tableCell, { width: 80 }]}>
                        {road.pci_year2}
                      </Text>
                      {results.years.map((year) => {
                        const condition = road.projections[year].condition;
                        const badgeStyle = getBadgeStyle(condition);
                        return (
                          <View
                            key={year}
                            style={[styles.tableCell, { width: 120 }]}
                          >
                            <Text>
                              {road.projections[year].pci.toFixed(2)}{" "}
                            </Text>
                            <View style={[styles.badge, badgeStyle]}>
                              <Text style={styles.badgeText}>{condition}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </CustomScrollView>

              <View style={styles.resultsActions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={downloadCSV}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, { color: colors.accent }]}>
                    Download Results as CSV
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.toggleChartButton]}
                  onPress={() => setShowLineCharts(!showLineCharts)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>
                    {showLineCharts ? "Hide Line Charts" : "Show Line Charts"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.chartsContainer}>
              {/* Line Charts - Split into chunks */}
              {showLineCharts && (
                <>
                  {roadChunks.map((chunk, chunkIndex) => {
                    const dataGroups = {};
                    chunk.forEach((road) => {
                      const dataKey = [
                        road.pci_year2 * 20,
                        ...results.years.map((year) =>
                          road.projections[year].pci.toFixed(2)
                        ),
                      ].join("|");

                      if (!dataGroups[dataKey]) {
                        dataGroups[dataKey] = {
                          roads: [road.name],
                          data: [
                            road.pci_year2 * 20,
                            ...results.years.map(
                              (year) => road.projections[year].pci
                            ),
                          ],
                        };
                      } else {
                        dataGroups[dataKey].roads.push(road.name);
                      }
                    });

                    const groupedData = Object.values(dataGroups);

                    const lineChartData = {
                      labels: [year2, ...results.years],
                      datasets: groupedData.map((group, index) => ({
                        data: group.data,
                        color: (opacity = 1) => {
                          const hex = colorPalette[index % colorPalette.length];
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        },
                        strokeWidth: 5,
                      })),
                      legend: [],
                    };

                    return (
                      <View key={chunkIndex} style={styles.card}>
                        <Text
                          style={[styles.cardTitle, { color: colors.accent }]}
                        >
                          PCI Trend Over Years ({chunkIndex + 1}/
                          {roadChunks.length})
                        </Text>
                        <Text style={styles.chartSubtitle}>
                          Showing roads {chunkIndex * MAX_ROADS_PER_CHART + 1}-
                          {Math.min(
                            (chunkIndex + 1) * MAX_ROADS_PER_CHART,
                            results.roads.length
                          )}
                        </Text>
                        <ViewShot
                          ref={lineChartRefs.current[chunkIndex]}
                          options={{ format: "jpg", quality: 0.9 }}
                        >
                          <View>
                            <LineChart
                              data={lineChartData}
                              width={screenWidth - 80}
                              height={320}
                              chartConfig={{
                                backgroundColor: colors.white,
                                backgroundGradientFrom: colors.white,
                                backgroundGradientTo: colors.white,
                                decimalPlaces: 2,
                                color: (opacity = 1) =>
                                  `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) =>
                                  `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                  r: "8",
                                  strokeWidth: "3",
                                  stroke: "#ffffff",
                                },
                                propsForLabels: {
                                  fontSize: 10,
                                },
                              }}
                              bezier
                              style={{
                                marginVertical: 1,
                                borderRadius: 16,
                                paddingRight: 70,
                              }}
                              withVerticalLabels={true}
                              withHorizontalLabels={true}
                              fromZero={true}
                              segments={4}
                              xLabelsOffset={-10}
                              yAxisSuffix=""
                              yAxisInterval={1}
                              withInnerLines={true}
                              withOuterLines={true}
                            />
                            <View style={styles.axisTitleContainer}>
                              <Text style={styles.yAxisTitle}>PCI</Text>
                              <Text style={styles.xAxisTitle}>Years</Text>
                            </View>
                          </View>
                        </ViewShot>
                        <View style={styles.legendContainer}>
                          {groupedData.map((group, index) => (
                            <View key={index} style={styles.legendItem}>
                              <View
                                style={[
                                  styles.legendColor,
                                  {
                                    backgroundColor:
                                      colorPalette[index % colorPalette.length],
                                  },
                                ]}
                              />
                              <Text style={styles.legendText}>
                                {group.roads.join(", ")}
                              </Text>
                            </View>
                          ))}
                        </View>
                        <TouchableOpacity
                          style={styles.downloadButton}
                          onPress={() => {
                            captureAndShareGraph(
                              lineChartRefs.current[chunkIndex],
                              `PCI Trend Chart ${chunkIndex + 1}`
                            );
                          }}
                          activeOpacity={0.7}
                        >
                          <FontAwesome
                            name="download"
                            size={16}
                            color="#f5b301"
                          />
                          <Text style={styles.downloadButtonText}>
                            Download as Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </>
              )}

              {/* Pie Charts for Each Year */}
              <View style={styles.card}>
                <Text style={[styles.cardTitle, { color: colors.accent }]}>
                  Condition Distribution by Year
                </Text>

                <CustomScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  scrollEventThrottle={16}
                  indicatorStyle="white"
                  scrollIndicatorInsets={{ right: 1 }}
                >
                  {pieCharts.map((chartData, index) => (
                    <View key={index} style={styles.pieChartContainer}>
                      <ViewShot
                        ref={pieChartRefs.current[index]}
                        options={{ format: "jpg", quality: 0.9 }}
                      >
                        {chartData.data.length > 0 ? (
                          <View style={{ alignItems: "center" }}>
                            <Text style={styles.pieChartTitle}>
                              {chartData.year}
                            </Text>
                            <PieChart
                              data={chartData.data}
                              width={Math.min(screenWidth - 60, 350)}
                              height={220}
                              chartConfig={{
                                backgroundColor: colors.white,
                                backgroundGradientFrom: colors.white,
                                backgroundGradientTo: colors.white,
                                color: (opacity = 1) =>
                                  `rgba(0, 0, 0, ${opacity})`,
                              }}
                              accessor="population"
                              backgroundColor="transparent"
                              paddingLeft="15"
                              absolute
                              hasLegend={true}
                            />
                          </View>
                        ) : (
                          <Text style={styles.noDataText}>
                            No data available for {chartData.year}
                          </Text>
                        )}
                      </ViewShot>

                      <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => {
                          setSelectedChartData(chartData);
                          setShowConditionModal(true);
                          animateModal(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.toggleButtonText}>
                          ⓘ Show Road Details
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() =>
                          captureAndShareGraph(
                            pieChartRefs.current[index],
                            `Condition Distribution ${chartData.year}`
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <FontAwesome
                          name="download"
                          size={16}
                          color="#f5b301"
                        />
                        <Text style={styles.downloadButtonText}>
                          Download as Image
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </CustomScrollView>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.accent }]}>
                PCI Condition Guide
              </Text>
              <CustomScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                scrollEventThrottle={16}
                indicatorStyle="white"
                scrollIndicatorInsets={{ right: 1 }}
              >
                <View
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    width: "100%",
                  }}
                >
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { width: 100 }]}>
                      PCI Range
                    </Text>
                    <Text style={[styles.tableHeaderText, { width: 100 }]}>
                      Condition
                    </Text>
                    <Text style={[styles.tableHeaderText, { width: 200 }]}>
                      Recommended Action
                    </Text>
                  </View>

                  {[
                    {
                      range: "85-100",
                      condition: "Very Good",
                      action: "Preventive maintenance only",
                      style: styles.veryGood,
                    },
                    {
                      range: "65-85",
                      condition: "Good",
                      action: "Minor rehabilitation",
                      style: styles.good,
                    },
                    {
                      range: "50-65",
                      condition: "Fair",
                      action: "Moderate rehabilitation",
                      style: styles.fair,
                    },
                    {
                      range: "25-50",
                      condition: "Poor",
                      action: "Major rehabilitation",
                      style: styles.poor,
                    },
                    {
                      range: "10-25",
                      condition: "Very Poor",
                      action: "Reconstruction needed",
                      style: styles.veryPoor,
                    },
                    {
                      range: "0-10",
                      condition: "Failed",
                      action: "Immediate reconstruction",
                      style: styles.failed,
                    },
                  ].map((item, index) => (
                    <View key={index} style={[styles.tableRow, item.style]}>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: 100, color: "#f8f9fa", fontWeight: "bold" },
                        ]}
                      >
                        {item.range}
                      </Text>
                      <View style={[styles.tableCell, { width: 100 }]}>
                        <View
                          style={[styles.badge, getBadgeStyle(item.condition)]}
                        >
                          <Text style={styles.badgeText}>{item.condition}</Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: 200, color: "#f8f9fa", fontWeight: "bold" },
                        ]}
                      >
                        {item.action}
                      </Text>
                    </View>
                  ))}
                </View>
              </CustomScrollView>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} />
      <ImageBackground
        source={require("./assets/img1.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (currentScreen === "results") {
                setCurrentScreen("input");
              } else if (currentScreen === "input") {
                setCurrentScreen("userInfo");
              } else {
                navigation.goBack();
              }
            }}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={24} color="#f5b301" />
          </TouchableOpacity>
          <View style={[styles.headerContent, { paddingRight: 20 }]}>
            <Text style={styles.headerTitle}>
              {currentScreen === "userInfo"
                ? "User Information"
                : currentScreen === "input"
                ? "Calculate PCI"
                : "Analysis Results"}
            </Text>
          </View>
        </View>

        {currentScreen === "userInfo"
          ? renderUserInfoScreen()
          : currentScreen === "input"
          ? renderInputScreen()
          : renderResultsScreen()}

        {/* Condition Details Modal */}
        <Modal
          visible={showConditionModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            animateModal(false);
            setTimeout(() => setShowConditionModal(false), 300);
          }}
          onShow={() => animateModal(true)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ translateY: modalSlideAnim }] },
              ]}
            >
              <Text style={styles.modalTitle}>
                Condition Breakdown - {selectedChartData?.year}
              </Text>

              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                {selectedChartData?.conditionRoads &&
                  Object.entries(selectedChartData.conditionRoads)
                    .filter(([condition, roads]) => roads.length > 0)
                    .map(([condition, roads]) => {
                      const backgroundColor =
                        getConditionBackgroundColor(condition);

                      return (
                        <View
                          key={condition}
                          style={styles.modalConditionGroup}
                        >
                          <View
                            style={[
                              styles.modalConditionHeader,
                              { backgroundColor },
                            ]}
                          >
                            <Text style={styles.modalConditionTitle}>
                              {condition} ({roads.length})
                            </Text>
                          </View>

                          <View style={styles.modalRoadListScroll}>
                            <View style={styles.modalRoadList}>
                              {roads.map((road, idx) => (
                                <Text
                                  key={idx}
                                  style={styles.modalRoadListItem}
                                >
                                  ✦ {road}
                                </Text>
                              ))}
                            </View>
                          </View>
                        </View>
                      );
                    })}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  animateModal(false);
                  setTimeout(() => setShowConditionModal(false), 300);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Excel File Selection Loading Modal */}
        <Modal visible={excelSelectLoading} transparent>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Selecting file...</Text>
            </View>
          </View>
        </Modal>

        {/* Excel Processing Loading Modal */}
        <Modal visible={excelLoading} transparent>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Processing Excel file...</Text>
            </View>
          </View>
        </Modal>

        {/* Analysis Loading Modal */}
        <Modal visible={loading} transparent>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Analyzing road data...</Text>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    zIndex: 1,
  },
  menuButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  paddedContent: {
    paddingHorizontal: 15,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  userInfoText: {
    fontSize: 14,
    color: colors.accentLight,
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "rgba(37, 42, 50, 0.9)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#252a32",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    color: "#f8f9fa",
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#f8f9fa",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(54, 63, 77, 1)",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: "#1e2328",
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  excelButton: {
    backgroundColor: "#21a366",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginBottom: 5,
    justifyContent: "center",
    minHeight: 44,
  },
  excelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: "#dadadaff",
    fontStyle: "italic",
    marginTop: 5,
    marginBottom: 10,
  },
  divider: {
    height: 2,
    backgroundColor: "#f5b301",
    marginVertical: 15,
  },
  button: {
    backgroundColor: "rgba(54, 63, 77, 1)",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginBottom: 15,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  toggleChartButton: {
    backgroundColor: colors.accent,
    width: "58%",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  roadForm: {
    backgroundColor: "rgba(26, 30, 35, 0.7)",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#f5b301",
  },
  resultsSection: {
    marginTop: 20,
  },
  resultsActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffbf5c",
    padding: 10,
  },
  tableHeaderText: {
    fontWeight: "600",
    color: "#1e2328",
    fontSize: 14,
    textTransform: "uppercase",
  },
  tableRow: {
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    padding: 10,
    borderColor: "#1e2328",
    borderBottomWidth: 1,
    overflow: "hidden",
    borderBottomColor: "#ffbf5c",
  },
  tableCell: {
    padding: 5,
    justifyContent: "center",
  },
  table: {
    borderColor: "#ffbf5c",
    borderWidth: 3,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  badge: {
    padding: 5,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  badgeVeryGood: { backgroundColor: "#2ecc71" },
  badgeGood: { backgroundColor: "#27ae60" },
  badgeFair: { backgroundColor: "#ffa71aff" },
  badgePoor: { backgroundColor: "#f75644ff" },
  badgeVeryPoor: { backgroundColor: "#ce4031ff" },
  badgeFailed: { backgroundColor: "#919e9fff" },
  veryGood: { backgroundColor: "rgba(40, 190, 103, 0.9)" },
  good: { backgroundColor: "rgba(31, 138, 75, 0.9)" },
  fair: { backgroundColor: "rgba(198, 130, 21, 0.9)" },
  poor: { backgroundColor: "rgba(197, 66, 52, 0.9)" },
  veryPoor: { backgroundColor: "rgba(169, 50, 37, 0.9)" },
  failed: { backgroundColor: "rgba(107, 118, 119, 0.9)" },
  chartsContainer: {
    marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    backgroundColor: colors.primaryDark,
    padding: 30,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  loadingText: {
    marginTop: 10,
    color: colors.white,
  },
  downloadButton: {
    backgroundColor: "#3b3f46",
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  downloadButtonText: {
    color: "#f5b301",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    color: "#f8f9fa",
    fontSize: 12,
  },
  pieChartContainer: {
    marginRight: 20,
    alignItems: "center",
    width: screenWidth - 60,
  },
  pieChartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    color: "#f8f9fa",
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    color: "#f8f9fa",
    fontStyle: "italic",
  },
  toggleButton: {
    padding: 10,
    backgroundColor: colors.accent,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    width: "53%",
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  toggleButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  chartSubtitle: {
    textAlign: "center",
    marginBottom: 10,
    color: "#f8f9fa",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.accent,
  },
  modalScrollView: {
    maxHeight: "80%",
  },
  modalConditionGroup: {
    marginBottom: 15,
  },
  modalConditionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  modalConditionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8f9fa",
  },
  modalRoadListScroll: {
    backgroundColor: "#f8e0a0ff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
  },
  modalRoadList: {
    marginLeft: 10,
  },
  modalRoadListItem: {
    fontSize: 14,
    paddingVertical: 4,
    color: colors.primaryDark,
    fontWeight: "bold",
  },
  modalCloseButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    paddingVertical: 12,
    top: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  modalCloseButtonText: {
    color: colors.accent,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  axisTitleContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  yAxisTitle: {
    position: "absolute",
    left: 5,
    top: "45%",
    transform: [{ rotate: "-90deg" }],
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e2328",
  },
  xAxisTitle: {
    position: "absolute",
    bottom: 15,
    left: "45%",
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e2328",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  androidScrollbar: {
    width: 1,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  dateInput: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(54, 63, 77, 1)",
    borderRadius: 6,
    padding: 12,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#1e2328",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999", // Gray color for placeholder
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 5,
  },
});

export default CalculatePCIScreen;
