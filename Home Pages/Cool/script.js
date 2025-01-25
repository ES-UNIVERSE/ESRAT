document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("navbarToggler");

    navToggle.addEventListener("click", function () {
        navToggle.classList.toggle("open");
        navMenu.classList.toggle("show");
    });
});
