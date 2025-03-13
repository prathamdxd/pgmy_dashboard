import numpy as np

# Function to get user input for PCI values


def get_pci_values(year):
    print(
        f"Enter PCI values for {year} (one value per line, press Enter twice to finish):")
    pci_list = []
    while True:
        line = input().strip()
        if line == "":
            break  # Stop reading input when an empty line is entered
        try:
            pci_value = int(line)
            if 1 <= pci_value <= 5:
                pci_list.append(pci_value)
            else:
                print(
                    f"Invalid PCI value: {pci_value}. Please enter a value between 1 and 5.")
        except ValueError:
            print(f"Invalid input: {line}. Please enter an integer.")
    return pci_list


# Get PCI values from the user
print("Enter PCI values for 2019:")
pci_2019 = get_pci_values("2019")
print("\nEnter PCI values for 2021:")
pci_2021 = get_pci_values("2021")

# Ensure both lists have the same length
if len(pci_2019) != len(pci_2021):
    print("Error: The number of PCI values for 2019 and 2021 must be the same.")
    exit()

# Number of PCI states (from 1 to 5)
num_states = 5

# Initialize the transition matrix with zeros
transition_matrix = np.zeros((num_states, num_states))

# Count transitions from 2019 to 2021
for i in range(len(pci_2019)):
    from_state = pci_2019[i] - 1  # Convert to 0-based index
    to_state = pci_2021[i] - 1    # Convert to 0-based index
    transition_matrix[from_state][to_state] += 1

# Convert counts to probabilities (normalize each row)
for i in range(num_states):
    row_sum = transition_matrix[i].sum()
    if row_sum > 0:
        transition_matrix[i] = transition_matrix[i] / row_sum

# Define powers of A to compute
powers = [2, 4, 6, 8, 10]

# Compute transition matrices A^2, A^4, A^6, A^8, A^10
transition_matrices = {p: np.linalg.matrix_power(
    transition_matrix, p) for p in powers}

# Define initial state vectors
initial_state_vectors = {
    1: np.array([1, 0, 0, 0, 0]),  # PCI 1
    2: np.array([0, 1, 0, 0, 0]),  # PCI 2
    3: np.array([0, 0, 1, 0, 0]),  # PCI 3
    4: np.array([0, 0, 0, 1, 0]),  # PCI 4
    5: np.array([0, 0, 0, 0, 1])   # PCI 5
}

# Define weights for weighted sum calculation
weights = np.array([85, 70, 55, 30, 10])

# Compute final weighted sums for each power of A
final_weighted_sums = {}

for p, A_p in transition_matrices.items():
    final_weighted_sums[p] = {}
    for state, vector in initial_state_vectors.items():
        result = np.dot(vector, A_p)  # Multiply A^p with initial state vector
        reversed_result = result[::-1]  # Reverse the result vector
        weighted_result = reversed_result * weights  # Multiply by respective weights
        total_sum = np.sum(weighted_result)  # Sum up all elements
        final_weighted_sums[p][state] = total_sum

# Function to classify PCI condition


def classify_pci(value):
    if value > 85:
        return "Very Good"
    elif value > 65:
        return "Good"
    elif value > 50:
        return "Fair"
    elif value > 25:
        return "Poor"
    elif value > 10:
        return "Very Poor"
    else:
        return "Failed Condition"


# Budget table mapping
budget_table = {
    "Very Good": [0, 0, 0, 0, 0, 0],
    "Good": [4.8, 3.3, 2.1, 1.3, 0.7, 0.4],
    "Fair": [83, 81, 73, 61, 50, 39],
    "Poor": [110.3, 118.6, 122.9, 121.1, 113.5, 101.8],
    "Very Poor": [144.8, 232.4, 326.6, 424.2, 520.4, 610.6]
}

# Mapping powers of A to years
year_mapping = {2: 2023, 4: 2025, 6: 2027, 8: 2029, 10: 2031}

# Print final weighted sums, classifications, and budgets
for p in powers:
    year = year_mapping[p]
    print(f"\nFinal Weighted Sums & Classifications for {year}:")
    for state, total_sum in final_weighted_sums[p].items():
        classification = classify_pci(total_sum)
        print(f"PCI {state} → {total_sum:.2f} ({classification})")

# Print mapped weighted values, classifications, and budgets
for p in powers:
    year = year_mapping[p]
    print(
        f"\nMapped Weighted Values, Conditions & Budget for PCI 2021 ({year}):")
    for pci in pci_2021:
        weighted_value = final_weighted_sums[p][pci]
        condition = classify_pci(weighted_value)
        budget_index = list(year_mapping.values()).index(
            year)  # Get corresponding year index
        budget = budget_table.get(condition, [0, 0, 0, 0, 0, 0])[
            budget_index]  # Get budget value
        print(f"PCI {pci} → Weighted Value: {weighted_value:.2f}, Condition: {condition}, Budget: {budget:.1f} Million INR")
