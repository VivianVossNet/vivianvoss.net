/**
 * stars.js — Demoscene starfield background
 * Reacts to mouse movement. Ambient drift on mobile.
 * Respects prefers-reduced-motion (hidden via CSS).
 *
 * Copyright 2026 Vivian Voss. All rights reserved.
 */
(function () {
    var c = document.getElementById("stars");
    if (!c) return;
    var ctx = c.getContext("2d");
    var stars = [];
    var N = 120;
    var mx = 0.5, my = 0.5;
    var active = false;
    var raf = 0;
    var w, h;

    function resize() {
        w = c.width = c.offsetWidth;
        h = c.height = c.offsetHeight;
    }

    function init() {
        stars = [];
        for (var i = 0; i < N; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random(),
                z: Math.random(),
                s: 0.5 + Math.random() * 1.5
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        var dx = (mx - 0.5) * 2;
        var dy = (my - 0.5) * 2;
        var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        for (var i = 0; i < N; i++) {
            var s = stars[i];
            var px = (s.x + dx * s.z * 0.03) * w;
            var py = (s.y + dy * s.z * 0.03) * h;
            var a = 0.15 + s.z * 0.25;
            var r = s.s * (0.5 + s.z * 0.5);
            ctx.beginPath();
            ctx.arc(px % w, py % h, r, 0, 6.28);
            ctx.fillStyle = dark
                ? "oklch(90% 0 0 / " + a + ")"
                : "oklch(40% 0 0 / " + a + ")";
            ctx.fill();
        }
    }

    function tick() {
        draw();
        if (active) raf = requestAnimationFrame(tick);
    }

    function start() {
        if (!active) { active = true; tick(); }
    }

    function stop() {
        active = false;
        cancelAnimationFrame(raf);
    }

    resize();
    init();
    draw();

    window.addEventListener("resize", function () { resize(); draw(); });

    document.addEventListener("mousemove", function (e) {
        mx = e.clientX / w;
        my = e.clientY / h;
        start();
        clearTimeout(stop._t);
        stop._t = setTimeout(stop, 2000);
    });

    if ("ontouchstart" in window) {
        var t = 0;
        (function drift() {
            t += 0.002;
            mx = 0.5 + Math.sin(t) * 0.15;
            my = 0.5 + Math.cos(t * 0.7) * 0.1;
            draw();
            requestAnimationFrame(drift);
        })();
    }
})();
