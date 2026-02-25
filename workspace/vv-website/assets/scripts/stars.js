/**
 * stars.js — Demoscene starfield + Space Invaders easter egg
 * Starfield reacts to mouse. Ship follows cursor.
 * Click to shoot. Aliens drift from top. Score top-right.
 * Aliens reaching bottom deduct a point (minimum 0).
 * Alien touching ship costs a life (3 lives, shown as hearts).
 * Game state persists across page reloads via localStorage.
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

    var STORAGE_KEY = "vv-invaders";

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

    var ELITE = [
        " # # ",
        "## ##",
        "# # #",
        "## ##",
        " # # "
    ];

    var HEART = [
        " ## ## ",
        "#######",
        "#######",
        " ##### ",
        "  ###  ",
        "   #   "
    ];

    function getLevel() {
        return Math.floor(score / 50) + 1;
    }

    function speedMul() {
        return Math.min(3, 1 + (getLevel() - 1) * 0.1);
    }

    function spawnInterval() {
        var lvl = getLevel();
        if (lvl <= 21) return 3000;
        return Math.max(800, 3000 - (lvl - 21) * 100);
    }

    var aliens = [];
    var SPAWN_INTERVAL = 3000;
    var ELITE_INTERVAL = 15000;
    var HEALER_INTERVAL = 45000;
    var lastSpawn = 0;
    var lastElite = 0;
    var lastHealer = 0;

    function spawnAlien(now) {
        if (now - lastHealer >= HEALER_INTERVAL) {
            lastHealer = now;
            aliens.push({
                x: 40 + Math.random() * (w - 80),
                y: -30,
                speed: 0.4 + Math.random() * 0.3,
                drift: 0,
                alive: true,
                healer: true,
                t: Math.random() * 6.28,
                t2: Math.random() * 6.28
            });
        }
        if (now - lastElite >= ELITE_INTERVAL) {
            lastElite = now;
            aliens.push({
                x: 40 + Math.random() * (w - 80),
                y: -30,
                speed: 0.8 + Math.random() * 0.6,
                drift: 0,
                alive: true,
                elite: true,
                t: Math.random() * 6.28
            });
        }
        if (now - lastSpawn < spawnInterval()) return;
        lastSpawn = now;
        var count = Math.min(getLevel(), 21);
        for (var s = 0; s < count; s++) {
            aliens.push({
                x: 40 + Math.random() * (w - 80),
                y: -30 - s * 20,
                speed: 0.3 + Math.random() * 0.5,
                drift: (Math.random() - 0.5) * 0.3,
                alive: true,
                elite: false
            });
        }
        if (aliens.length > 14) {
            for (var i = 0; i < aliens.length; i++) {
                if (!aliens[i].alive) { aliens.splice(i, 1); break; }
            }
        }
    }

    function drawAlien(a, now) {
        if (!a.alive) return;
        var sprite = a.healer ? HEART : a.elite ? ELITE : ALIEN;
        var px = a.healer ? 2 : a.elite ? 2 : 3;
        var aw = sprite[0].length * px;
        var ah = sprite.length * px;
        var ox = a.x - aw / 2;
        var oy = a.y - ah / 2;
        var dim = paused ? 0.3 : 1;
        if (a.healer) {
            var blink = 0.3 + 0.5 * Math.abs(Math.sin(now * 0.004));
            ctx.fillStyle = "oklch(65% 0.2 25 / " + (blink * dim) + ")";
        } else if (a.elite) {
            ctx.fillStyle = "oklch(70% 0.2 330 / " + (0.8 * dim) + ")";
        } else {
            ctx.fillStyle = "oklch(65% 0.15 140 / " + (0.6 * dim) + ")";
        }
        for (var r = 0; r < sprite.length; r++) {
            for (var col = 0; col < sprite[r].length; col++) {
                if (sprite[r][col] === "#") {
                    ctx.fillRect(ox + col * px, oy + r * px, px, px);
                }
            }
        }
    }

    function updateAliens() {
        var sm = speedMul();
        for (var i = aliens.length - 1; i >= 0; i--) {
            var a = aliens[i];
            if (!a.alive) continue;
            a.y += a.speed * sm;
            if (a.healer) {
                a.t += 0.03;
                a.t2 += 0.07;
                a.x += Math.sin(a.t) * 3 + Math.cos(a.t2) * 1.5;
            } else if (a.elite) {
                a.t += 0.06;
                a.x += Math.sin(a.t) * 2.5;
            } else {
                a.x += a.drift;
            }
            if (a.x < 20) { a.x = 20; a.drift = Math.abs(a.drift || 0.3); }
            if (a.x > w - 20) { a.x = w - 20; a.drift = -Math.abs(a.drift || 0.3); }
            if (a.y > h + 40) {
                if (a.healer) {
                    aliens.splice(i, 1);
                } else {
                    var wasElite = a.elite;
                    var penalty = wasElite ? 10 : 1;
                    aliens.splice(i, 1);
                    if (wasElite) dualShot = false;
                    if (score <= 0) {
                        enterGameOver();
                    } else {
                        score = Math.max(0, score - penalty);
                        if (scoreEl) scoreEl.textContent = score;
                        updateLevel();
                    }
                }
                saveState();
            }
        }
    }

    /* --- Bullets ---------------------------------------------------------- */
    var bullets = [];
    var dualShot = false;

    function shoot() {
        if (!hasMouse || lives <= 0 || paused) return;
        if (dualShot) {
            bullets.push({ x: mx - 8, y: my - 15, speed: 8 });
            bullets.push({ x: mx + 8, y: my - 15, speed: 8 });
        } else {
            bullets.push({ x: mx, y: my - 15, speed: 8 });
        }
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

    /* --- Persistence ------------------------------------------------------ */
    function saveState() {
        try {
            var state = {
                score: score,
                lives: lives,
                dualShot: dualShot,
                aliens: []
            };
            for (var i = 0; i < aliens.length; i++) {
                if (aliens[i].alive) {
                    var sa = {
                        x: aliens[i].x,
                        y: aliens[i].y,
                        speed: aliens[i].speed,
                        drift: aliens[i].drift
                    };
                    if (aliens[i].healer) {
                        sa.healer = true;
                        sa.t = aliens[i].t;
                        sa.t2 = aliens[i].t2;
                    } else if (aliens[i].elite) {
                        sa.elite = true;
                        sa.t = aliens[i].t;
                    }
                    state.aliens.push(sa);
                }
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {}
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            var state = JSON.parse(raw);
            if (typeof state.score === "number") {
                score = Math.max(0, state.score);
                if (scoreEl) scoreEl.textContent = score;
            }
            if (typeof state.lives === "number") {
                lives = Math.max(0, Math.min(MAX_LIVES, state.lives));
            }
            updateLevel();
            updateLivesDisplay();
            if (lives <= 0) enterGameOver();
            if (state.dualShot) dualShot = true;
            if (state.aliens && state.aliens.length) {
                for (var i = 0; i < state.aliens.length; i++) {
                    var a = state.aliens[i];
                    var restored = {
                        x: a.x, y: a.y,
                        speed: a.speed, drift: a.drift || 0,
                        alive: true, elite: !!a.elite,
                        healer: !!a.healer
                    };
                    if (a.healer) {
                        restored.t = a.t || 0;
                        restored.t2 = a.t2 || 0;
                    } else if (a.elite) restored.t = a.t || 0;
                    aliens.push(restored);
                }
            }
        } catch (e) {}
    }

    /* --- Reset ------------------------------------------------------------ */
    var score = 0;
    var lives = 5;
    var MAX_LIVES = 5;
    var scoreEl = document.getElementById("game-score");
    var levelEl = document.getElementById("game-level");
    var livesEl = document.getElementById("game-lives");

    function updateLevel() {
        if (levelEl) levelEl.textContent = "Level " + getLevel();
    }

    function updateLivesDisplay() {
        if (!livesEl) return;
        livesEl.innerHTML = "";
        for (var i = 0; i < MAX_LIVES; i++) {
            var span = document.createElement("span");
            span.textContent = "\u2665";
            if (i >= lives) span.style.opacity = "0.2";
            livesEl.appendChild(span);
        }
    }

    function resetGame() {
        aliens = [];
        bullets = [];
        explosions = [];
        lastSpawn = 0;
        lastElite = 0;
        lastHealer = 0;
        score = 0;
        lives = MAX_LIVES;
        dualShot = false;
        paused = false;
        if (pauseEl) { pauseEl.innerHTML = "&#x23F8;"; pauseEl.style.fontSize = ""; }
        if (pauseHintEl) pauseHintEl.textContent = "Space Pause";
        if (scoreEl) scoreEl.textContent = "0";
        updateLevel();
        updateLivesDisplay();
        saveState();
    }

    /* --- Collision -------------------------------------------------------- */
    function checkCollisions() {
        for (var i = bullets.length - 1; i >= 0; i--) {
            for (var j = aliens.length - 1; j >= 0; j--) {
                if (!aliens[j].alive) continue;
                var dx = bullets[i].x - aliens[j].x;
                var dy = bullets[i].y - aliens[j].y;
                var hitW = aliens[j].healer ? 7 : aliens[j].elite ? 8 : 14;
                var hitH = aliens[j].healer ? 6 : aliens[j].elite ? 6 : 12;
                if (Math.abs(dx) < hitW && Math.abs(dy) < hitH) {
                    addExplosion(aliens[j].x, aliens[j].y);
                    if (aliens[j].healer) {
                        lives = Math.min(MAX_LIVES, lives + 1);
                        updateLivesDisplay();
                    } else {
                        var points = aliens[j].elite ? 10 : 1;
                        if (aliens[j].elite) dualShot = true;
                        score += points;
                        if (scoreEl) scoreEl.textContent = score;
                        updateLevel();
                    }
                    aliens[j].alive = false;
                    bullets.splice(i, 1);
                    saveState();
                    break;
                }
            }
        }
    }

    /* --- Ship collision --------------------------------------------------- */
    var shipInvuln = 0;

    function checkShipCollision(now) {
        if (lives <= 0) return;
        if (now < shipInvuln) return;
        var shipW = 15;
        var shipH = 12;
        for (var i = aliens.length - 1; i >= 0; i--) {
            var a = aliens[i];
            if (!a.alive || a.healer) continue;
            var dx = Math.abs(a.x - mx);
            var dy = Math.abs(a.y - my);
            var aW = a.elite ? 5 : 14;
            var aH = a.elite ? 5 : 12;
            if (dx < (shipW + aW) / 2 && dy < (shipH + aH) / 2) {
                addExplosion(a.x, a.y);
                a.alive = false;
                lives--;
                shipInvuln = now + 1500;
                updateLivesDisplay();
                if (lives <= 0) enterGameOver();
                saveState();
                break;
            }
        }
    }

    /* --- Pause ------------------------------------------------------------ */
    var paused = false;
    var pausedAt = 0;
    var pauseEl = document.getElementById("game-pause");
    var pauseHintEl = document.getElementById("game-pause-hint");
    var pauseWrapEl = document.getElementById("game-pause-wrap");

    function togglePause() {
        if (gameOver || lives <= 0) return;
        paused = !paused;
        if (paused) {
            pausedAt = performance.now();
        } else {
            var elapsed = performance.now() - pausedAt;
            lastSpawn += elapsed;
            lastElite += elapsed;
            lastHealer += elapsed;
            if (shipInvuln > 0) shipInvuln += elapsed;
        }
        if (pauseEl) {
            pauseEl.innerHTML = paused ? "&#x25B6;" : "&#x23F8;";
            pauseEl.style.fontSize = paused ? "calc(var(--unit) * 8)" : "";
        }
        if (pauseHintEl) pauseHintEl.textContent = paused ? "Space Resume" : "Space Pause";
    }

    /* --- Game over -------------------------------------------------------- */
    var gameOver = false;
    var gameOverTime = 0;
    var restartEl = document.querySelector(".game-restart");
    var isGamePage = !document.querySelector("main#content") ||
                     !document.querySelector("main#content").children.length;

    /* 5x5 pixel font for GAME OVER splash */
    var FONT5 = {
        G: ["#####","#    ","# ###","#   #","#####"],
        A: [" ### ","#   #","#####","#   #","#   #"],
        M: ["#   #","## ##","# # #","#   #","#   #"],
        E: ["#####","#    ","#### ","#    ","#####"],
        O: [" ### ","#   #","#   #","#   #"," ### "],
        V: ["#   #","#   #"," # # "," # # ","  #  "],
        R: ["#### ","#   #","#### ","#  # ","#   #"],
        " ": ["     ","     ","     ","     ","     "]
    };

    function drawGameOverSplash(now) {
        if (!isGamePage || !gameOver) return;
        var elapsed = now - gameOverTime;
        var fade = Math.min(1, elapsed / 800);

        var text = "GAME OVER";
        var px = Math.max(4, Math.floor(w / 80));
        var gap = px;
        var charW = 5 * px + gap;
        var totalW = text.length * charW - gap;
        var totalH = 5 * px;
        var ox = (w - totalW) / 2;
        var oy = (h - totalH) / 2 - px * 3;

        /* dark overlay */
        ctx.fillStyle = "oklch(0% 0 0 / " + (fade * 0.6) + ")";
        ctx.fillRect(0, 0, w, h);

        for (var ci = 0; ci < text.length; ci++) {
            var ch = text[ci];
            var glyph = FONT5[ch];
            if (!glyph) continue;

            for (var row = 0; row < 5; row++) {
                for (var col = 0; col < 5; col++) {
                    if (glyph[row][col] !== "#") continue;

                    var bx = ox + ci * charW + col * px;
                    var by = oy + row * px;

                    /* wave: each pixel oscillates based on position */
                    var wave = Math.sin(elapsed * 0.003 + ci * 0.7 + row * 0.4) * px * 1.5;
                    by += wave;

                    /* colour pulse per letter */
                    var hue = 35 + Math.sin(elapsed * 0.002 + ci * 0.5) * 15;
                    var alpha = fade * (0.7 + 0.3 * Math.sin(elapsed * 0.004 + ci * 0.3));

                    ctx.fillStyle = "oklch(68% 0.18 " + hue + " / " + alpha + ")";
                    ctx.fillRect(bx, by, px, px);
                }
            }
        }

        /* "Press Key" blink under the text */
        if (elapsed > 1200 && Math.floor(elapsed / 500) % 2 === 0) {
            var pressText = "PRESS KEY";
            var px2 = Math.max(2, Math.floor(px / 2));
            var gap2 = px2;
            var charW2 = 5 * px2 + gap2;
            var totalW2 = pressText.length * charW2 - gap2;
            var ox2 = (w - totalW2) / 2;
            var oy2 = oy + totalH + px * 6;

            var FONT_EXTRA = {
                P: ["#### ","#   #","#### ","#    ","#    "],
                S: [" ####","#    "," ### ","    #","#### "],
                K: ["#  # ","# #  ","##   ","# #  ","#  # "],
                Y: ["#   #"," # # ","  #  ","  #  ","  #  "]
            };
            var allFont = {};
            for (var k in FONT5) allFont[k] = FONT5[k];
            for (var k2 in FONT_EXTRA) allFont[k2] = FONT_EXTRA[k2];

            for (var pi = 0; pi < pressText.length; pi++) {
                var pch = pressText[pi];
                var pg = allFont[pch];
                if (!pg) continue;
                for (var pr = 0; pr < 5; pr++) {
                    for (var pc = 0; pc < 5; pc++) {
                        if (pg[pr][pc] !== "#") continue;
                        ctx.fillStyle = "oklch(68% 0.18 35 / " + (fade * 0.5) + ")";
                        ctx.fillRect(ox2 + pi * charW2 + pc * px2, oy2 + pr * px2, px2, px2);
                    }
                }
            }
        }
    }

    function enterGameOver() {
        gameOver = true;
        gameOverTime = performance.now();
        if (restartEl) {
            restartEl.textContent = "Press Key";
            restartEl.style.animation = "game-blink 1s step-end infinite";
        }
    }

    function leaveGameOver() {
        gameOver = false;
        resetGame();
        if (restartEl) {
            restartEl.textContent = "Ctrl+G Restart";
            restartEl.style.animation = "";
        }
    }

    /* --- Main loop -------------------------------------------------------- */
    var saveTimer = 0;

    function resize() {
        w = c.width = window.innerWidth;
        h = c.height = window.innerHeight;
    }

    function frame(now) {
        ctx.clearRect(0, 0, w, h);
        drawStars();

        if (hasMouse) {
            if (paused) {
                for (var i = 0; i < aliens.length; i++) drawAlien(aliens[i], now);
                drawBullets();
            } else {
                if (lives > 0) spawnAlien(now);
                updateAliens();
                updateBullets();
                checkCollisions();
                if (lives > 0) checkShipCollision(now);
                updateExplosions();

                for (var i = 0; i < aliens.length; i++) drawAlien(aliens[i], now);
                drawBullets();
                drawExplosions();
                if (lives > 0) {
                    drawShip(mx, my);
                    if (now < shipInvuln) {
                        ctx.fillStyle = "oklch(75% 0.12 230 / " + (0.15 + 0.15 * Math.sin(now * 0.02)) + ")";
                        ctx.fillRect(mx - 18, my - 14, 36, 28);
                    }
                }

                if (now - saveTimer > 5000) {
                    saveTimer = now;
                    saveState();
                }

                drawGameOverSplash(now);
            }
        }

        requestAnimationFrame(frame);
    }

    resize();
    initStars();
    loadState();

    window.addEventListener("resize", resize);

    var gameEnabled = window.matchMedia("(min-width: 560px)").matches;

    document.addEventListener("mousemove", function (e) {
        mx = e.clientX;
        my = e.clientY;
        if (!hasMouse && gameEnabled) {
            hasMouse = true;
            if (scoreEl) scoreEl.parentElement.style.display = "";
            if (livesEl) livesEl.style.display = "";
            if (pauseWrapEl) pauseWrapEl.style.display = "";
            if (restartEl) restartEl.style.display = "";
            updateLivesDisplay();
        }
    });

    c.style.pointerEvents = "none";
    document.addEventListener("click", function (e) {
        if (!gameEnabled) return;
        if (e.target.closest("#game-pause")) {
            togglePause();
            return;
        }
        if (e.target.closest("a, button, nav, input, select, textarea")) return;
        shoot();
    });

    document.addEventListener("keydown", function (e) {
        if (!gameEnabled) return;
        if (gameOver) {
            e.preventDefault();
            leaveGameOver();
            return;
        }
        if (e.key === " " && !e.target.closest("input, textarea, select, button")) {
            e.preventDefault();
            togglePause();
            return;
        }
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
