/**
 * stars.js — Demoscene starfield + Space Invaders easter egg
 * Starfield reacts to mouse. Ship follows cursor.
 * Click to shoot. Aliens drift from top. Score top-right.
 * Respects prefers-reduced-motion (hidden via CSS).
 *
 * Copyright 2026 Vivian Voss. All rights reserved.
 */
(function () {
    var c = document.getElementById("stars");
    if (!c) return;
    var ctx = c.getContext("2d");
    var w, h;
    var mx = 0, my = 0;
    var hasMouse = false;

    /* --- Stars ------------------------------------------------------------ */
    var stars = [];
    var NSTARS = 120;

    function initStars() {
        stars = [];
        for (var i = 0; i < NSTARS; i++) {
            stars.push({
                x: Math.random(), y: Math.random(),
                z: Math.random(), s: 0.5 + Math.random() * 1.5
            });
        }
    }

    function drawStars() {
        var dx = (mx / w - 0.5) * 2;
        var dy = (my / h - 0.5) * 2;
        for (var i = 0; i < NSTARS; i++) {
            var s = stars[i];
            var px = (s.x + dx * s.z * 0.03) * w;
            var py = (s.y + dy * s.z * 0.03) * h;
            var a = 0.15 + s.z * 0.25;
            var r = s.s * (0.5 + s.z * 0.5);
            ctx.beginPath();
            ctx.arc(((px % w) + w) % w, ((py % h) + h) % h, r, 0, 6.28);
            ctx.fillStyle = "oklch(90% 0 0 / " + a + ")";
            ctx.fill();
        }
    }

    /* --- Ship (pixel art, Space Invaders style) --------------------------- */
    var SHIP = [
        "    ##    ",
        "   ####   ",
        "   ####   ",
        "  ######  ",
        " ######## ",
        " # #### # ",
        " #  ##  # ",
        "   #  #   "
    ];

    function drawShip(x, y) {
        if (!hasMouse) return;
        var px = 3;
        var sw = SHIP[0].length * px;
        var sh = SHIP.length * px;
        var ox = x - sw / 2;
        var oy = y - sh / 2;
        ctx.fillStyle = "oklch(75% 0.12 230 / 0.7)";
        for (var r = 0; r < SHIP.length; r++) {
            for (var col = 0; col < SHIP[r].length; col++) {
                if (SHIP[r][col] === "#") {
                    ctx.fillRect(ox + col * px, oy + r * px, px, px);
                }
            }
        }
    }

    /* --- Aliens (pixel art) ----------------------------------------------- */
    var ALIEN = [
        "  #   #  ",
        "   # #   ",
        "  #####  ",
        " ## # ## ",
        "#########",
        "# ##### #",
        "# #   # #",
        "   ## #  "
    ];

    var aliens = [];
    var SPAWN_INTERVAL = 3000;
    var lastSpawn = 0;

    function spawnAlien(now) {
        if (now - lastSpawn < SPAWN_INTERVAL) return;
        lastSpawn = now;
        aliens.push({
            x: 40 + Math.random() * (w - 80),
            y: -30,
            speed: 0.3 + Math.random() * 0.5,
            drift: (Math.random() - 0.5) * 0.3,
            alive: true
        });
        if (aliens.length > 12) {
            for (var i = 0; i < aliens.length; i++) {
                if (!aliens[i].alive) { aliens.splice(i, 1); break; }
            }
        }
    }

    function drawAlien(a) {
        if (!a.alive) return;
        var px = 3;
        var aw = ALIEN[0].length * px;
        var ah = ALIEN.length * px;
        var ox = a.x - aw / 2;
        var oy = a.y - ah / 2;
        ctx.fillStyle = "oklch(65% 0.15 140 / 0.6)";
        for (var r = 0; r < ALIEN.length; r++) {
            for (var col = 0; col < ALIEN[r].length; col++) {
                if (ALIEN[r][col] === "#") {
                    ctx.fillRect(ox + col * px, oy + r * px, px, px);
                }
            }
        }
    }

    function updateAliens() {
        for (var i = aliens.length - 1; i >= 0; i--) {
            var a = aliens[i];
            if (!a.alive) continue;
            a.y += a.speed;
            a.x += a.drift;
            if (a.y > h + 40) { aliens.splice(i, 1); }
        }
    }

    /* --- Bullets ---------------------------------------------------------- */
    var bullets = [];

    function shoot() {
        if (!hasMouse) return;
        bullets.push({ x: mx, y: my - 15, speed: 8 });
    }

    function updateBullets() {
        for (var i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bullets[i].speed;
            if (bullets[i].y < -10) { bullets.splice(i, 1); }
        }
    }

    function drawBullets() {
        ctx.fillStyle = "oklch(68% 0.18 35 / 0.8)";
        for (var i = 0; i < bullets.length; i++) {
            ctx.fillRect(bullets[i].x - 1, bullets[i].y, 3, 8);
        }
    }

    /* --- Explosions ------------------------------------------------------- */
    var explosions = [];

    function addExplosion(x, y) {
        var particles = [];
        for (var i = 0; i < 8; i++) {
            var angle = (i / 8) * 6.28;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * (1 + Math.random() * 2),
                vy: Math.sin(angle) * (1 + Math.random() * 2),
                life: 1
            });
        }
        explosions.push(particles);
    }

    function updateExplosions() {
        for (var i = explosions.length - 1; i >= 0; i--) {
            var p = explosions[i];
            var allDead = true;
            for (var j = 0; j < p.length; j++) {
                p[j].x += p[j].vx;
                p[j].y += p[j].vy;
                p[j].life -= 0.03;
                if (p[j].life > 0) allDead = false;
            }
            if (allDead) explosions.splice(i, 1);
        }
    }

    function drawExplosions() {
        for (var i = 0; i < explosions.length; i++) {
            var p = explosions[i];
            for (var j = 0; j < p.length; j++) {
                if (p[j].life <= 0) continue;
                ctx.fillStyle = "oklch(68% 0.18 35 / " + p[j].life * 0.7 + ")";
                ctx.fillRect(p[j].x - 1.5, p[j].y - 1.5, 3, 3);
            }
        }
    }

    /* --- Reset ------------------------------------------------------------ */
    function resetGame() {
        aliens = [];
        bullets = [];
        explosions = [];
        lastSpawn = 0;
        score = 0;
        if (scoreEl) scoreEl.textContent = "0";
    }

    /* --- Collision -------------------------------------------------------- */
    var score = 0;
    var scoreEl = document.getElementById("game-score");

    function checkCollisions() {
        for (var i = bullets.length - 1; i >= 0; i--) {
            for (var j = aliens.length - 1; j >= 0; j--) {
                if (!aliens[j].alive) continue;
                var dx = bullets[i].x - aliens[j].x;
                var dy = bullets[i].y - aliens[j].y;
                if (Math.abs(dx) < 14 && Math.abs(dy) < 12) {
                    addExplosion(aliens[j].x, aliens[j].y);
                    aliens[j].alive = false;
                    bullets.splice(i, 1);
                    score++;
                    if (scoreEl) scoreEl.textContent = score;
                    break;
                }
            }
        }
    }

    /* --- Main loop -------------------------------------------------------- */
    function resize() {
        w = c.width = window.innerWidth;
        h = c.height = window.innerHeight;
    }

    function frame(now) {
        ctx.clearRect(0, 0, w, h);
        drawStars();

        if (hasMouse) {
            spawnAlien(now);
            updateAliens();
            updateBullets();
            checkCollisions();
            updateExplosions();

            for (var i = 0; i < aliens.length; i++) drawAlien(aliens[i]);
            drawBullets();
            drawExplosions();
            drawShip(mx, my);
        }

        requestAnimationFrame(frame);
    }

    resize();
    initStars();

    window.addEventListener("resize", resize);

    var gameEnabled = window.matchMedia("(min-width: 560px)").matches;

    document.addEventListener("mousemove", function (e) {
        mx = e.clientX;
        my = e.clientY;
        if (!hasMouse && gameEnabled) {
            hasMouse = true;
            if (scoreEl) scoreEl.parentElement.style.display = "";
            var restartEl = document.querySelector(".game-restart");
            if (restartEl) restartEl.style.display = "";
        }
    });

    c.style.pointerEvents = "none";
    document.addEventListener("click", function (e) {
        if (!gameEnabled) return;
        if (e.target.closest("a, button, nav, input, select, textarea")) return;
        shoot();
    });

    document.addEventListener("keydown", function (e) {
        if (!gameEnabled) return;
        if (e.ctrlKey && e.key === "g") {
            e.preventDefault();
            resetGame();
        }
    });

    /* Touch: ambient drift only, no game */
    if ("ontouchstart" in window) {
        mx = w / 2;
        my = h / 2;
        var t = 0;
        (function drift() {
            t += 0.002;
            mx = w * (0.5 + Math.sin(t) * 0.15);
            my = h * (0.5 + Math.cos(t * 0.7) * 0.1);
            requestAnimationFrame(drift);
        })();
    }

    requestAnimationFrame(frame);
})();
