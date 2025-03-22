document.addEventListener("click", function (event) {
    // Mail Links Dropdown
    if (!mailLinksDropdown.contains(event.target) && !mailLinksDropdownButton.contains(event.target)) {
        mailLinksDropdownButton.classList.remove("active")
        mailLinksDropdown.classList.remove("active");
    }

    // Drawer sidebar
    if (!drawer.contains(event.target) && !drawerButton.contains(event.target)) {
        drawer.classList.remove("open");
        drawerOverlay.classList.remove("show")
    }

});
