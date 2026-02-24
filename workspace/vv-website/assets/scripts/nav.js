/**
 * nav.js — Mobile navigation toggle
 * Copyright 2026 Vivian Voss. All rights reserved.
 */
(function () {
    var btn = document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", !open);
        nav.classList.toggle("is-open");
    });
})();
