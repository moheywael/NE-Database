// DOM Elements
const tableRowTemplate = document.querySelector("[data-table-row-template]");
const tableCabinets = document.querySelector("[data-cabinets-table]");
const searchTable = document.querySelector(".main-body-search-controls-search input");
const paginationContainer = document.querySelector(".main-body-search-table-pagination");
const ownersInfoContainer = document.querySelector("[data-owners-info]");
const ownersInfoTemplate = document.querySelector("[data-owners-template]");

// Data Storage
let cabinetData = [];
let ownersData = [];
let currentPage = 1;
const rowsPerPage = 50;
let firstVisibleCabinetRow;
let selectedFilter = "REGION"; // Default filter

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    setupEventListeners();
});

function setupEventListeners() {
    // Owners filter buttons
    document.querySelectorAll(".main-body-owners-infos-owners button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".main-body-owners-infos-owners button").forEach(btn => 
                btn.classList.remove("selected"));
            button.classList.add("selected");
            selectedFilter = button.textContent.trim();
            document.querySelector(".main-body-owners-infos-search input").value = "";
            updateOwnersInfo(firstVisibleCabinetRow);
        });
    });

    // Search functionality
    searchTable?.addEventListener("input", handleSearch);
    
    // Owners search
    document.querySelector(".main-body-owners-infos-search input")?.addEventListener("input", () => {
        updateOwnersInfo(firstVisibleCabinetRow);
    });

    // Clear buttons for input fields
    document.querySelectorAll("input").forEach(inputField => {
        const clearButton = inputField.nextElementSibling;
        if (clearButton?.classList.contains("fa-xmark")) {
            clearButton.addEventListener("click", () => {
                inputField.value = "";
                if (inputField === searchTable) {
                    handleSearch({ target: inputField });
                } else {
                    updateOwnersInfo(firstVisibleCabinetRow);
                }
            });
        }
    });
}

function handleSearch(e) {
    const inputValue = e.target.value.trim().toLowerCase();
    let firstVisibleCabinet = null;

    cabinetData.forEach(cabinet => {
        const isVisible =
            (cabinet["MSAN Code"]?.toLowerCase() || "").includes(inputValue) ||
            (cabinet["Vendor"]?.toLowerCase() || "").includes(inputValue) ||
            (cabinet["Msan Name"]?.toLowerCase() || "").includes(inputValue) ||
            (cabinet["City"]?.toLowerCase() || "").includes(inputValue) ||
            (cabinet["Exchange"]?.toLowerCase() || "").includes(inputValue);

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
        firstVisibleCabinetRow = firstVisibleCabinet;
    }
}

// Data Fetching
async function fetchCabinetData() {
    try {
        const response = await fetch("./data/cabinet_data.json");
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            console.error("Error: Cabinet data is empty or not an array.");
            return [];
        }

        return data.map(element => {
            const tableRow = tableRowTemplate?.content.cloneNode(true)?.children[0];
            if (!tableRow) {
                console.error("Error: Table row template not found.");
                return null;
            }

            tableRow.querySelector("[data-vendor]").textContent = element["Vendor"] || "Null";
            tableRow.querySelector("[data-msancode]").textContent = element["MSAN Code"] || "Null";
            tableRow.querySelector("[data-msanname]").textContent = element["Msan Name"] || "Null";
            tableRow.querySelector("[data-city]").textContent = element["City"] || "Null";
            tableRow.querySelector("[data-exchangename]").textContent = element["Exchange"] || "Null";
            tableRow.querySelector("[data-totalsubs]").textContent = element["Total Subscribers"] || "Null";

            return { ...element, element: tableRow };
        }).filter(item => item !== null);
    } catch (error) {
        console.error("Error fetching cabinet data:", error);
        return [];
    }
}

async function fetchOwnersData() {
    try {
        const [data1, data2] = await Promise.all([
            fetch("./data/owners_data-1.json").then(res => res.json()),
            fetch("./data/owners_data-2.json").then(res => res.json())
        ]);

        if (!Array.isArray(data1) || !Array.isArray(data2)) {
            console.error("Error: One or both owners data files contain invalid data.");
            return [];
        }

        return [...data1, ...data2];
    } catch (error) {
        console.error("Error fetching owners data:", error);
        return [];
    }
}

function initializeData() {
    Promise.all([fetchCabinetData(), fetchOwnersData()])
        .then(([cabinets, owners]) => {
            cabinetData = cabinets;
            ownersData = owners;

            if (cabinetData.length > 0) {
                firstVisibleCabinetRow = cabinetData[0];
                updateCabinetDetails(firstVisibleCabinetRow);
                updateCabinetMoreDetails(firstVisibleCabinetRow);
                updateOwnersInfo(firstVisibleCabinetRow);
            }

            updateTableControls();
            updatePagination();
            displayPage(1);
        })
        .catch(error => {
            console.error("Error initializing data:", error);
        });
}

// Update Functions
function updateCabinetDetails(cabinet) {
    if (!cabinet) {
        console.warn("No cabinet provided to updateCabinetDetails");
        return;
    }

    const fields = {
        "[data-msan-name-view] span": cabinet["Msan Name"],
        "[data-msan-ip-view] span": cabinet["IP Address"],
        "[data-msan-vic-service-name-view] span": cabinet["VIC Service Name"],
        "[data-msan-cabinet-model-view] span": cabinet["Model"],
        "[data-msan-battery-status-view] span": cabinet["Battery Status"],
        "[data-msan-battery-type-view] span": cabinet["Battery Type"],
        "[data-msan-total-subs-view] span": cabinet["Total Subscribers"]
    };

    Object.entries(fields).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value || "Null";
        } else {
            console.warn(`Element not found: ${selector}`);
        }
    });
}

function updateCabinetMoreDetails(cabinet) {
    const message = "Null";

    const fields = {
        "[data-msan-sla-id-view] span": cabinet?.["SLA ID"],
        "[data-msan-cascaded-fiber-view] span": cabinet?.["IP Address"],
        "[data-msan-cascaded-power-view] span": cabinet?.["IP Address"],
        "[data-msan-te-ip-view] span": cabinet?.["TE IP"],
        "[data-msan-router-port-view] span": cabinet?.["Router Interface"],
        "[data-msan-host-name-view] span": cabinet?.["Host Name"],
        "[data-msan-parent-host-name-view] span": cabinet?.["Parent Hostname"],
        "[data-msan-ola-duration-view] span": cabinet?.["OLA Duration"]
    };

    Object.entries(fields).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value || message;
        }
    });
}

function updateOwnersInfo(cabinet) {
    if (!ownersInfoContainer) return;

    ownersInfoContainer.innerHTML = "";

    if (!cabinet || !ownersData.length) {
        ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
        return;
    }

    const exchangeID = cabinet["Exchange ID"];
    if (!exchangeID) {
        ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
        return;
    }

    let filteredOwners = ownersData.filter(owner => owner["Exchange ID"] === exchangeID);

    // Apply filter
    if (selectedFilter !== "ALL") {
        filteredOwners = filteredOwners.filter(owner => owner["Fault Group"] === selectedFilter);
    }

    // Apply search
    const searchValue = document.querySelector(".main-body-owners-infos-search input").value.trim().toLowerCase();
    if (searchValue) {
        filteredOwners = filteredOwners.filter(owner => {
            return (
                (owner["Owner"]?.toLowerCase().includes(searchValue)) ||
                (owner["Primary E-mail"]?.toLowerCase().includes(searchValue)) ||
                (owner["Primary Phone"]?.toString().includes(searchValue))
            );
        });
    }

    // Display results
    if (filteredOwners.length === 0) {
        ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
    } else {
        filteredOwners.forEach(owner => {
            const ownerCard = ownersInfoTemplate.content.cloneNode(true).children[0];
            ownerCard.querySelector(".role-name").textContent = owner["Owner"] || "Unknown";
            
            const emailElement = ownerCard.querySelector(".mail span a");
            emailElement.textContent = owner["Primary E-mail"] || "N/A";
            emailElement.href = owner["Primary E-mail"] ? `mailto:${owner["Primary E-mail"]}` : "#";
            
            ownerCard.querySelector(".phone p").textContent = owner["Primary Phone"] || "N/A";
            ownersInfoContainer.appendChild(ownerCard);
        });
    }
}

function updateTableControls() {
    let totalNEs = 0;
    let totalSubscribers = 0;

    cabinetData.forEach(cabinet => {
        if (!cabinet.element.classList.contains("hide-element")) {
            totalNEs++;
            totalSubscribers += parseInt(cabinet["Total Subscribers"]) || 0;
        }
    });

    document.querySelector(".main-body-search-controls-table-controls-total-NEs .text-value").textContent = totalNEs;
    document.querySelector(".main-body-search-controls-table-controls-total-subs .text-value").textContent = totalSubscribers;
}

// Pagination Functions
function displayPage(page) {
    if (!cabinetData.length) {
        tableCabinets.innerHTML = "";
        updateOwnersInfo(null);
        return;
    }

    tableCabinets.innerHTML = "";
    currentPage = page;

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = cabinetData
        .filter(cabinet => !cabinet.element.classList.contains("hide-element"))
        .slice(start, end);

    paginatedItems.forEach(cabinet => tableCabinets.appendChild(cabinet.element));
    updatePagination();

    firstVisibleCabinetRow = paginatedItems[0] || null;
    if (firstVisibleCabinetRow) {
        updateCabinetDetails(firstVisibleCabinetRow);
        updateCabinetMoreDetails(firstVisibleCabinetRow);
        updateOwnersInfo(firstVisibleCabinetRow);
    }
}

function updatePagination() {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";
    const visibleItems = cabinetData.filter(cabinet => !cabinet.element.classList.contains("hide-element"));
    const totalPages = Math.ceil(visibleItems.length / rowsPerPage);

    if (totalPages <= 1) {
        paginationContainer.classList.remove("show");
        paginationContainer.classList.add("hide");
        return;
    }

    paginationContainer.classList.remove("hide");
    paginationContainer.classList.add("show");

    const createButton = (text, page, extraClass) => {
        const button = document.createElement("button");
        button.textContent = text;
        if (page === currentPage) button.classList.add("active");
        if (extraClass) button.classList.add(extraClass);
        if (text !== "...") button.addEventListener("click", () => displayPage(page));
        paginationContainer.appendChild(button);
    };

    if (currentPage > 1) createButton("<", currentPage - 1, "prev");
    createButton(1, 1, "first");

    if (currentPage > 4) createButton("...", currentPage - 5, "ellipsis");

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        createButton(i, i);
    }

    if (currentPage < totalPages - 3) createButton("...", currentPage + 5, "ellipsis");

    if (totalPages > 1) createButton(totalPages, totalPages, "last");
    if (currentPage < totalPages) createButton(">", currentPage + 1, "next");
}
