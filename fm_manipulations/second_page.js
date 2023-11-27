let page_table = null;
let flagFirstColumnSortedInOnSubmit = false;

function createFilteredTable() {
  const tableData = getUploadedTableData(); // Retrieve the table data as HTML string
  if (!tableData) {
    console.error("No table data available.");
    return;
  }

  // Define the required columns
  const requiredColumns = [
    "UID",
    "Inf",
    "Name",
    "Position",
    "Preferred Foot",
    "Left Foot",
    "Right Foot",
    "Nat",
    "Club",
    "Caps",
    "Height",
    "Weight",
    "Age",
    "Transfer Value",
    "Wage",
    "Min Fee Rls",
  ];

  // Create a new table element
  const newTable = document.createElement("table");
  newTable.setAttribute("border", "1");

  // Add table header
  const thead = newTable.createTHead();
  const headerRow = thead.insertRow();
  requiredColumns.forEach((colName) => {
    const th = document.createElement("th");
    th.textContent = colName;
    headerRow.appendChild(th);
  });

  // Add table body
  const tbody = newTable.createTBody();
  const parser = new DOMParser();
  const originalTable = parser
    .parseFromString(tableData, "text/html")
    .querySelector("table");

  // Map to store the first occurrence of each column
  const columnIndexMap = new Map();

  // Extract column indices from the first row
  const headerCells = originalTable.rows[0].cells;
  for (let i = 0; i < headerCells.length; i++) {
    const colName = headerCells[i].textContent;
    if (requiredColumns.includes(colName) && !columnIndexMap.has(colName)) {
      columnIndexMap.set(colName, i);
    }
  }

  // Iterate over each row in the original table
  for (let i = 1; i < originalTable.rows.length; i++) {
    const row = originalTable.rows[i];
    const newRow = tbody.insertRow();

    requiredColumns.forEach((colName) => {
      const cellIndex = columnIndexMap.get(colName);
      if (cellIndex !== undefined) {
        const newCell = row.cells[cellIndex].cloneNode(true);
        newRow.appendChild(newCell);
      }
    });
  }

  // Append the new table to the body or a specific element
  const form_table_container = document.getElementById("form_table_container");
  form_table_container.appendChild(newTable);
  page_table = newTable;
}

/////////////////////

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".attribute select").forEach((selectElement) => {
    selectElement.addEventListener("change", (event) => {
      switch (event.target.value) {
        case "1":
          event.target.className = "select-blue";
          break;
        case "2":
          event.target.className = "select-green";
          break;
        default:
          event.target.className = "";
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(
    "#roleSelectionForm .toggle-button"
  );

  toggleButtons.forEach((button) => {
    button.innerHTML = "&#9660;"; // Start with a down arrow

    // Initially hide elements
    let nextElement = button.parentElement.nextElementSibling;
    while (nextElement && !nextElement.classList.contains("p_show_hide")) {
      nextElement.style.display = "none";
      nextElement = nextElement.nextElementSibling;
    }

    // Add click event listener
    button.addEventListener("click", () => {
      let showLabels = false;
      let nextElement = button.parentElement.nextElementSibling;

      while (nextElement && !nextElement.classList.contains("p_show_hide")) {
        if (nextElement.style.display === "none") {
          nextElement.style.display = "";
          showLabels = true;
        } else {
          nextElement.style.display = "none";
        }
        nextElement = nextElement.nextElementSibling;
      }

      // Update the button arrow
      button.innerHTML = showLabels ? "&#9650;" : "&#9660;";
    });
  });

  document.getElementById("roleSelectionForm").onsubmit = function (event) {
    event.preventDefault();

    // Get all checked checkboxes
    let checkedRoles = Array.from(
      document.querySelectorAll(
        '#roleSelectionForm input[type="checkbox"]:checked'
      )
    ).map((el) => el.value);

    delete all_roles["created_role"];
    const roleModel = createUserRole();
    if (roleModel.length > 0) {
      all_roles["created_role"] = roleModel;
      checkedRoles.push("created_role");
    }

    let lastNonRatingColumnIndex = -1;
    const headerCells = page_table.rows[0].cells;

    for (let i = 0; i < headerCells.length; i++) {
      if (!headerCells[i].textContent.includes("Rating")) {
        lastNonRatingColumnIndex = i;
      }
    }

    // Find the index of the "Min Fee Rls" column
    const firstAddedColumnIndex =
      lastNonRatingColumnIndex !== -1
        ? lastNonRatingColumnIndex
        : headerCells.length - 1;

    // Process the table based on the checked roles
    processTableForSelectedRoles(checkedRoles, page_table);

    if (
      firstAddedColumnIndex >= 0 &&
      firstAddedColumnIndex < page_table.rows[0].cells.length - 1
    ) {
      sortTableByColumn(page_table, firstAddedColumnIndex + 1, false);

      // Explicitly set the sorting state
      const sortedHeader = page_table.rows[0].cells[firstAddedColumnIndex + 1];
      sortedHeader.sortAscending = false;

      // Reset sorting state for all other headers
      const allHeaders = page_table.querySelectorAll("th");
      allHeaders.forEach((th) => {
        if (th !== sortedHeader) {
          th.sortAscending = true;
        }
      });
    }
    flagFirstColumnSortedInOnSubmit = true;
  };
});

function processTableForSelectedRoles(roles, newTable) {
  const tableData = getUploadedTableData();
  if (!tableData) {
    console.error("No table data available.");
    return;
  }

  const parser = new DOMParser();
  const originalTable = parser
    .parseFromString(tableData, "text/html")
    .querySelector("table");
  const columnIndexMap = getColumnIndexMap(originalTable);

  // Remove previously added rating columns if any
  removeRatingColumns(newTable);

  // Add new column headers and data for each selected role
  addNewColumnsWithRatings(newTable, roles, originalTable, columnIndexMap);
}

function addNewColumnsWithRatings(
  newTable,
  roles,
  originalTable,
  columnIndexMap
) {
  const headerRow = newTable.rows[0];

  roles.forEach((role, index) => {
    const th = document.createElement("th");
    th.textContent = role + " Rating";
    const sortArrow = document.createElement("span");
    sortArrow.innerHTML = "&#9660;"; // Downward arrow for descending order
    sortArrow.style.cursor = "pointer";
    th.appendChild(sortArrow);

    th.isSorted = false;

    th.addEventListener("click", () => {
      // Reset isSorted for all columns except the current one
      Array.from(headerRow.cells).forEach((cell) => {
        if (cell !== th) cell.isSorted = false;
      });

      if (flagFirstColumnSortedInOnSubmit) {
        flagFirstColumnSortedInOnSubmit = false;
        th.sortAscending = !th.sortAscending;
        updateSortArrow(sortArrow, th.sortAscending);
        sortTableByColumn(
          newTable,
          headerRow.cells.length - roles.length + index,
          th.sortAscending
        );
      } else {
        // If the current column was not previously sorted, sort it in descending order
        if (!th.isSorted) {
          th.sortAscending = true; // Next click will sort in ascending order
          th.isSorted = true;
        } else {
          // Toggle the sorting direction
          th.sortAscending = !th.sortAscending;
        }

        updateSortArrow(sortArrow, !th.sortAscending);
        sortTableByColumn(
          newTable,
          headerRow.cells.length - roles.length + index,
          !th.sortAscending
        );
      }
    });

    headerRow.appendChild(th);
  });

  for (let i = 1; i < newTable.rows.length; i++) {
    const newRow = newTable.rows[i];
    // Find the index of the "UID" column in the new table
    let uidColumnIndex = Array.from(headerRow.cells).findIndex(
      (cell) => cell.textContent === "UID"
    );
    const uid = newRow.cells[uidColumnIndex].textContent; // Directly get UID from the new row (assuming UID is in the second column)

    // Find the corresponding row in the original table using UID
    const originalRow = findRowByUID(originalTable, uid, columnIndexMap);

    roles.forEach((role) => {
      const roleAttributes = all_roles[role];
      let rating = "N/A";
      if (roleAttributes && originalRow) {
        const playerData = extractPlayerData(originalRow, columnIndexMap);
        rating = calculateAverageRating(playerData, roleAttributes);
      }
      appendRatingToRow(newRow, rating);
    });
  }
}

function isColumnSorted(table, columnIndex) {
  let previousValue = "";
  for (let i = 1; i < table.rows.length; i++) {
    const currentValue = table.rows[i].cells[columnIndex].textContent.trim();
    if (i === 1) {
      previousValue = currentValue;
      continue;
    }
    if (currentValue.localeCompare(previousValue) < 0) {
      return false; // Column is not sorted in ascending order
    }
    previousValue = currentValue;
  }
  return true; // Column is sorted in ascending order
}

function findRowByUID(table, uid, columnIndexMap) {
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    if (row.cells[columnIndexMap.get("UID")].textContent === uid) {
      return row;
    }
  }
  return null; // Return null if no matching row is found
}

function removeRatingColumns(table) {
  // Assuming the original number of columns (without ratings) is known
  const originalColumnCount = 16; // Update this with the number of your original columns

  let headerRow = table.rows[0];
  while (headerRow.cells.length > originalColumnCount) {
    headerRow.deleteCell(-1); // Remove the last cell in the header row
  }

  // Do the same for each row in the table
  for (let i = 1; i < table.rows.length; i++) {
    while (table.rows[i].cells.length > originalColumnCount) {
      table.rows[i].deleteCell(-1); // Remove the last cell in each row
    }
  }
}

function getColumnIndexMap(table) {
  const headerCells = table.rows[0].cells;
  const columnIndexMap = new Map();
  for (let i = 0; i < headerCells.length; i++) {
    columnIndexMap.set(headerCells[i].textContent, i);
  }
  return columnIndexMap;
}

function extractPlayerData(row, columnIndexMap) {
  let playerData = {};
  columnIndexMap.forEach((index, columnName) => {
    playerData[columnName] = row.cells[index].textContent;
  });
  return playerData;
}

function calculateAverageRating(playerData, roleAttributes) {
  let totalScore = 0;
  let totalLevel = 0;

  roleAttributes.forEach((attr) => {
    let attributeValue = parseInt(playerData[attr.atr], 10);
    if (!isNaN(attributeValue)) {
      totalScore += attributeValue * attr.lvl;
      totalLevel += attr.lvl;
    }
  });

  return totalLevel > 0 ? (totalScore / totalLevel).toFixed(2) : "N/A";
}

function appendRatingToRow(row, rating) {
  const ratingCell = row.insertCell(-1);
  ratingCell.textContent = rating;
}

function addSortableHeaders(newTable, roles) {
  const headerRow = newTable.rows[0];
  roles.forEach((role, index) => {
    const th = document.createElement("th");
    th.textContent = role + " Rating ";
    const sortArrow = document.createElement("span");
    sortArrow.style.cursor = "pointer";
    th.appendChild(sortArrow);

    // Initialize sorting direction (start with descending)
    let ascending = false;
    updateSortArrow(sortArrow, ascending);
    th.addEventListener("click", () => {
      ascending = !ascending; // Toggle the direction
      updateSortArrow(sortArrow, ascending);
      sortTableByColumn(
        newTable,
        headerRow.cells.length - roles.length + index,
        ascending
      );
    });

    headerRow.appendChild(th);
  });
}

function updateSortArrow(arrowElement, ascending) {
  arrowElement.innerHTML = ascending ? "&#9650;" : "&#9660;"; // Up arrow for ascending, down arrow for descending
}

function sortTableByColumn(table, columnIndex, ascending = true) {
  const dirModifier = ascending ? 1 : -1;
  // Select all rows containing player data
  const rows = Array.from(table.querySelectorAll("tr")).slice(1); // Skip the header row

  // Sort the rows based on the content of cells in the specified column
  rows.sort((a, b) => {
    const aColText = a.cells[columnIndex].textContent.trim();
    const bColText = b.cells[columnIndex].textContent.trim();
    return (
      aColText.localeCompare(bColText, undefined, { numeric: true }) *
      dirModifier
    );
  });

  // Append the sorted rows back to the table
  rows.forEach((row) => table.appendChild(row));
}

function resetRoles() {
  // Uncheck all checkboxes
  const checkboxes = document.querySelectorAll(
    '#roleSelectionForm input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Reset all select elements to their first option and remove background color
  const selects = document.querySelectorAll("#roleSelectionForm select");
  selects.forEach((select) => {
    select.selectedIndex = 0;
    select.className = ""; // Reset any custom background color classes
  });
}

function createUserRole() {
  const roleModel = [];

  // Reverse map to find attribute code by name
  const reverseAttributeMappings = Object.fromEntries(
    Object.entries(attributeMappings).map(([code, name]) => [name, code])
  );

  // Get all the .attribute elements
  const attributes = document.querySelectorAll(".attribute");

  attributes.forEach((attributeDiv) => {
    const label = attributeDiv.querySelector("label").textContent;
    const select = attributeDiv.querySelector("select");
    const importanceLevel = select.value;

    // Only add attributes with an importance level of 1 or 2
    if (importanceLevel === "1" || importanceLevel === "2") {
      const attributeCode = reverseAttributeMappings[label];
      if (attributeCode) {
        roleModel.push({
          atr: attributeCode,
          lvl: parseInt(importanceLevel),
        });
      }
    }
  });

  return roleModel;
}

createFilteredTable();
