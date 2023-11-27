const errorMessageElement = document.getElementById("error_message_file");

function readAndCheckFile() {
  var fileInput = document.getElementById("fileUpload");
  const file = fileInput.files[0];
  const errorMessageElement = document.getElementById("error_message_file");
  // Check if the file size exceeds 4.5 MB
  if (file.size > 4.5 * 1024 * 1024) {
    // 4.5 MB in bytes
    errorMessageElement.textContent =
      "The file is above 4.5MB, load an HTML file with Maximum of 4534 Players and 4.5MB";
    errorMessageElement.style.color = "red";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(e.target.result, "text/html");

    // checking if there is a table element in the HTML file
    const table = doc.querySelector("table");
    if (!table) {
      errorMessageElement.textContent =
        "There are no players in the table in the HTML file.";
      return;
    }

    const rows = table.querySelectorAll("tr");

    if (rows.length === 1) {
      errorMessageElement.textContent = "There is only one row in the table.";
      return;
    }

    // selecting all of the th elements in the first tr
    const firstRowHeader = table.querySelectorAll("tr:first-child th");
    const requiredColumnNames = [
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
      "Cor",
      "Cro",
      "Dri",
      "Fin",
      "Fir",
      "Fre",
      "Hea",
      "Lon",
      "L Th",
      "Mar",
      "Pas",
      "Pen",
      "Tck",
      "Tec",
      "Agg",
      "Ant",
      "Bra",
      "Cmp",
      "Cnt",
      "Dec",
      "Det",
      "Fla",
      "Ldr",
      "OtB",
      "Pos",
      "Tea",
      "Vis",
      "Wor",
      "Acc",
      "Agi",
      "Bal",
      "Jum",
      "Nat",
      "Pac",
      "Sta",
      "Str",
      "Aer",
      "Cmd",
      "Com",
      "Ecc",
      "Han",
      "Kic",
      "1v1",
      "Pun",
      "Ref",
      "TRO",
      "Thr",
    ];

    let foundColumnNames = Array.from(firstRowHeader).map((th) =>
      th.innerText.trim()
    );

    // Checking if each required column name is present in the first row of the table
    const hasRequiredColumns = requiredColumnNames.every((colName) =>
      foundColumnNames.includes(colName.trim())
    );

    if (!hasRequiredColumns) {
      errorMessageElement.textContent =
        "The user didn't use the specific player search view.";
      return;
    }

    errorMessageElement.textContent = "All is Good"; // Clear error message if everything is fine
    errorMessageElement.style.color = "green";

    sessionStorage.setItem("uploadedTableData", table.outerHTML);

    // Redirect to second_page.html
    window.location.href = "./second_page.html";
  };

  reader.onerror = function () {
    errorMessageElement.textContent = "Error reading file";
  };

  reader.readAsText(file);
}

function showResultsAfterUserSelectedFile() {
  var fileInput = document.getElementById("fileUpload");
  var fileChosen = document.getElementById("fileChosen");

  if (fileInput.files.length > 0) {
    fileChosen.textContent = fileInput.files[0].name;
    readAndCheckFile();
  } else {
    fileChosen.textContent = "No file chosen";
  }
}

window.addEventListener("pageshow", function () {
  var fileInput = document.getElementById("fileUpload");
  var errorMessageElement = document.getElementById("error_message_file");

  // Clear the file input and any error messages
  fileInput.value = "";
  errorMessageElement.textContent = "";

  // Optionally, clear session storage
  sessionStorage.removeItem("uploadedTableData");
});

/**
 * this function is for downloading the Football Manager View for players search, so the user will able to use this website
 */
function downloadViewFile() {
  // URL to the .fmf file
  const fileUrl = "./All Attribute Views.zip";

  // Creating an anchor element and trigger download
  const anchor = document.createElement("a");
  anchor.href = fileUrl;
  anchor.download = "All Attributes Views.zip";
  anchor.click();

  // Optional: remove the anchor element after initiating download
  anchor.remove();
}

function moveToUploadHtmlPageMenual() {
  window.location.href = "./menual_upload_html.html";
}

function moveToDownloadViewPageMenual() {
  window.location.href = "./menual_download_view.html";
}

