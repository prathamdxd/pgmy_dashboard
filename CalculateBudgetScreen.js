import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView as VerticalScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView as HorizontalScrollView,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";
import { captureRef } from "react-native-view-shot";

const { width: screenWidth } = Dimensions.get("window");

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
  success: "#21a366",
  danger: "#dc3545",
  info: "#17a2b8",
};

const infoContent = {
  unlimited:
    'Unlimited Budget Scenario assumes you can perform all necessary maintenance and rehabilitation work without budget constraints. This includes routine maintenance, minor and major rehabilitation, and complete reconstruction as needed.\n\n"👆Swipe left on table to view other table content".',
  fairCondition:
    'Fair Condition Scenario focuses on maintaining roads in fair or better condition (PCI 3+). It excludes reconstruction and only performs maintenance and rehabilitation work when needed to keep roads above PCI 3.\n\n "👆Swipe left on table to view other table content".',
  routineOnly:
    'Routine Only Scenario limits work to routine maintenance only. No rehabilitation or reconstruction is performed, which may lead to faster deterioration of road conditions over time.\n\n"👆Swipe left on table to view other table content".',
  limited:
    'Limited Budget Scenario represents the minimum maintenance strategy, focusing only on routine maintenance for roads in PCI 4 condition. This is the most budget-constrained approach.\n\n"👆Swipe left on table to view other table content".',
  chart:
    "This chart compares the total budget requirements across different scenarios. Values are in million INR. Hover over bars to see exact values for each year and scenario.",
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
    paddingHorizontal: 10,
    marginTop: 10,
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
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    padding: 15,
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    top: 5,
  },
  cardText: {
    color: colors.textLight,
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.textLight,
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(23, 27, 33, 1)",
    color: colors.textLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
    width: "80%",
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  excelButton: {
    backgroundColor: "#21a366",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginBottom: 5,
    justifyContent: "center",
    minHeight: 44,
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    width: "80%",
  },
  excelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  exportButton: {
    backgroundColor: colors.info,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  downloadButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  helperText: {
    fontSize: 12,
    color: colors.textGray,
    fontStyle: "italic",
    marginBottom: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  webviewContainer: {
    height: 450,
    width: "100%",
    backgroundColor: "white",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableContainer: {
    marginBottom: 20,
  },
  tableTitle: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableScrollView: {
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    backgroundColor: "#a0a8b0",
    padding: 8,
    width: 100,
    color: colors.textDark,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: "white",
  },
  tableCell: {
    padding: 8,
    width: 100,
    backgroundColor: colors.primaryDark,
    color: colors.textLight,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  conditionCell: {
    width: 150,
    textAlign: "left",
  },
  tableTotalRow: {
    backgroundColor: colors.success,
    fontWeight: "bold",
  },
  infoIcon: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    padding: 20,
    borderRadius: 10,
    width: "80%",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalText: {
    color: colors.textLight,
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
  },
  modalCloseButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  modalCloseText: {
    color: colors.textDark,
    fontWeight: "bold",
  },
});

const CalculateBudgetScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [year1, setYear1] = useState("");
  const [year2, setYear2] = useState("");
  const [fileUri, setFileUri] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [chartHtml, setChartHtml] = useState("");
  const [tables, setTables] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [scenarioNames] = useState([
    "Unlimited Budget Scenario",
    "Fair Condition Scenario",
    "Routine Only Scenario",
    "Limited Budget Scenario",
  ]);
  const webviewRef = React.useRef();

  const showInfo = (contentKey) => {
    setModalContent(infoContent[contentKey]);
    setModalVisible(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });

      if (result.type === "cancel") {
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error("No file selected");
      }

      const file = result.assets[0];
      if (!file.uri) {
        throw new Error("File URI is invalid");
      }

      setFileUri(file.uri);
      setFileName(file.name);
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
      console.error(err);
    }
  };

  const processExcelFile = async () => {
    if (!fileUri) {
      Alert.alert("Error", "Please select an Excel file first");
      return;
    }

    if (!year1 || !year2) {
      Alert.alert("Error", "Please enter both years first");
      return;
    }

    if (parseInt(year2) !== parseInt(year1) + 2) {
      Alert.alert(
        "Error",
        "Second year must be exactly 2 years after first year"
      );
      return;
    }

    try {
      setExcelLoading(true);

      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileContent, { type: "base64" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Define required columns
      const requiredColumns = {
        roadName: "roadname",
        roadLength: "road_length",
        pciYear1: `pci_${year1}`,
        pciYear2: `pci_${year2}`,
      };

      // Check if required columns exist in the sheet (case insensitive)
      const sampleRow = jsonData[0] || {};
      const availableColumns = Object.keys(sampleRow);

      // Find actual column names (case insensitive match)
      const actualColumns = {};
      let allColumnsFound = true;
      const missingColumns = [];

      for (const [key, colName] of Object.entries(requiredColumns)) {
        const foundCol = availableColumns.find(
          (c) => c.toLowerCase() === colName.toLowerCase()
        );

        if (foundCol) {
          actualColumns[key] = foundCol;
        } else {
          allColumnsFound = false;
          missingColumns.push(colName);
        }
      }

      if (!allColumnsFound) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(", ")}`
        );
      }

      // Process data using the actual column names found in the sheet
      const processedData = jsonData.map((row) => ({
        road_name: row[actualColumns.roadName],
        road_length: parseFloat(row[actualColumns.roadLength]) || 0,
        pci_year1: parseFloat(row[actualColumns.pciYear1]) || 0,
        pci_year2: parseFloat(row[actualColumns.pciYear2]) || 0,
      }));

      const weightedTable = generatePciAnalysis(processedData, year1, year2);
      const derivativeTables = createDerivativeTables(weightedTable);

      setTables(derivativeTables);
      generateChartHtml(derivativeTables, year2);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      Alert.alert(
        "Error",
        error.message ||
          "Failed to process Excel file. Please check the format and ensure all required columns are present."
      );
    } finally {
      setExcelLoading(false);
    }
  };

  const generatePciAnalysis = (data, year1, year2) => {
    const pciStates = [5, 4, 3, 2, 1];
    const lengthCol = "road_length";
    const pciCol1 = "pci_year1";
    const pciCol2 = "pci_year2";

    const df = data;
    const totalRoadLength = df.reduce(
      (sum, row) => sum + (row[lengthCol] || 0),
      0
    );

    const transitionCounts = {};
    const stateVectorLength = {};
    pciStates.forEach((state) => {
      transitionCounts[state] = {};
      pciStates.forEach((s) => (transitionCounts[state][s] = 0));
      stateVectorLength[state] = 0;
    });

    df.forEach((row) => {
      const pci1 = row[pciCol1];
      const pci2 = row[pciCol2];
      const length = row[lengthCol] || 0;

      if (
        pci1 !== undefined &&
        pci2 !== undefined &&
        !isNaN(pci1) &&
        !isNaN(pci2)
      ) {
        transitionCounts[pci1][pci2] += 1;
        stateVectorLength[pci2] += length;
      }
    });

    const transitionProbs = {};
    pciStates.forEach((state) => {
      transitionProbs[state] = {};
      const rowTotal = pciStates.reduce(
        (sum, s) => sum + transitionCounts[state][s],
        0
      );

      pciStates.forEach((s) => {
        transitionProbs[state][s] =
          rowTotal > 0 ? transitionCounts[state][s] / rowTotal : 0;
      });
    });

    const transitionMatrix = pciStates.map((state) =>
      pciStates.map((s) => transitionProbs[state][s])
    );

    const totalLength = pciStates.reduce(
      (sum, state) => sum + stateVectorLength[state],
      0
    );
    const stateVectorProbs = pciStates.map(
      (state) => stateVectorLength[state] / totalLength
    );

    const projectionsKm = {};
    let currentVector = [...stateVectorProbs];
    projectionsKm[year2] = currentVector.map((val) => val * totalRoadLength);

    for (let i = 1; i <= 5; i++) {
      const nextYear = parseInt(year2) + 2 * i;
      currentVector = matrixVectorMultiply(transitionMatrix, currentVector);
      projectionsKm[nextYear] = currentVector.map(
        (val) => val * totalRoadLength
      );
    }

    const projectionTable = {
      rows: [
        "5 (No Maintenance)",
        "4 (Routine maintenance)",
        "3 (Minor Rehabilitation)",
        "2 (Major Rehabilitation)",
        "1 (Reconstruction)",
        "Total",
      ],
      columns: Object.keys(projectionsKm).map(
        (year) => `year ${parseInt(year)}`
      ),
      data: [],
    };

    const multipliers = {
      5: 0,
      4: 100000,
      3: 1000000,
      2: 2000000,
      1: 4500000,
    };

    pciStates.forEach((state, idx) => {
      const rowData = Object.values(projectionsKm).map((yearData) => {
        return (yearData[idx] * multipliers[state]) / 1000000;
      });
      projectionTable.data.push(rowData);
    });

    const totalRow = projectionTable.columns.map((_, colIdx) => {
      return projectionTable.data.reduce((sum, row) => sum + row[colIdx], 0);
    });
    projectionTable.data.push(totalRow);

    return projectionTable;
  };

  const matrixVectorMultiply = (matrix, vector) => {
    return matrix[0].map((_, colIdx) => {
      return matrix.reduce(
        (sum, row, rowIdx) => sum + row[colIdx] * vector[rowIdx],
        0
      );
    });
  };

  const createDerivativeTables = (unlimitedBudgetTable) => {
    const table1 = JSON.parse(JSON.stringify(unlimitedBudgetTable));

    const table2 = JSON.parse(JSON.stringify(unlimitedBudgetTable));
    table2.data[0] = table2.data[0].map(() => 0);
    table2.data[1] = table2.data[1].map(() => 0);
    table2.data[5] = table2.columns.map((_, colIdx) => {
      return table2.data.slice(2, 5).reduce((sum, row) => sum + row[colIdx], 0);
    });

    const table3 = JSON.parse(JSON.stringify(unlimitedBudgetTable));
    table3.data[3] = table3.data[3].map(() => 0);
    table3.data[4] = table3.data[4].map(() => 0);
    table3.data[5] = table3.columns.map((_, colIdx) => {
      return table3.data.slice(0, 3).reduce((sum, row) => sum + row[colIdx], 0);
    });

    const table4 = JSON.parse(JSON.stringify(unlimitedBudgetTable));
    table4.data[0] = table4.data[0].map(() => 0);
    table4.data[2] = table4.data[2].map(() => 0);
    table4.data[3] = table4.data[3].map(() => 0);
    table4.data[4] = table4.data[4].map(() => 0);
    table4.data[5] = table4.columns.map((_, colIdx) => {
      return table4.data[1][colIdx];
    });

    return [table1, table2, table3, table4];
  };

  const generateChartHtml = (tables, baseYear) => {
    const scenarios = [
      "Unlimited",
      "Fair Condition",
      "Routine Only",
      "Limited",
    ];
    const years = tables[0].columns.map((col) => col.replace("year ", ""));

    const datasets = scenarios.map((scenario, i) => {
      const color = getColorForScenario(i);
      return {
        label: scenario,
        data: tables[i].data[tables[i].data.length - 1], // Get the totals row
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      };
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body, html {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: white;
            }
            .chart-container {
              width: 100%;
              height: 100%;
              padding: 10px;
            }
            canvas {
              width: 100% !important;
              height: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="chart-container">
            <canvas id="budgetChart"></canvas>
          </div>
          <script>
            try {
              document.addEventListener('DOMContentLoaded', function() {
                const container = document.querySelector('.chart-container');
                const canvas = document.getElementById('budgetChart');
                
                // Set explicit dimensions
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                
                // Create chart
                const ctx = canvas.getContext('2d');
                window.chart = new Chart(ctx, {
                  type: 'bar',
                  data: {
                    labels: ${JSON.stringify(years)},
                    datasets: ${JSON.stringify(datasets)}
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Budget Projections Comparison (Base Year: ${baseYear})',
                        font: { size: 16 },
                        padding: { top: 10,}
                      },
                      legend: {
                        position: 'top',
                        labels: { 
                          font: { size: 12 },
                          boxWidth: 12,
                          padding: 10
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toFixed(1) + ' (million INR)';
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Year',
                          font: { size: 14 }
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45
                        }
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Budget (in million INR)',
                          font: { size: 14 }
                        }
                      }
                    }
                  }
                });
              });
            } catch (error) {
              console.error('Chart error:', error);
            }
          </script>
        </body>
      </html>
    `;

    setChartHtml(html);
  };

  const getColorForScenario = (index) => {
    const colors = [
      "rgba(75, 192, 192, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 99, 132, 0.7)",
    ];
    return colors[index % colors.length];
  };

  const exportToExcel = async () => {
    if (tables.length === 0) {
      Alert.alert("Error", "No data to export");
      return;
    }

    try {
      setExportLoading(true);

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Add each table as a separate worksheet
      tables.forEach((table, index) => {
        // Prepare data for the worksheet
        const wsData = [];

        // Add header row
        const headerRow = [
          "Condition",
          ...table.columns.map((col) => col.replace("year ", "")),
        ];
        wsData.push(headerRow);

        // Add data rows
        table.rows.forEach((row, rowIndex) => {
          const rowData = [
            row,
            ...table.data[rowIndex].map((cell) => cell.toFixed(1)),
          ];
          wsData.push(rowData);
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          scenarioNames[index].substring(0, 31)
        );
      });

      // Generate file
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const uri = FileSystem.cacheDirectory + "budget_projections.xlsx";

      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share the file
      await Sharing.shareAsync(uri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Export Budget Projections",
        UTI: "com.microsoft.excel.xlsx",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Alert.alert("Error", "Failed to export data to Excel");
    } finally {
      setExportLoading(false);
    }
  };

  const downloadChart = async () => {
    try {
      const uri = await captureRef(webviewRef, {
        format: "png",
        quality: 1,
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error saving chart:", error);
      Alert.alert("Error", "Failed to save chart image");
    }
  };

  const renderTable = (tableData, index) => {
    const scenarioKeys = [
      "unlimited",
      "fairCondition",
      "routineOnly",
      "limited",
    ];
    return (
      <View style={styles.tableContainer} key={`table-${index}`}>
        <View style={styles.tableTitle}>
          <Text
            style={{
              color: colors.accent,
              fontSize: 20,
              marginLeft: 10,
              fontWeight: "bold",
            }}
          >
            {scenarioNames[index]}
          </Text>
          <TouchableOpacity
            style={styles.infoIcon}
            onPress={() => showInfo(scenarioKeys[index])}
          >
            <FontAwesome5 name="info-circle" size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>
        <View style={styles.tableWrapper}>
          <HorizontalScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            style={styles.tableScrollView}
          >
            <View>
              {/* Header row */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.conditionCell]}>
                  Condition
                </Text>
                {tableData.columns.map((col, colIndex) => (
                  <Text
                    key={`header-${colIndex}`}
                    style={styles.tableHeaderCell}
                  >
                    {col.replace("year ", "")}
                  </Text>
                ))}
              </View>

              {/* Data rows */}
              {tableData.rows.map((row, rowIndex) => (
                <View
                  key={`row-${rowIndex}`}
                  style={[
                    styles.tableRow,
                    rowIndex === tableData.rows.length - 1 &&
                      styles.tableTotalRow,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.conditionCell]}>
                    {row}
                  </Text>
                  {tableData.data[rowIndex].map((cell, cellIndex) => (
                    <Text key={`cell-${cellIndex}`} style={styles.tableCell}>
                      {cell.toFixed(1)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </HorizontalScrollView>
        </View>
      </View>
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
            onPress={() => navigation.goBack()}
            style={styles.menuButton}
          >
            <FontAwesome name="arrow-left" size={24} color="#f5b301" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { marginRight: 100 }]}>
              Calculate Budget
            </Text>
          </View>
        </View>

        <VerticalScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.paddedContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Budget Calculation{"\t\t"}
                <TouchableOpacity
                  style={styles.infoIcon}
                  onPress={() => showInfo("chart")}
                >
                  <FontAwesome5
                    name="info-circle"
                    size={16}
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </Text>

              {!chartHtml ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Your Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor={colors.textGray}
                      value={userName}
                      onChangeText={setUserName}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      First Year (e.g., 2019)
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter first year"
                      placeholderTextColor={colors.textGray}
                      keyboardType="numeric"
                      value={year1}
                      onChangeText={setYear1}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Second Year (must be{" "}
                      {year1 ? parseInt(year1) + 2 : "first year + 2"})
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={`Enter ${
                        year1 ? parseInt(year1) + 2 : "Year 2027"
                      }`}
                      placeholderTextColor={colors.textGray}
                      keyboardType="numeric"
                      value={year2}
                      onChangeText={setYear2}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Upload Excel Data</Text>
                    <Text style={styles.helperText}>
                      Required columns: roadname, road_length, pci_
                      {year1 || "YYYY"}, pci_{year2 || "YYYY"} Other columns
                      will be ignored
                    </Text>
                    <TouchableOpacity
                      style={styles.excelButton}
                      onPress={pickDocument}
                      disabled={excelLoading}
                    >
                      {excelLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.excelButtonText}>
                          {fileName || "Select Excel File"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={processExcelFile}
                    disabled={!fileUri || !year1 || !year2 || excelLoading}
                  >
                    {excelLoading ? (
                      <ActivityIndicator color={colors.textDark} />
                    ) : (
                      <Text style={styles.buttonText}>Calculate Budget </Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.cardText}>
                    Hello {userName} 👋, here are your budget projections (
                    values in million INR ):
                  </Text>

                  <View style={styles.webviewContainer} ref={webviewRef}>
                    <WebView
                      originWhitelist={["*"]}
                      source={{ html: chartHtml }}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      startInLoadingState={true}
                      scalesPageToFit={true}
                      style={{ flex: 1 }}
                    />
                  </View>

                  {tables.map((table, index) => renderTable(table, index))}

                  <TouchableOpacity
                    style={styles.excelButton}
                    onPress={exportToExcel}
                    disabled={exportLoading}
                  >
                    {exportLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.excelButtonText}>
                        Export Tables to Excel
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </VerticalScrollView>

        {excelLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.card}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.cardText, { textAlign: "center" }]}>
                Processing Excel file...
              </Text>
            </View>
          </View>
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalContent}</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default CalculateBudgetScreen;
