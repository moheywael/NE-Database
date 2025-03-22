let tableRowTemplate = document.querySelector("[data-table-row-template]");
let tableCabinets = document.querySelector("[data-cabinets-table]");
let searchTable = document.querySelector(".main-body-search-controls-search input");
let paginationContainer = document.querySelector(".main-body-search-table-pagination");

// Ensure this is declared only once
let ownersInfoContainer = document.querySelector("[data-owners-info]");
let ownersInfoTemplate = document.querySelector("[data-owners-template]");

let cabinetData = []; // Store cabinets
let ownersData = []; // Store owners

let currentPage = 1;
let rowsPerPage = 50; // Number of rows per page

let firstVisibleCabinetRow; // First table row

// Fetch and store Cabinet data
function fetchCabinetData() {
    return fetch("./data/cabinet_data.json")
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                console.error("Error: Data is empty or not an array.");
                return [];
            }

            return data.map(element => {
                const tableRow = tableRowTemplate?.content.cloneNode(true)?.children[0];

                if (!tableRow) {
                    console.error("Error: Table row template not found.");
                    return null;
                }

                tableRow.querySelector("[data-vendor]").textContent = element.Vendor || "Null";
                tableRow.querySelector("[data-msancode]").textContent = element.MSANCode || "Null";
                tableRow.querySelector("[data-msanname]").textContent = element.MsanName || "Null";
                tableRow.querySelector("[data-city]").textContent = element.City || "Null";
                tableRow.querySelector("[data-exchangename]").textContent = element.Exchange || "Null";
                tableRow.querySelector("[data-totalsubs]").textContent = element.TotalSubscribers || "Null";

                return { ...element, element: tableRow };
            }).filter(item => item !== null);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            return [];
        });
}

// Fetch and store Owners data
// function fetchOwnersData() {
//     return fetch("./data/owners_data.json")
//         .then(res => res.json())
//         .then(data => {
//             if (!Array.isArray(data) || data.length === 0) {
//                 console.error("Error: Owners data is empty or not an array.");
//                 return [];
//             }
//             return data;
//         })
//         .catch(error => {
//             console.error("Error fetching owners data:", error);
//             return [];
//         });
// }

// ------------------------------------------

// Fetch and store Owners data
async function fetchOwnersData() {
    try {
        const [data1, data2] = await Promise.all([
            fetch("./data/owners_data-1.json").then(res => res.json()),
            fetch("./data/owners_data-2.json").then(res => res.json())
        ]);

        if (!Array.isArray(data1) || !Array.isArray(data2)) {
            console.error("Error: One or both JSON files contain invalid data.");
            return [];
        }

        const data = [...data1, ...data2]; // Merging both arrays
        return data; // Returning merged data
    } catch (error) {
        console.error("Error fetching owners data:", error);
        return [];
    }
}

// ------------------------------------------

// Function to initialize and display data
function initializeData() {
    Promise.all([fetchCabinetData(), fetchOwnersData()]).then(([cabinets, owners]) => {
        cabinetData = cabinets;
        ownersData = owners;

        if (cabinetData.length > 0) {
            let firstVisibleCabinet = cabinetData[0];
            updateCabinetDetails(firstVisibleCabinet);
            updateCabinetMoreDetails(firstVisibleCabinet);
            updateOwnersInfo(firstVisibleCabinet);

            firstVisibleCabinetRow = firstVisibleCabinet;
        }

        updateTableControls();
        updatePagination();
        displayPage(1);
    });
}

let ownersInfoButtons = document.querySelectorAll(".main-body-owners-infos-owners button");
let selectedFilter = ownersInfoButtons[0]?.textContent.trim(); // Default filter

ownersInfoButtons.forEach((ownersInfoButton) => {
    ownersInfoButton.addEventListener("click", () => {
        ownersInfoButtons.forEach((btn) => btn.classList.remove("selected"));
        ownersInfoButton.classList.add("selected");

        // Update the selected filter
        selectedFilter = ownersInfoButton.textContent.trim();

        // Reset the fault owners search input
        let ownersSearchInput = document.querySelector(".main-body-owners-infos-search input");
        ownersSearchInput.value = "";

        // Update the owners info based on the selected filter
        updateOwnersInfo(firstVisibleCabinetRow);
    });
});

// Function to update pagination controls dynamically
function updatePagination() {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = ""; // Clear previous buttons
    let visibleItems = cabinetData.filter(cabinet => !cabinet.element.classList.contains("hide-element"));
    let totalPages = Math.ceil(visibleItems.length / rowsPerPage);

    if (totalPages <= 1) {
        paginationContainer.classList.remove("show");
        paginationContainer.classList.add("hide");
        return;
    }

    paginationContainer.classList.remove("hide");
    paginationContainer.classList.add("show");

    let createButton = (text, page, extraClass) => {
        let button = document.createElement("button");
        button.textContent = text;
        if (page === currentPage) button.classList.add("active");

        if (extraClass) button.classList.add(extraClass);

        if (text !== "...") button.addEventListener("click", () => displayPage(page));
        paginationContainer.appendChild(button);
    };

    if (currentPage > 1) createButton("<", currentPage - 1, "prev");
    createButton(1, 1, "first");

    if (currentPage > 4) createButton("...", currentPage - 5, "ellipsis");

    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        createButton(i, i, "");
    }

    if (currentPage < totalPages - 3) createButton("...", currentPage + 5, "ellipsis");

    if (totalPages > 1) createButton(totalPages, totalPages, "last");
    if (currentPage < totalPages) createButton(">", currentPage + 1, "next");
}

// Function to update Cabinet more details section (Drawer)
function updateCabinetMoreDetails(cabinet) {
    let message = "Null";

    let fields = {
        "data-msan-sla-id-view": cabinet?.Slaid,
        "data-msan-cascaded-fiber-view": cabinet?.IPAdd,
        "data-msan-cascaded-power-view": cabinet?.IPAdd,
        "data-msan-te-ip-view": cabinet?.TeIP,
        "data-msan-router-port-view": cabinet?.RouterInterface,
        "data-msan-host-name-view": cabinet?.HostName,
        "data-msan-parent-host-name-view": cabinet?.ParentHostname,
        "data-msan-ola-duration-view": cabinet?.OLADuration,
    };

    Object.entries(fields).forEach(([selector, value]) => {
        let element = document.querySelector(`[${selector}] span`);
        if (element) {
            element.textContent = value || message;
        } else {
            console.warn(`Warning: Element [${selector}] not found in DOM.`);
        }
    });
}

// Function to display paginated results
function displayPage(page) {
    if (!cabinetData.length) {
        // If there's no cabinet data, clear the table and update owners info
        tableCabinets.innerHTML = "";
        updateOwnersInfo(null); // Pass null to indicate no visible cabinet
        return;
    }

    tableCabinets.innerHTML = ""; // Clear table content
    currentPage = page;
    let start = (page - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = cabinetData.filter(cabinet => !cabinet.element.classList.contains("hide-element")).slice(start, end);

    paginatedItems.forEach(cabinet => tableCabinets.appendChild(cabinet.element));
    updatePagination();

    // Update firstVisibleCabinetRow
    firstVisibleCabinetRow = paginatedItems[0] || null;

    // Update owners info based on the first visible cabinet
    updateOwnersInfo(firstVisibleCabinetRow);
}

// Search functionality for the table
searchTable?.addEventListener("input", (e) => {
    const inputValue = e.target.value.trim().toLowerCase();
    let firstVisibleCabinet = null;

    cabinetData.forEach((cabinet) => {
        const isVisible =
            (cabinet.MSANCode?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.Vendor?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.MsanName?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.City?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.Exchange?.toLowerCase() || "").includes(inputValue);

        cabinet.element.classList.toggle("hide-element", !isVisible);

        if (isVisible && !firstVisibleCabinet) {
            firstVisibleCabinet = cabinet;
        }
    });

    updateTableControls();
    updatePagination();
    displayPage(1);

    // Update firstVisibleCabinetRow
    firstVisibleCabinetRow = firstVisibleCabinet;

    // Update owners info based on the first visible cabinet
    updateOwnersInfo(firstVisibleCabinetRow);
});

// Function to populate owners' information
function updateOwnersInfo(firstVisibleCabinet) {
    if (!ownersInfoContainer || !ownersData.length) {
        // If there's no owners data or no container, display "No owners found."
        ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
        return;
    }

    // Clear the owners container
    ownersInfoContainer.innerHTML = "";

    // If there's no firstVisibleCabinet, display "No owners found."
    if (!firstVisibleCabinet) {
        ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
        return;
    }

    let exchangeID = firstVisibleCabinet["ExchangeID"];
    if (!exchangeID) {
        // If there's no exchange ID, display "No owners found."
        ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
        return;
    }

    let filteredOwners = ownersData.filter(owner => owner["Exchange ID"] === exchangeID);

    // Filter owners based on the selected filter
    if (selectedFilter === "REGION") {
        filteredOwners = filteredOwners.filter(owner => owner["Fault Group"] === "REGION");
    } else if (selectedFilter === "AVAILABILITY") {
        filteredOwners = filteredOwners.filter(owner => owner["Fault Group"] === "AVAILABILITY");
    } else if (selectedFilter === "POWER-NOC") {
        filteredOwners = filteredOwners.filter(owner => owner["Fault Group"] === "POWER-NOC");
    }

    // Further filter owners based on the search input (name, email, phone)
    let ownersSearchInput = document.querySelector(".main-body-owners-infos-search input");
    const searchValue = ownersSearchInput.value.trim().toLowerCase();

    if (searchValue) {
        filteredOwners = filteredOwners.filter(owner => {
            const nameMatch = owner.Owner?.toLowerCase().includes(searchValue);
            const emailMatch = owner["Primary E-mail"]?.toLowerCase().includes(searchValue);
            const phoneMatch = owner["Primary Phone"]?.toString().includes(searchValue);

            return nameMatch || emailMatch || phoneMatch;
        });
    }

    // Populate the owners container with the filtered results
    filteredOwners.forEach(owner => {
        let ownerCard = ownersInfoTemplate.content.cloneNode(true).children[0];

        ownerCard.querySelector(".role-name").textContent = owner.Owner || "Unknown";
        let emailElement = ownerCard.querySelector(".mail span a");
        emailElement.textContent = owner["Primary E-mail"] || "N/A";
        emailElement.href = `mailto:${owner["Primary E-mail"]}`;

        let phoneElement = ownerCard.querySelector(".phone p");
        phoneElement.textContent = owner["Primary Phone"] || "N/A";

        ownersInfoContainer.appendChild(ownerCard);
    });

    // Display a message if no owners are found
    if (!filteredOwners.length) {
        ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
    }
}

// Function to update MSAN Cabinet Details section
function updateCabinetDetails(cabinet) {
    let message = "Null";
    document.querySelector("[data-msan-name-view] span").textContent = cabinet?.MsanName || message;
    document.querySelector("[data-msan-ip-view] span").textContent = cabinet?.IPAddress || message;
    document.querySelector("[data-msan-vic-service-name-view] span").textContent = cabinet?.VICServiceName || message;
    document.querySelector("[data-msan-cabinet-model-view] span").textContent = cabinet?.Model || message;
    document.querySelector("[data-msan-battery-status-view] span").textContent = cabinet?.BatteryStatus || message;
    document.querySelector("[data-msan-battery-type-view] span").textContent = cabinet?.BatteryType || message;
    document.querySelector("[data-msan-total-subs-view] span").textContent = cabinet?.TotalSubscribers || message;
}

// Function to update Table Controls
function updateTableControls() {
    let totalNEs = 0;
    let totalSubscribers = 0;

    cabinetData.forEach(cabinet => {
        if (!cabinet.element.classList.contains("hide-element")) {
            totalNEs++;
            totalSubscribers += parseInt(cabinet.TotalSubscribers) || 0;
        }
    });

    document.querySelector(".main-body-search-controls-table-controls-total-NEs .text-value").textContent = totalNEs;
    document.querySelector(".main-body-search-controls-table-controls-total-subs .text-value").textContent = totalSubscribers;
}

// Function to display paginated results
function displayPage(page) {
    if (!cabinetData.length) return;

    tableCabinets.innerHTML = ""; // Clear table content
    currentPage = page;
    let start = (page - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = cabinetData.filter(cabinet => !cabinet.element.classList.contains("hide-element")).slice(start, end);

    paginatedItems.forEach(cabinet => tableCabinets.appendChild(cabinet.element));
    updatePagination();
}

// Search functionality for the table
searchTable?.addEventListener("input", (e) => {
    const inputValue = e.target.value.trim().toLowerCase();
    let firstVisibleCabinet = null;

    cabinetData.forEach((cabinet) => {
        const isVisible =
            (cabinet.MSANCode?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.Vendor?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.MsanName?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.City?.toLowerCase() || "").includes(inputValue) ||
            (cabinet.Exchange?.toLowerCase() || "").includes(inputValue);

        cabinet.element.classList.toggle("hide-element", !isVisible);

        if (isVisible && !firstVisibleCabinet) {
            firstVisibleCabinet = cabinet;
        }
    });

    updateTableControls();
    updatePagination();
    displayPage(1);

    if (firstVisibleCabinet) {
        updateCabinetDetails(firstVisibleCabinet);
        updateCabinetMoreDetails(firstVisibleCabinet);
        updateOwnersInfo(firstVisibleCabinet);
    }
});

// Clear button for input fields
document.querySelectorAll("input").forEach(inputField => {
    let inputFieldClearButton = inputField.nextElementSibling;

    if (inputFieldClearButton?.classList.contains("fa-xmark")) {
        inputFieldClearButton.addEventListener("click", () => {
            inputField.value = "";
            inputField.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }
});

// Add search functionality for the owners container
let ownersSearchInput = document.querySelector(".main-body-owners-infos-search input");

ownersSearchInput?.addEventListener("input", (e) => {
    updateOwnersInfo(firstVisibleCabinetRow);
});

// Initialize the data when the page loads
initializeData();
