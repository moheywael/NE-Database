let drawer = document.querySelector(".msan-cabinet-details-more-info-drawer")
let drawerButton = document.querySelector(".msan-cabinet-details-more-info-drawer-wrapper-button")
let drawerOverlay = document.querySelector(".overlay")

drawerButton.addEventListener("click", ()=>{
    drawer.classList.add("open")
    drawerOverlay.classList.add("show")
})