// Components
let sidebar = document.querySelector("aside.sidebar");
let mailLinksDropdown = document.querySelector(".main-body-owners-infos-title .mail-links-dropdown");
let mailLinksDropdownButton = document.querySelector(".main-body-owners-infos-title .mail-links");

// Buttons
let sidebar_toggle = document.querySelector(".main-header .navbar-header .sidebar-toggle");
let textCopiedButtonAll = document.querySelectorAll(".main-body-view-body-card-text-section");
let ownersMailLinks = document.querySelectorAll(".main-body-view-body-card-text-section");

// Function to enable text copy feature
function enableCopyFeature(elements) {
    if (elements instanceof NodeList) elements = Array.from(elements);
    else if (!Array.isArray(elements)) elements = [elements];

    elements.forEach((element) => {
        if (!(element instanceof Element)) return console.warn("Invalid element:", element);

        element.addEventListener("click", async () => {
            let textContent = element.querySelector("span")?.textContent || "";
            if (!textContent) return console.warn("No text to copy in:", element);

            try {
                await navigator.clipboard.writeText(textContent);
                element.classList.add("copied");
                console.log("Copied:", textContent);

                setTimeout(() => element.classList.remove("copied"), 400);
            } catch (err) {
                console.error("Copy failed:", err);
            }
        });
    });
}

// Event listeners
mailLinksDropdownButton.addEventListener("click", (event) => {
    event.stopPropagation();
    mailLinksDropdown.classList.add("active");
    mailLinksDropdownButton.classList.add("active");
});

sidebar_toggle.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-collapse");
    sidebar_toggle.querySelector("i").classList.toggle("rotate");
});

enableCopyFeature(document.querySelector(".main-body-search-controls-table-controls-total-NEs"));
enableCopyFeature(document.querySelector(".main-body-search-controls-table-controls-total-subs"));
enableCopyFeature(textCopiedButtonAll);

// Sidebar button handling
let sidebarButtons = document.querySelectorAll(".sidebar-body-navigation-list-link");

sidebarButtons.forEach((sidebarButton) => {
    sidebarButton.addEventListener("click", () => {
        sidebarButtons.forEach((btn) => btn.classList.remove("active"));
        sidebarButton.classList.add("active");
    });
});

// Sidebar sync button
let sidebarSyncDataButton = document.querySelector(".sidebar-body-controls-refresh");

sidebarSyncDataButton.addEventListener("click", () => {
    let icon = sidebarSyncDataButton.querySelector("i");

    icon.classList.add("refresh-icon");

    setTimeout(() => {
        icon.classList.remove("refresh-icon");
        showToast("Your changes have been saved!");
    }, 800);
});

// Function to show toast notification
function showToast(message, duration = 3000) {
    let toast = document.querySelector(".popup-notification");
    toast.classList.remove("show", "hide");
    void toast.offsetWidth;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
    }, duration);
}

// Dark mode toggle
let themeModeToggle = document.querySelector(".sidebar-body-controls-website-mode");

themeModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("darkmode");
});

// ======================= Owners Info Update =======================

// let ownersInfoButtons = document.querySelectorAll(".main-body-owners-infos-owners button");
// let selectedFilter = ownersInfoButtons[0]?.textContent.trim() || "REGION"; // Default filter

// ownersInfoButtons.forEach((ownersInfoButton) => {
//     ownersInfoButton.addEventListener("click", () => {
//         ownersInfoButtons.forEach((btn) => btn.classList.remove("selected"));
//         ownersInfoButton.classList.add("selected");

//         selectedFilter = ownersInfoButton.textContent.trim();
//         // updateOwnersInfo();
//     });
// });



// Function to update owners info dynamically
// function updateOwnersInfo() {
//     if (!ownersInfoContainer) return;

//     ownersInfoContainer.innerHTML = ""; // Clear content

//     if (!firstVisibleCabinet) {
//         console.warn("No visible cabinet found.");
//         return;
//     }

//     let exchangeID = firstVisibleCabinet["Exchange ID"];
//     let filteredOwners = ownersData.filter(owner => owner["Exchange ID"] === exchangeID && owner["Fault Group"] === selectedFilter);

//     filteredOwners.forEach(owner => {
//         let ownerCard = ownersInfoTemplate.content.cloneNode(true).children[0];

//         ownerCard.querySelector(".role-name").textContent = owner.Owner || "Unknown";
//         let emailElement = ownerCard.querySelector(".mail span a");
//         emailElement.textContent = owner["Primary E-mail"] || "N/A";
//         emailElement.href = `mailto:${owner["Primary E-mail"]}`;

//         let phoneElement = ownerCard.querySelector(".phone p");
//         phoneElement.textContent = owner["Primary Phone"] || "N/A";

//         ownersInfoContainer.appendChild(ownerCard);
//     });

//     if (!filteredOwners.length) {
//         ownersInfoContainer.innerHTML = "<p>No owners found.</p>";
//     }
// }





// ======================= Search Functionality =======================

// let searchTable = document.querySelector("#searchTable");

// searchTable?.addEventListener("input", (e) => {
//     const inputValue = e.target.value.trim().toLowerCase();
//     let firstVisibleCabinet = null;

//     cabinetData.forEach((cabinet) => {
//         const isVisible =
//             (cabinet.MSANCode?.toLowerCase() || "").includes(inputValue) ||
//             (cabinet.Vendor?.toLowerCase() || "").includes(inputValue) ||
//             (cabinet.MsanName?.toLowerCase() || "").includes(inputValue) ||
//             (cabinet.City?.toLowerCase() || "").includes(inputValue) ||
//             (cabinet.Exchange?.toLowerCase() || "").includes(inputValue);

//         cabinet.element.classList.toggle("hide-element", !isVisible);

//         if (isVisible && !firstVisibleCabinet) {
//             firstVisibleCabinet = cabinet;
//         }
//     });

//     updateTableControls();
//     updatePagination();
//     displayPage(1);
//     updateCabinetDetails(firstVisibleCabinet);
//     updateCabinetMoreDetails(firstVisibleCabinet);
//     updateOwnersInfo();
// });
