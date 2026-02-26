/**
 * stars.js — Demoscene starfield + Space Invaders easter egg
 * Starfield reacts to mouse. Ship follows cursor.
 * Click to shoot. Aliens drift from top. Score top-right.
 * Aliens reaching bottom cost a life. Ship collision costs a life.
 * Top-5 leaderboard with arcade-style name entry on /game page.
 * Game state persists across page reloads via localStorage.
 * Respects prefers-reduced-motion (hidden via CSS).
 *
 * Copyright 2026 Vivian Voss. All rights reserved.
 */
(function () {
    var c = document.getElementById("stars");
    if (!c) return;
    var ctx = c.getContext("2d", { desynchronized: true });
    c.style.willChange = "transform";
    var w, h;
    var mx = 0, my = 0;
    var hasMouse = false;

    var STORAGE_KEY = "vv-invaders";

    /* --- Reading Mode ------------------------------------------------------ */
    var readingMode = localStorage.getItem("vv-reading-mode") === "true";
    var readingBtn = document.querySelector(".reading-toggle");

    function applyReadingMode(on) {
        readingMode = on;
        document.documentElement.classList.toggle("reading-mode", on);
        if (readingBtn) readingBtn.setAttribute("aria-pressed", on ? "true" : "false");
        localStorage.setItem("vv-reading-mode", on ? "true" : "false");
    }

    if (readingMode) applyReadingMode(true);

    if (readingBtn) {
        readingBtn.addEventListener("click", function () {
            applyReadingMode(!readingMode);
        });
    }

    /* --- Audio (8-bit chiptune, Web Audio API) ----------------------------- */
    var audioCtx = null;
    var musicGain = null;
    var musicPlaying = false;

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            musicGain = audioCtx.createGain();
            musicGain.gain.value = 0.18;
            musicGain.connect(audioCtx.destination);
        } catch (e) {}
    }

    /* --- SFX --- */
    function sfxPew() {
        if (!audioCtx || !isGamePage || audioMuted) return;
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.08);
        g.gain.setValueAtTime(0.12, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    }

    function sfxHit() {
        if (!audioCtx || !isGamePage || audioMuted) return;
        /* noise burst — short static crash */
        var len = audioCtx.sampleRate * 0.15;
        var buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buf;
        var g = audioCtx.createGain();
        g.gain.setValueAtTime(0.2, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        src.connect(g);
        g.connect(audioCtx.destination);
        src.start();
    }

    /* --- Chiptune music --- */
    /* Notes: C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494
       Minor pentatonic in A: A C D E G — spacey and driving */
    var TUNE_BPM = 135;
    var TUNE_STEP = 60 / TUNE_BPM / 4; /* 16th note duration */
    var STEPS_PER_SECTION = 32; /* 2 bars per section */

    /* Section A — main theme (A minor pentatonic, driving) */
    var SEC_A = {
        lead: [
            440, 0, 523, 0, 587, 587, 0, 659,  0, 784, 0, 659, 587, 0, 523, 0,
            440, 0, 587, 0, 659, 0, 784, 880,  0, 784, 659, 0, 587, 523, 0, 0
        ],
        bass: [
            110, 0, 0, 0, 131, 0, 0, 0, 147, 0, 0, 0, 165, 0, 131, 0,
            110, 0, 0, 0, 147, 0, 0, 0, 165, 0, 0, 0, 196, 0, 165, 0
        ],
        arp: [
            220, 262, 330, 220, 262, 330, 262, 330,  220, 262, 330, 220, 330, 262, 220, 330,
            220, 294, 349, 220, 294, 349, 294, 349,  220, 294, 349, 220, 349, 294, 220, 294
        ],
        drums: [
            1, 0, 2, 0, 0, 0, 2, 0, 1, 0, 2, 0, 0, 2, 0, 2,
            1, 0, 2, 0, 0, 0, 2, 0, 1, 1, 2, 0, 0, 2, 2, 0
        ]
    };
    /* Section B — tension builder (higher, syncopated) */
    var SEC_B = {
        lead: [
            659, 0, 784, 0, 880, 0, 784, 659,  0, 587, 0, 659, 784, 0, 880, 0,
            1047, 0, 880, 0, 784, 659, 0, 587,  0, 523, 0, 587, 659, 0, 0, 0
        ],
        bass: [
            165, 0, 0, 0, 196, 0, 0, 0, 220, 0, 0, 0, 196, 0, 165, 0,
            131, 0, 0, 0, 147, 0, 0, 0, 165, 0, 0, 0, 131, 0, 110, 0
        ],
        arp: [
            330, 392, 494, 330, 392, 494, 392, 494,  330, 392, 494, 330, 494, 392, 330, 494,
            262, 330, 392, 262, 330, 392, 330, 392,  262, 330, 392, 262, 392, 330, 262, 330
        ],
        drums: [
            1, 0, 2, 2, 0, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0,
            1, 0, 2, 2, 0, 0, 2, 0, 1, 0, 0, 2, 1, 2, 0, 2
        ]
    };
    /* Section C — breakdown (sparse, bass-heavy) */
    var SEC_C = {
        lead: [
            0, 0, 0, 0, 440, 0, 0, 0,  0, 0, 523, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 587, 0, 0, 0,  659, 0, 0, 0, 587, 0, 0, 0
        ],
        bass: [
            110, 110, 0, 110, 0, 0, 110, 0, 110, 110, 0, 110, 0, 0, 131, 0,
            147, 147, 0, 147, 0, 0, 147, 0, 131, 131, 0, 131, 0, 0, 110, 0
        ],
        arp: [
            0, 0, 0, 0, 0, 0, 0, 0,  220, 262, 330, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,  294, 349, 440, 0, 0, 0, 0, 0
        ],
        drums: [
            1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0
        ]
    };
    /* Section D — climax (full energy, octave higher) */
    var SEC_D = {
        lead: [
            880, 0, 1047, 0, 1175, 1175, 0, 1319,  0, 1568, 0, 1319, 1175, 0, 1047, 0,
            880, 0, 1047, 1175, 0, 1319, 1568, 0,  1760, 0, 1568, 0, 1319, 1175, 1047, 0
        ],
        bass: [
            220, 0, 220, 0, 262, 0, 262, 0, 294, 0, 294, 0, 330, 0, 262, 0,
            220, 0, 220, 0, 294, 0, 294, 0, 330, 0, 330, 0, 392, 0, 330, 0
        ],
        arp: [
            440, 523, 659, 440, 523, 659, 523, 659,  440, 523, 659, 440, 659, 523, 440, 659,
            440, 587, 698, 440, 587, 698, 587, 698,  440, 587, 698, 440, 698, 587, 440, 587
        ],
        drums: [
            1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 2,
            1, 0, 2, 0, 1, 0, 2, 0, 1, 1, 2, 0, 1, 2, 1, 2
        ]
    };

    /* Song structure: A A B A  C C D A — each section plays 2 bars, total 16 bars */
    var SONG = [SEC_A, SEC_A, SEC_B, SEC_A, SEC_C, SEC_C, SEC_D, SEC_A];

    var musicBuffer = null;
    var musicSource = null;

    /* Render full song into an offline buffer for seamless looping */
    function renderChiptune(cb) {
        if (musicBuffer) { cb(musicBuffer); return; }
        var sr = audioCtx.sampleRate;
        var sectionLen = STEPS_PER_SECTION * TUNE_STEP;
        var totalLen = SONG.length * sectionLen;
        var samples = Math.ceil(sr * totalLen);
        var offline = new OfflineAudioContext(1, samples, sr);
        var master = offline.createGain();
        master.gain.value = 1;
        master.connect(offline.destination);

        function addTone(freq, start, dur, vol, type) {
            var osc = offline.createOscillator();
            var g = offline.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            g.gain.setValueAtTime(vol, start);
            g.gain.setValueAtTime(0.001, start + dur);
            osc.connect(g);
            g.connect(master);
            osc.start(start);
            osc.stop(start + dur);
        }

        for (var si = 0; si < SONG.length; si++) {
            var sec = SONG[si];
            var base = si * sectionLen;

            for (var i = 0; i < STEPS_PER_SECTION; i++) {
                var t = base + i * TUNE_STEP;
                /* Lead — square */
                if (sec.lead[i]) addTone(sec.lead[i], t, TUNE_STEP * 0.8, 0.28, "square");
                /* Bass — triangle */
                if (sec.bass[i]) addTone(sec.bass[i], t, TUNE_STEP * 0.9, 0.35, "triangle");
                /* Arpeggio — square, quiet */
                if (sec.arp[i]) addTone(sec.arp[i], t, TUNE_STEP * 0.5, 0.08, "square");
                /* Drums */
                if (sec.drums[i] === 1) {
                    var osc = offline.createOscillator();
                    var g = offline.createGain();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(150, t);
                    osc.frequency.exponentialRampToValueAtTime(40, t + 0.06);
                    g.gain.setValueAtTime(0.4, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
                    osc.connect(g);
                    g.connect(master);
                    osc.start(t);
                    osc.stop(t + 0.08);
                } else if (sec.drums[i] === 2) {
                    var len = Math.floor(sr * 0.03);
                    var buf = offline.createBuffer(1, len, sr);
                    var d = buf.getChannelData(0);
                    for (var j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / len);
                    var src = offline.createBufferSource();
                    src.buffer = buf;
                    var g = offline.createGain();
                    g.gain.setValueAtTime(0.15, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
                    src.connect(g);
                    g.connect(master);
                    src.start(t);
                }
            }
        }

        offline.startRendering().then(function (rendered) {
            musicBuffer = rendered;
            cb(rendered);
        });
    }

    function startMusic() {
        if (!isGamePage || musicPlaying || audioMuted) return;
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === "suspended") audioCtx.resume();
        musicPlaying = true;
        renderChiptune(function (buf) {
            if (!musicPlaying) return;
            musicSource = audioCtx.createBufferSource();
            musicSource.buffer = buf;
            musicSource.loop = true;
            musicSource.connect(musicGain);
            musicSource.start();
        });
    }

    function stopMusic() {
        musicPlaying = false;
        if (musicSource) {
            try { musicSource.stop(); } catch (e) {}
            musicSource = null;
        }
    }

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

    /* --- Thruster trail (Tron-style) ---------------------------------------- */
    var trail = [];
    var TRAIL_MAX = 12;

    function updateTrail(x, y) {
        var px = 3;
        var sh = SHIP.length * px;
        /* two exhaust points: the "#  #" gaps at row 7 (last row), columns 3 and 6 */
        trail.unshift({ x1: x - 3 * px, y1: y + sh / 2, x2: x + 2 * px, y2: y + sh / 2 });
        if (trail.length > TRAIL_MAX) trail.length = TRAIL_MAX;
    }

    function drawTrail(now) {
        if (trail.length < 2) return;
        var px = 3;
        for (var i = 0; i < trail.length; i++) {
            var t = trail[i];
            var age = i / TRAIL_MAX;
            var alpha = (1 - age) * 0.65;
            if (alpha <= 0) continue;
            /* flame gradient: red 10% → yellow 30% → white 60% (from ship outward) */
            var color;
            if (age < 0.1) {
                color = "oklch(62% 0.22 25 / " + alpha + ")";
            } else if (age < 0.4) {
                color = "oklch(82% 0.18 85 / " + alpha + ")";
            } else {
                color = "oklch(95% 0.03 90 / " + alpha + ")";
            }
            ctx.fillStyle = color;
            var spread = age * 2;
            ctx.fillRect(t.x1 - spread, t.y1 + i * 1.5, px, px);
            ctx.fillRect(t.x2 + spread, t.y2 + i * 1.5, px, px);
        }
    }

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

    /* --- Shield bubble pickup (rotating Tron border) ----------------------- */
    function drawBubblePickup(a, now) {
        var dim = (paused || (gameOver && !isGamePage)) ? 0.3 : 1;
        var radius = 12;
        var angle = now * 0.003;

        /* filled interior — subtle white glow */
        ctx.beginPath();
        ctx.arc(a.x, a.y, radius - 2, 0, 6.28);
        var glow = 0.15 + 0.1 * Math.sin(now * 0.005);
        ctx.fillStyle = "oklch(95% 0.03 200 / " + (glow * dim) + ")";
        ctx.fill();

        /* rotating Tron border — draw as segmented arc with cycling hues */
        var segments = 24;
        var segAngle = 6.28 / segments;
        ctx.lineWidth = 2.5;
        for (var i = 0; i < segments; i++) {
            var hue = (angle * 57.3 + i * (360 / segments)) % 360;
            /* white base with green/pink/blue cycling */
            var lightness = 85 + 10 * Math.sin(hue * 0.0174);
            ctx.beginPath();
            ctx.arc(a.x, a.y, radius, angle + i * segAngle, angle + (i + 0.7) * segAngle);
            ctx.strokeStyle = "oklch(" + lightness + "% 0.2 " + hue + " / " + (0.8 * dim) + ")";
            ctx.stroke();
        }
    }

    /* --- Active shield around ship ---------------------------------------- */
    function drawShield(x, y, now) {
        if (!shieldActive) return;
        var remaining = shieldEnd - now;
        if (remaining <= 0) {
            shieldActive = false;
            return;
        }

        var px = 3;
        var shipDiameter = SHIP[0].length * px; /* ~30px */
        var shieldRadius = shipDiameter * 2; /* 4x ship diameter = 2x radius */
        var angle = now * 0.004;

        /* flicker warning in last 2 seconds */
        var flicker = 1;
        if (remaining < 2000) {
            flicker = Math.floor(now / 100) % 2 === 0 ? 0.4 : 1;
        }

        /* rotating Tron border segments */
        var segments = 32;
        var segAngle = 6.28 / segments;
        ctx.lineWidth = 3;
        for (var i = 0; i < segments; i++) {
            var hue = (angle * 57.3 + i * (360 / segments)) % 360;
            var lightness = 85 + 10 * Math.sin(hue * 0.0174);
            ctx.beginPath();
            ctx.arc(x, y, shieldRadius, angle + i * segAngle, angle + (i + 0.7) * segAngle);
            ctx.strokeStyle = "oklch(" + lightness + "% 0.22 " + hue + " / " + (0.6 * flicker) + ")";
            ctx.stroke();
        }

        /* subtle inner glow fill */
        ctx.beginPath();
        ctx.arc(x, y, shieldRadius - 2, 0, 6.28);
        ctx.fillStyle = "oklch(90% 0.05 200 / " + (0.06 * flicker) + ")";
        ctx.fill();

        /* countdown number above ship */
        var secs = Math.ceil(remaining / 1000);
        ctx.font = "8px " + ARCADE_FONT;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "oklch(95% 0.02 0 / " + (0.85 * flicker) + ")";
        ctx.fillText("" + secs, x, y - SHIP.length * px / 2 - 4);
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

    var GUNNER = [
        " # # # ",
        "## # ##",
        "#######",
        " ## ## ",
        "  ###  ",
        " #   # "
    ];

    var NUKE = [
        " ### ",
        "#####",
        "#####",
        "#####",
        " ### "
    ];

    /* Shield bubble — collectible orb, not shootable */
    var BUBBLE = [
        "  ###  ",
        " #   # ",
        "#     #",
        "#     #",
        "#     #",
        " #   # ",
        "  ###  "
    ];

    /* --- Shield state ----------------------------------------------------- */
    var shieldActive = false;
    var shieldEnd = 0;          /* timestamp when shield expires */
    var SHIELD_DURATION = 10000; /* 10 seconds */
    var lastBubble = 0;
    var bubbleSpawnedThisLevel = false;
    var lastBubbleLevel = 0;

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
    var NUKE_INTERVAL = 20000;
    var lastSpawn = 0;
    var lastElite = 0;
    var lastHealer = 0;
    var lastGunner = 0;
    var lastNuke = 0;
    var nukeSpawnedThisLevel = false;
    var lastNukeLevel = 0;
    var screenFlash = 0;
    var enemyBullets = [];

    function gunnerInterval() {
        var lvl = getLevel();
        if (lvl < 3) return Infinity;
        return Math.max(8000, 30000 - Math.floor((lvl - 3) / 3) * 3000);
    }

    function spawnAlien(now) {
        if (lastSpawn === 0) { initTimers(now); return; }
        var gi = gunnerInterval();
        if (gi < Infinity && now - lastGunner >= gi) {
            lastGunner = now;
            aliens.push({
                x: 40 + Math.random() * (w - 80),
                y: -30,
                speed: 0.25 + Math.random() * 0.2,
                drift: (Math.random() - 0.5) * 0.4,
                alive: true,
                gunner: true,
                lastShot: now,
                t: Math.random() * 6.28
            });
        }
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
        /* Nuke orb — spawns from level 10, at least once per level */
        var lvl = getLevel();
        if (lvl >= 10) {
            if (lvl !== lastNukeLevel) {
                nukeSpawnedThisLevel = false;
                lastNukeLevel = lvl;
            }
            if (now - lastNuke >= NUKE_INTERVAL && !nukeSpawnedThisLevel) {
                lastNuke = now;
                nukeSpawnedThisLevel = true;
                aliens.push({
                    x: 40 + Math.random() * (w - 80),
                    y: -20,
                    speed: (0.4 + Math.random() * 0.5) * 1.1,
                    drift: 0,
                    alive: true,
                    nuke: true,
                    t: Math.random() * 6.28
                });
            }
        }
        /* Shield bubble — spawns from level 20, once every 2 levels */
        if (lvl >= 20 && lvl % 2 === 0) {
            if (lvl !== lastBubbleLevel) {
                bubbleSpawnedThisLevel = false;
                lastBubbleLevel = lvl;
            }
            if (!bubbleSpawnedThisLevel) {
                bubbleSpawnedThisLevel = true;
                lastBubble = now;
                aliens.push({
                    x: 40 + Math.random() * (w - 80),
                    y: -25,
                    speed: 0.35 + Math.random() * 0.3,
                    drift: 0,
                    alive: true,
                    bubble: true,
                    t: Math.random() * 6.28
                });
            }
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
        /* Bubble has special circular rendering */
        if (a.bubble) {
            drawBubblePickup(a, now);
            return;
        }
        var sprite = a.nuke ? NUKE : a.healer ? HEART : a.gunner ? GUNNER : a.elite ? ELITE : ALIEN;
        var px = a.nuke ? 3 : a.healer ? 2 : a.gunner ? 3 : a.elite ? 2 : 3;
        var aw = sprite[0].length * px;
        var ah = sprite.length * px;
        var ox = a.x - aw / 2;
        var oy = a.y - ah / 2;
        var dim = (paused || (gameOver && !isGamePage)) ? 0.3 : 1;
        if (a.nuke) {
            var glow = 0.7 + 0.3 * Math.sin(now * 0.008);
            var hue = 80 + 30 * Math.sin(now * 0.003);
            ctx.fillStyle = "oklch(92% 0.15 " + hue + " / " + (glow * dim) + ")";
        } else if (a.healer) {
            var blink = 0.3 + 0.5 * Math.abs(Math.sin(now * 0.004));
            ctx.fillStyle = "oklch(65% 0.2 25 / " + (blink * dim) + ")";
        } else if (a.gunner) {
            var pulse = 0.6 + 0.2 * Math.abs(Math.sin(now * 0.003));
            ctx.fillStyle = "oklch(65% 0.2 270 / " + (pulse * dim) + ")";
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

    function updateAliens(now) {
        var sm = speedMul();
        for (var i = aliens.length - 1; i >= 0; i--) {
            var a = aliens[i];
            if (!a.alive) continue;
            a.y += a.speed * sm;
            if (a.healer) {
                a.t += 0.03;
                a.t2 += 0.07;
                a.x += Math.sin(a.t) * 3 + Math.cos(a.t2) * 1.5;
            } else if (a.gunner) {
                a.t += 0.04;
                a.x += Math.sin(a.t) * 1.5;
                a.x += a.drift;
                /* shoot towards player every 2-3 seconds */
                var shotInterval = Math.max(1500, 3000 - getLevel() * 50);
                if (now - a.lastShot >= shotInterval && a.y > 0 && a.y < h * 0.7) {
                    a.lastShot = now;
                    var edx = mx - a.x;
                    var edy = my - a.y;
                    var dist = Math.sqrt(edx * edx + edy * edy);
                    if (dist > 0) {
                        var spd = 3.5;
                        enemyBullets.push({
                            x: a.x, y: a.y + 10,
                            vx: (edx / dist) * spd,
                            vy: (edy / dist) * spd
                        });
                    }
                }
            } else if (a.nuke) {
                a.t += 0.05;
                a.x += Math.sin(a.t) * 2;
            } else if (a.bubble) {
                a.t += 0.03;
                a.x += Math.sin(a.t) * 1.5;
            } else if (a.elite) {
                a.t += 0.06;
                a.x += Math.sin(a.t) * 2.5;
            } else {
                a.x += a.drift;
            }
            if (a.x < 20) { a.x = 20; a.drift = Math.abs(a.drift || 0.3); }
            if (a.x > w - 20) { a.x = w - 20; a.drift = -Math.abs(a.drift || 0.3); }
            if (a.y > h + 40) {
                if (a.healer || a.nuke || a.bubble) {
                    aliens.splice(i, 1);
                } else {
                    aliens.splice(i, 1);
                    dualShot = false;
                    powerShot = false;
                    lives--;
                    sfxHit();
                    updateLivesDisplay();
                    if (lives <= 0) enterGameOver();
                }
                saveState();
            }
        }
    }

    /* --- Bullets ---------------------------------------------------------- */
    var bullets = [];
    var dualShot = false;
    var powerShot = false;

    function shoot() {
        if (!hasMouse || lives <= 0 || paused || countdown) return;
        sfxPew();
        if (dualShot) {
            var dualOff = powerShot ? 18 : 8;
            bullets.push({ x: mx - dualOff, y: my - 15, speed: 8 });
            bullets.push({ x: mx + dualOff, y: my - 15, speed: 8 });
        }
        if (powerShot) {
            bullets.push({ x: mx, y: my - 15, speed: 8, power: true });
        }
        if (!dualShot && !powerShot) {
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
        for (var i = 0; i < bullets.length; i++) {
            if (bullets[i].power) {
                ctx.fillStyle = "oklch(68% 0.18 230 / 0.85)";
                ctx.fillRect(bullets[i].x - 4, bullets[i].y, 9, 10);
            } else {
                ctx.fillStyle = "oklch(68% 0.18 35 / 0.8)";
                ctx.fillRect(bullets[i].x - 1, bullets[i].y, 3, 8);
            }
        }
    }

    /* --- Enemy bullets ----------------------------------------------------- */
    function updateEnemyBullets() {
        for (var i = enemyBullets.length - 1; i >= 0; i--) {
            var b = enemyBullets[i];
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < -10 || b.x > w + 10 || b.y < -10 || b.y > h + 10) {
                enemyBullets.splice(i, 1);
            }
        }
    }

    function drawEnemyBullets() {
        ctx.fillStyle = "oklch(60% 0.22 270 / 0.85)";
        for (var i = 0; i < enemyBullets.length; i++) {
            ctx.fillRect(enemyBullets[i].x - 1.5, enemyBullets[i].y - 1.5, 4, 4);
        }
    }

    function checkEnemyBulletHits(now) {
        if (lives <= 0 || now < shipInvuln) return;
        /* Shield absorbs enemy bullets */
        if (shieldActive && now < shieldEnd) {
            var shieldR = SHIP[0].length * 3 * 2;
            for (var i = enemyBullets.length - 1; i >= 0; i--) {
                var b = enemyBullets[i];
                var dx = b.x - mx;
                var dy = b.y - my;
                if (dx * dx + dy * dy < shieldR * shieldR) {
                    enemyBullets.splice(i, 1);
                }
            }
            return;
        }
        for (var i = enemyBullets.length - 1; i >= 0; i--) {
            var b = enemyBullets[i];
            if (Math.abs(b.x - mx) < 12 && Math.abs(b.y - my) < 10) {
                enemyBullets.splice(i, 1);
                addExplosion(mx, my);
                lives--;
                sfxHit();
                shipInvuln = now + 1500;
                updateLivesDisplay();
                if (lives <= 0) enterGameOver();
                saveState();
                break;
            }
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
                powerShot: powerShot,
                paused: paused,
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
                    if (aliens[i].bubble) {
                        sa.bubble = true;
                        sa.t = aliens[i].t;
                    } else if (aliens[i].nuke) {
                        sa.nuke = true;
                        sa.t = aliens[i].t;
                    } else if (aliens[i].healer) {
                        sa.healer = true;
                        sa.t = aliens[i].t;
                        sa.t2 = aliens[i].t2;
                    } else if (aliens[i].gunner) {
                        sa.gunner = true;
                        sa.t = aliens[i].t;
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
            if (!raw) { initTimers(); return; }
            var state = JSON.parse(raw);
            initTimers();
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
            if (state.powerShot) powerShot = true;
            if (state.paused) paused = true;
            if (state.aliens && state.aliens.length) {
                for (var i = 0; i < state.aliens.length; i++) {
                    var a = state.aliens[i];
                    var restored = {
                        x: a.x, y: a.y,
                        speed: a.speed, drift: a.drift || 0,
                        alive: true, elite: !!a.elite,
                        healer: !!a.healer,
                        gunner: !!a.gunner,
                        nuke: !!a.nuke,
                        bubble: !!a.bubble
                    };
                    if (a.bubble) {
                        restored.t = a.t || 0;
                    } else if (a.nuke) {
                        restored.t = a.t || 0;
                    } else if (a.healer) {
                        restored.t = a.t || 0;
                        restored.t2 = a.t2 || 0;
                    } else if (a.gunner) {
                        restored.t = a.t || 0;
                        restored.lastShot = performance.now();
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

    function initTimers(now) {
        if (!now) now = performance.now();
        lastSpawn = now;
        lastElite = now;
        lastHealer = now;
        lastGunner = now;
        lastNuke = now;
        lastBubble = now;
    }

    function resetGame() {
        aliens = [];
        bullets = [];
        enemyBullets = [];
        explosions = [];
        trail = [];
        initTimers();
        score = 0;
        lives = MAX_LIVES;
        dualShot = false;
        powerShot = false;
        paused = false;
        gameOver = false;
        nukeSpawnedThisLevel = false;
        lastNukeLevel = 0;
        screenFlash = 0;
        shieldActive = false;
        shieldEnd = 0;
        bubbleSpawnedThisLevel = false;
        lastBubbleLevel = 0;
        showLeaderboard = false;
        leaderboardFetched = false;
        playerQualified = false;
        nameEntryActive = false;
        nameEntry = "";
        if (pauseEl) { pauseEl.innerHTML = "&#x23F8;"; pauseEl.style.fontSize = ""; }
        if (pauseHintEl) pauseHintEl.textContent = "Space Pause";
        if (scoreEl) scoreEl.textContent = "0";
        updateLevel();
        updateLivesDisplay();
        saveState();
    }

    /* --- Nuke -------------------------------------------------------------- */
    function triggerNuke(nukeX, nukeY) {
        screenFlash = 1;
        sfxHit();
        addExplosion(nukeX, nukeY);
        var nukePoints = 0;
        for (var i = aliens.length - 1; i >= 0; i--) {
            if (!aliens[i].alive) continue;
            if (aliens[i].nuke || aliens[i].bubble) continue;
            if (aliens[i].healer) { aliens[i].alive = false; continue; }
            addExplosion(aliens[i].x, aliens[i].y);
            var pts = aliens[i].elite ? 10 : aliens[i].gunner ? 5 : 1;
            nukePoints += pts;
            aliens[i].alive = false;
        }
        enemyBullets = [];
        score += nukePoints;
        if (scoreEl) scoreEl.textContent = score;
        updateLevel();
        saveState();
    }

    /* --- Collision -------------------------------------------------------- */
    function checkCollisions() {
        for (var i = bullets.length - 1; i >= 0; i--) {
            for (var j = aliens.length - 1; j >= 0; j--) {
                if (!aliens[j].alive || aliens[j].bubble) continue;
                var dx = bullets[i].x - aliens[j].x;
                var dy = bullets[i].y - aliens[j].y;
                var hitW = aliens[j].nuke ? 8 : aliens[j].healer ? 7 : aliens[j].gunner ? 12 : aliens[j].elite ? 8 : 14;
                var hitH = aliens[j].nuke ? 8 : aliens[j].healer ? 6 : aliens[j].gunner ? 10 : aliens[j].elite ? 6 : 12;
                if (Math.abs(dx) < hitW && Math.abs(dy) < hitH) {
                    if (aliens[j].nuke) {
                        aliens[j].alive = false;
                        bullets.splice(i, 1);
                        triggerNuke(aliens[j].x, aliens[j].y);
                        break;
                    }
                    addExplosion(aliens[j].x, aliens[j].y);
                    if (aliens[j].healer) {
                        lives = Math.min(MAX_LIVES, lives + 1);
                        updateLivesDisplay();
                    } else {
                        var points = aliens[j].elite ? 10 : aliens[j].gunner ? 5 : 1;
                        if (aliens[j].elite) dualShot = true;
                        if (aliens[j].gunner) powerShot = true;
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
        var shipW = 15;
        var shipH = 12;
        /* Collect healer hearts and nuke orbs on touch (always, even during invuln) */
        for (var i = aliens.length - 1; i >= 0; i--) {
            var a = aliens[i];
            if (!a.alive) continue;
            if (a.healer) {
                var dx = Math.abs(a.x - mx);
                var dy = Math.abs(a.y - my);
                if (dx < (shipW + 7) / 2 && dy < (shipH + 6) / 2) {
                    addExplosion(a.x, a.y);
                    a.alive = false;
                    lives = Math.min(MAX_LIVES, lives + 1);
                    updateLivesDisplay();
                    saveState();
                }
            } else if (a.nuke) {
                var dx = Math.abs(a.x - mx);
                var dy = Math.abs(a.y - my);
                if (dx < (shipW + 8) / 2 && dy < (shipH + 8) / 2) {
                    a.alive = false;
                    triggerNuke(a.x, a.y);
                }
            } else if (a.bubble) {
                var dx = Math.abs(a.x - mx);
                var dy = Math.abs(a.y - my);
                if (dx < (shipW + 14) / 2 && dy < (shipH + 14) / 2) {
                    a.alive = false;
                    shieldActive = true;
                    shieldEnd = now + SHIELD_DURATION;
                    sfxHit();
                }
            }
        }
        /* Shield ramming — kill aliens within shield radius */
        if (shieldActive && now < shieldEnd) {
            var shieldR = SHIP[0].length * 3 * 2; /* 4x ship diameter / 2 */
            for (var i = aliens.length - 1; i >= 0; i--) {
                var a = aliens[i];
                if (!a.alive || a.healer || a.nuke || a.bubble) continue;
                var dx = a.x - mx;
                var dy = a.y - my;
                if (dx * dx + dy * dy < shieldR * shieldR) {
                    addExplosion(a.x, a.y);
                    var pts = a.elite ? 10 : a.gunner ? 5 : 1;
                    score += pts;
                    a.alive = false;
                    sfxHit();
                }
            }
            if (scoreEl) scoreEl.textContent = score;
            updateLevel();
            saveState();
            return; /* shield active — skip normal damage check */
        }
        if (now < shipInvuln) return;
        for (var i = aliens.length - 1; i >= 0; i--) {
            var a = aliens[i];
            if (!a.alive || a.healer || a.nuke || a.bubble) continue;
            var dx = Math.abs(a.x - mx);
            var dy = Math.abs(a.y - my);
            var aW = a.elite ? 5 : a.gunner ? 12 : 14;
            var aH = a.elite ? 5 : a.gunner ? 10 : 12;
            if (dx < (shipW + aW) / 2 && dy < (shipH + aH) / 2) {
                addExplosion(a.x, a.y);
                a.alive = false;
                lives--;
                sfxHit();
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
    var audioEl = document.getElementById("game-audio");
    var audioMuted = false;

    function toggleAudio() {
        audioMuted = !audioMuted;
        if (audioEl) audioEl.textContent = audioMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
        if (audioMuted) {
            stopMusic();
        } else if (!paused && !gameOver && !countdown && hasMouse) {
            startMusic();
        }
    }

    function togglePause() {
        if (gameOver || lives <= 0 || countdown) return;
        paused = !paused;
        if (paused) {
            pausedAt = performance.now();
            stopMusic();
        } else {
            var elapsed = performance.now() - pausedAt;
            lastSpawn += elapsed;
            lastElite += elapsed;
            lastHealer += elapsed;
            lastGunner += elapsed;
            lastNuke += elapsed;
            lastBubble += elapsed;
            if (shieldEnd > 0) shieldEnd += elapsed;
            if (shipInvuln > 0) shipInvuln += elapsed;
            for (var gi = 0; gi < aliens.length; gi++) {
                if (aliens[gi].gunner && aliens[gi].lastShot) aliens[gi].lastShot += elapsed;
            }
            startMusic();
        }
        if (pauseEl) {
            pauseEl.innerHTML = paused ? "&#x25B6;" : "&#x23F8;";
            pauseEl.style.fontSize = paused ? "calc(var(--unit) * 8)" : "";
        }
        if (pauseHintEl) pauseHintEl.textContent = paused ? "Space Resume" : "Space Pause";
        saveState();
    }

    /* --- Game over -------------------------------------------------------- */
    var gameOver = false;
    var gameOverTime = 0;
    var restartEl = document.querySelector(".game-restart");
    var isGamePage = !document.querySelector("main#content") ||
                     !document.querySelector("main#content").children.length;

    /* --- Leaderboard ------------------------------------------------------ */
    var PLAYER_NAME_KEY = "vv-invaders-name";
    var PLAYER_TOKEN_KEY = "vv-invaders-token";
    var leaderboard = [];
    var nameEntry = "";
    var nameEntryActive = false;
    var showLeaderboard = false;
    var leaderboardFetched = false;
    var playerQualified = false;
    var finalScore = 0;

    function getSavedName() {
        /* localStorage first, cookie as fallback */
        try {
            var ls = localStorage.getItem(PLAYER_NAME_KEY);
            if (ls) return ls;
        } catch (e) {}
        var match = document.cookie.match("(?:^|; )" + PLAYER_NAME_KEY + "=([^;]*)");
        return match ? decodeURIComponent(match[1]) : "";
    }
    function saveName(n) {
        try { localStorage.setItem(PLAYER_NAME_KEY, n); } catch (e) {}
        var d = new Date(); d.setFullYear(d.getFullYear() + 1);
        document.cookie = PLAYER_NAME_KEY + "=" + encodeURIComponent(n) +
            ";path=/;expires=" + d.toUTCString() + ";SameSite=Lax";
    }

    function fetchLeaderboard(cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/highscores");
        xhr.onload = function () {
            try {
                var data = JSON.parse(xhr.responseText);
                leaderboard = data.scores || [];
            } catch (e) { leaderboard = []; }
            if (cb) cb();
        };
        xhr.onerror = function () { leaderboard = []; if (cb) cb(); };
        xhr.send();
    }

    function getToken() {
        try {
            var ls = localStorage.getItem(PLAYER_TOKEN_KEY);
            if (ls) return ls;
        } catch (e) {}
        var match = document.cookie.match("(?:^|; )" + PLAYER_TOKEN_KEY + "=([^;]*)");
        return match ? decodeURIComponent(match[1]) : "";
    }
    function saveToken(t) {
        try { localStorage.setItem(PLAYER_TOKEN_KEY, t); } catch (e) {}
        var d = new Date(); d.setFullYear(d.getFullYear() + 1);
        document.cookie = PLAYER_TOKEN_KEY + "=" + encodeURIComponent(t) +
            ";path=/;expires=" + d.toUTCString() + ";SameSite=Lax";
    }

    function submitScore(name, sc, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/highscores");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            try {
                var data = JSON.parse(xhr.responseText);
                leaderboard = data.scores || [];
                if (data.token) saveToken(data.token);
            } catch (e) {}
            if (cb) cb();
        };
        xhr.onerror = function () { if (cb) cb(); };
        xhr.send(JSON.stringify({ name: name, score: sc, token: getToken() }));
    }

    /* --- Font-based rendering (Press Start 2P) ------------------------------ */
    var ARCADE_FONT = "'Press Start 2P', monospace";
    var arcadeFontReady = false;

    /* Pre-check font availability; draw immediately either way */
    if (document.fonts && document.fonts.check) {
        arcadeFontReady = document.fonts.check("12px " + ARCADE_FONT);
        if (!arcadeFontReady) {
            document.fonts.ready.then(function () { arcadeFontReady = true; });
        }
    } else {
        arcadeFontReady = true;
    }

    /* Gradient helper: creates an animated warm gradient fill across text.
       Uses an off-screen canvas as mask so the gradient "shows through" the letters. */
    function drawGradientText(text, cx, cy, size, now) {
        if (!text) return;
        var font = size + "px " + ARCADE_FONT;
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        /* animated diagonal gradient */
        var offset = Math.sin(now * 0.0008) * 300;
        var x0 = cx - 200 + offset;
        var y0 = cy - 100 + offset * 0.5;
        var x1 = cx + 200 + offset;
        var y1 = cy + 100 + offset * 0.5;
        var grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, "oklch(75% 0.18 85 / 0.9)");
        grad.addColorStop(0.5, "oklch(68% 0.22 55 / 0.95)");
        grad.addColorStop(1, "oklch(62% 0.20 35 / 0.9)");

        ctx.fillStyle = grad;
        ctx.fillText(text, cx, cy);
    }

    function drawPlainText(text, cx, cy, size, color) {
        if (!text) return;
        ctx.font = size + "px " + ARCADE_FONT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.fillText(text, cx, cy);
    }

    function drawGameOverSplash(now) {
        if (!gameOver || !isGamePage) return;
        var elapsed = now - gameOverTime;

        /* dark overlay — stays once drawn */
        var fade = Math.min(1, elapsed / 800);
        ctx.fillStyle = "oklch(0% 0 0 / " + (fade * 0.6) + ")";
        ctx.fillRect(0, 0, w, h);

        /* Phase 1: GAME OVER wave for first 2s, then fade out */
        if (elapsed < 3000) {
            var goAlpha = elapsed < 2000 ? fade : Math.max(0, 1 - (elapsed - 2000) / 1000);
            if (goAlpha > 0) {
                var size = Math.max(20, Math.floor(w / 20));
                var baseY = h * 0.45;
                var wave = Math.sin(elapsed * 0.003) * size * 0.3;
                var hue = 35 + Math.sin(elapsed * 0.002) * 15;
                ctx.font = size + "px " + ARCADE_FONT;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "oklch(68% 0.18 " + hue + " / " + goAlpha + ")";
                ctx.fillText("GAME OVER", w / 2, baseY + wave);
            }
        }

        /* After 2s, fetch leaderboard (once) */
        if (elapsed >= 2000 && !leaderboardFetched) {
            leaderboardFetched = true;
            fetchLeaderboard(function () {
                showLeaderboard = true;
                var savedName = getSavedName();
                var existingEntry = null;
                for (var qi = 0; qi < leaderboard.length; qi++) {
                    if (savedName && leaderboard[qi].name === savedName) {
                        existingEntry = leaderboard[qi];
                        break;
                    }
                }
                var qualifies = false;
                if (finalScore > 0) {
                    if (existingEntry) {
                        qualifies = finalScore > existingEntry.score;
                    } else {
                        qualifies = leaderboard.length < 5 || finalScore >= leaderboard[leaderboard.length - 1].score;
                    }
                }
                if (qualifies && isGamePage) {
                    playerQualified = true;
                    nameEntryActive = true;
                    nameEntry = savedName;
                }
            });
        }

        /* Phase 2: Leaderboard (fades in after GAME OVER fades out) */
        if (showLeaderboard) {
            var lbFade = Math.min(1, (elapsed - 2000) / 600);
            if (lbFade > 0) {
                ctx.globalAlpha = lbFade;
                drawLeaderboardScreen(now);
                ctx.globalAlpha = 1;
            }
        }
    }

    function drawLeaderboardScreen(now) {
        /* Sizing — scale to viewport */
        var titleSize = Math.max(14, Math.floor(w / 30));
        var rowSize = Math.max(10, Math.floor(w / 50));
        var smallSize = Math.max(8, Math.floor(rowSize * 0.75));
        var lineH = rowSize * 2.8;
        var leftX = w * 0.2;
        var rightX = w * 0.8;
        var centreX = w / 2;

        /* Title */
        var titleY = h * 0.1 + titleSize;
        drawGradientText("HIGH SCORES", centreX, titleY, titleSize, now);

        /* Score rows — tight below title */
        var firstRowY = titleY + titleSize * 1.5;

        /* Build display list: if player qualified, insert at correct position
           by score (sorted descending). Filter out existing entry with same name
           to avoid duplicates (player overwrites their slot). */
        var displayList = [];
        if (nameEntryActive || playerQualified) {
            var playerEntry = { name: nameEntry, score: finalScore, isPlayer: true };
            /* filter leaderboard: remove existing entry with same name */
            var filtered = [];
            for (var fi = 0; fi < leaderboard.length; fi++) {
                if (nameEntry && leaderboard[fi].name === nameEntry) continue;
                filtered.push(leaderboard[fi]);
            }
            var inserted = false;
            for (var di = 0; di < filtered.length && displayList.length < 5; di++) {
                if (!inserted && finalScore >= filtered[di].score) {
                    displayList.push(playerEntry);
                    inserted = true;
                }
                if (displayList.length < 5) {
                    displayList.push(filtered[di]);
                }
            }
            if (!inserted && displayList.length < 5) {
                displayList.push(playerEntry);
            }
        } else {
            for (var di2 = 0; di2 < leaderboard.length && displayList.length < 5; di2++) {
                displayList.push(leaderboard[di2]);
            }
        }

        for (var i = 0; i < 5; i++) {
            var entry = displayList[i];
            var rank = (i + 1) + ".";
            var name = entry ? entry.name : "---";
            var sc = entry ? ("" + entry.score) : "0";
            var ry = firstRowY + i * lineH;

            /* rank */
            ctx.font = rowSize + "px " + ARCADE_FONT;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            drawGradientTextLeft(rank, leftX, ry, rowSize, now);

            /* name — blink if it's the player's entry being typed */
            var nameX = leftX + ctx.measureText("0. ").width + rowSize;
            if (entry && entry.isPlayer && nameEntryActive) {
                var blinkName = nameEntry + (Math.floor(now / 400) % 2 === 0 ? "_" : " ");
                drawGradientTextLeft(blinkName, nameX, ry, rowSize, now);
            } else {
                drawGradientTextLeft(name, nameX, ry, rowSize, now);
            }

            /* score right-aligned */
            drawGradientTextRight(sc, rightX, ry, rowSize, now);
        }

        /* Bottom area */
        var bottomY = firstRowY + 5 * lineH + lineH * 0.5;

        if (nameEntryActive) {
            drawGradientText("WINNER", centreX, bottomY, smallSize, now);
        } else {
            /* PRESS KEY blink */
            if (Math.floor(now / 500) % 2 === 0) {
                drawGradientText("PRESS KEY", centreX, bottomY, smallSize, now);
            }
        }
    }

    function drawGradientTextLeft(text, x, y, size, now) {
        if (!text) return;
        ctx.font = size + "px " + ARCADE_FONT;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        var offset = Math.sin(now * 0.0008) * 300;
        var grad = ctx.createLinearGradient(x - 100 + offset, y - 50 + offset * 0.5, x + 300 + offset, y + 50 + offset * 0.5);
        grad.addColorStop(0, "oklch(75% 0.18 85 / 0.9)");
        grad.addColorStop(0.5, "oklch(68% 0.22 55 / 0.95)");
        grad.addColorStop(1, "oklch(62% 0.20 35 / 0.9)");
        ctx.fillStyle = grad;
        ctx.fillText(text, x, y);
    }

    function drawGradientTextRight(text, x, y, size, now) {
        if (!text) return;
        ctx.font = size + "px " + ARCADE_FONT;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        var offset = Math.sin(now * 0.0008) * 300;
        var grad = ctx.createLinearGradient(x - 300 + offset, y - 50 + offset * 0.5, x + 100 + offset, y + 50 + offset * 0.5);
        grad.addColorStop(0, "oklch(75% 0.18 85 / 0.9)");
        grad.addColorStop(0.5, "oklch(68% 0.22 55 / 0.95)");
        grad.addColorStop(1, "oklch(62% 0.20 35 / 0.9)");
        ctx.fillStyle = grad;
        ctx.fillText(text, x, y);
    }

    function enterGameOver() {
        gameOver = true;
        paused = false;
        stopMusic();
        gameOverTime = performance.now();
        finalScore = score;
        showLeaderboard = false;
        leaderboardFetched = false;
        playerQualified = false;
        nameEntryActive = false;
        nameEntry = "";
        if (isGamePage) {
            if (pauseWrapEl) pauseWrapEl.style.display = "none";
            if (scoreEl) scoreEl.parentElement.style.display = "none";
            if (livesEl) livesEl.style.display = "none";
            if (restartEl) {
                restartEl.textContent = "";
                restartEl.style.animation = "";
            }
        } else {
            if (restartEl) {
                restartEl.textContent = "PRESS KEY";
                restartEl.style.animation = "blink 1s step-end infinite";
            }
        }
    }

    function leaveGameOver() {
        gameOver = false;
        showLeaderboard = false;
        leaderboardFetched = false;
        playerQualified = false;
        nameEntryActive = false;
        nameEntry = "";
        resetGame();
        if (isGamePage) {
            startCountdown();
        } else {
            if (pauseWrapEl) pauseWrapEl.style.display = "";
            if (scoreEl) scoreEl.parentElement.style.display = "";
            if (livesEl) livesEl.style.display = "";
            if (restartEl) {
                restartEl.textContent = "Ctrl+G Restart";
                restartEl.style.animation = "";
                restartEl.style.display = "";
            }
        }
    }

    /* --- Countdown intro (game page only) --------------------------------- */
    var countdown = false;
    var countdownStart = 0;
    var COUNTDOWN_DURATION = 4000; /* 1s title + 3s count */

    function startCountdown() {
        countdown = true;
        countdownStart = performance.now();
        if (pauseWrapEl) pauseWrapEl.style.display = "none";
        if (scoreEl) scoreEl.parentElement.style.display = "none";
        if (livesEl) livesEl.style.display = "none";
        if (restartEl) restartEl.style.display = "none";
    }

    function endCountdown() {
        countdown = false;
        initTimers();
        if (pauseWrapEl) pauseWrapEl.style.display = "";
        if (scoreEl) scoreEl.parentElement.style.display = "";
        if (livesEl) livesEl.style.display = "";
        if (restartEl) restartEl.style.display = "";
        startMusic();
    }

    function drawCountdown(now) {
        var elapsed = now - countdownStart;
        if (elapsed >= COUNTDOWN_DURATION) {
            endCountdown();
            return;
        }

        /* ASCII art logo rendered as monospace text on canvas */
        var titleAlpha = elapsed < 500 ? elapsed / 500 :
                         elapsed < 3000 ? 1 :
                         Math.max(0, 1 - (elapsed - 3000) / 1000);

        if (titleAlpha > 0) {
            var logo = [
                "_________ __________ ___________",
                "\\_   ___ \\\\______   \\\\__    ___/",
                "/    \\  \\/ |     ___/  |    |",
                "\\     \\____|    |      |    |",
                " \\______  /|____|      |____|",
                "        \\/",
                "  _________.___   ________________________________________    _____",
                " /   _____/|   | /  _____/\\__    ___/\\_   _____/\\______   \\  /     \\",
                " \\_____  \\ |   |/   \\  ___  |    |    |    __)_  |       _/ /  \\ /  \\",
                " /        \\|   |\\    \\_\\  \\ |    |    |        \\ |    |   \\/    Y    \\",
                "/_______  /|___| \\______  / |____|   /_______  / |____|_  /\\____|__  /",
                "        \\/              \\/                   \\/         \\/         \\/"
            ];
            /* Scale font to fit width */
            var maxLen = 0;
            for (var li = 0; li < logo.length; li++) {
                if (logo[li].length > maxLen) maxLen = logo[li].length;
            }
            /* CSS-style scaling: render at fixed size, then scale to fit */
            var baseFontSize = 14;
            var lineH = baseFontSize * 1.1;
            var totalH = logo.length * lineH;
            var totalW = maxLen * baseFontSize * 0.6;
            var scaleX = (w * 0.68) / totalW;
            var scaleY = scaleX;
            var centreX = w / 2;
            var startY = h * 0.28;

            ctx.save();
            ctx.translate(centreX, startY);
            ctx.scale(scaleX, scaleY);

            /* Gradient: light blue → red → white (in scaled coords) */
            var grad = ctx.createLinearGradient(-totalW / 2, -totalH / 2, totalW / 2, totalH / 2);
            grad.addColorStop(0, "oklch(75% 0.15 230 / " + titleAlpha + ")");
            grad.addColorStop(0.5, "oklch(65% 0.22 25 / " + titleAlpha + ")");
            grad.addColorStop(1, "oklch(95% 0.02 90 / " + titleAlpha + ")");

            ctx.font = baseFontSize + "px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = grad;
            for (var li = 0; li < logo.length; li++) {
                ctx.fillText(logo[li], 0, -totalH / 2 + li * lineH);
            }
            ctx.restore();

            /* Copyright line below logo */
            var copyrightY = startY + (totalH / 2) * scaleY + 20 * scaleY;
            var copySize = Math.max(8, Math.floor(12 * scaleX));
            ctx.font = copySize + "px " + ARCADE_FONT;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "oklch(65% 0.05 260 / " + (titleAlpha * 0.5) + ")";
            ctx.fillText("\u00A9 MMXXVI by Min2Max Studios \u2013 Vivian Voss", w / 2, copyrightY);
        }

        /* Countdown 3-2-1: starts at 1000ms */
        if (elapsed >= 1000) {
            var countElapsed = elapsed - 1000;
            var digit = 3 - Math.floor(countElapsed / 1000);
            if (digit >= 1 && digit <= 3) {
                var digitProgress = (countElapsed % 1000) / 1000;
                /* Scale up towards viewer: starts small, grows large */
                var baseSize = Math.max(40, Math.floor(w / 8));
                var scale = 1 + digitProgress * 2;
                var digitSize = Math.floor(baseSize * scale);
                /* Fade out as it grows */
                var digitAlpha = Math.max(0, 1 - digitProgress);
                ctx.font = digitSize + "px " + ARCADE_FONT;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "oklch(80% 0.15 55 / " + digitAlpha + ")";
                ctx.fillText("" + digit, w / 2, h * 0.55);
            }
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
            if (countdown) {
                drawCountdown(now);
            } else if (paused || gameOver) {
                /* Frozen state — draw everything but update nothing */
                for (var i = 0; i < aliens.length; i++) drawAlien(aliens[i], now);
                drawBullets();
                drawEnemyBullets();
                drawExplosions();
                drawGameOverSplash(now);
            } else {
                if (lives > 0) spawnAlien(now);
                updateAliens(now);
                updateBullets();
                updateEnemyBullets();
                checkCollisions();
                if (lives > 0) checkShipCollision(now);
                if (lives > 0) checkEnemyBulletHits(now);
                updateExplosions();

                for (var i = 0; i < aliens.length; i++) drawAlien(aliens[i], now);
                drawBullets();
                drawEnemyBullets();
                drawExplosions();
                if (lives > 0) {
                    updateTrail(mx, my);
                    drawTrail(now);
                    drawShip(mx, my);
                    drawShield(mx, my, now);
                    if (!shieldActive && now < shipInvuln) {
                        ctx.fillStyle = "oklch(75% 0.12 230 / " + (0.15 + 0.15 * Math.sin(now * 0.02)) + ")";
                        ctx.fillRect(mx - 18, my - 14, 36, 28);
                    }
                }

                if (now - saveTimer > 5000) {
                    saveTimer = now;
                    saveState();
                }
            }

            /* Screen flash from nuke */
            if (screenFlash > 0) {
                ctx.fillStyle = "oklch(95% 0.08 85 / " + (screenFlash * 0.7) + ")";
                ctx.fillRect(0, 0, w, h);
                screenFlash -= 0.04;
                if (screenFlash < 0) screenFlash = 0;
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
            updateLivesDisplay();
            if (isGamePage && audioEl) audioEl.style.display = "";
            if (isGamePage && !gameOver && paused) {
                /* Restore paused state — skip countdown, show HUD */
                pausedAt = performance.now();
                if (pauseWrapEl) pauseWrapEl.style.display = "";
                if (pauseEl) {
                    pauseEl.innerHTML = "&#x25B6;";
                    pauseEl.style.fontSize = "calc(var(--unit) * 8)";
                }
                if (pauseHintEl) pauseHintEl.textContent = "Space Resume";
                if (scoreEl) scoreEl.parentElement.style.display = "";
                if (livesEl) livesEl.style.display = "";
                if (restartEl) restartEl.style.display = "";
            } else if (isGamePage && !gameOver) {
                startCountdown();
            } else if (gameOver) {
                /* Game over active — HUD stays hidden, canvas draws overlay */
            } else {
                if (scoreEl) scoreEl.parentElement.style.display = "";
                if (livesEl) livesEl.style.display = "";
                if (pauseWrapEl) pauseWrapEl.style.display = "";
                if (restartEl) restartEl.style.display = "";
                if (paused) {
                    pausedAt = performance.now();
                    if (pauseEl) {
                        pauseEl.innerHTML = "&#x25B6;";
                        pauseEl.style.fontSize = "calc(var(--unit) * 8)";
                    }
                    if (pauseHintEl) pauseHintEl.textContent = "Space Resume";
                }
            }
        }
    });

    c.style.pointerEvents = "none";
    document.addEventListener("click", function (e) {
        if (!gameEnabled) return;
        initAudio();
        if (e.target.closest("#game-pause")) {
            togglePause();
            return;
        }
        if (e.target.closest("#game-audio")) {
            toggleAudio();
            return;
        }
        if (e.target.closest("a, button, nav, input, select, textarea")) return;
        shoot();
    });

    document.addEventListener("keydown", function (e) {
        if (!gameEnabled) return;

        /* Ctrl+G hard reset — always works, even during game over */
        if (e.ctrlKey && e.key === "g") {
            e.preventDefault();
            resetGame();
            if (isGamePage) startCountdown();
            return;
        }

        /* Leaderboard name entry mode */
        if (gameOver && nameEntryActive) {
            e.preventDefault();
            var key = e.key;
            if (key === "Enter" && nameEntry.length > 0) {
                nameEntryActive = false;
                saveName(nameEntry);
                /* Optimistic update: insert into leaderboard immediately
                   so the name stays visible while XHR is in flight */
                var found = false;
                for (var li = 0; li < leaderboard.length; li++) {
                    if (leaderboard[li].name === nameEntry) {
                        leaderboard[li].score = Math.max(leaderboard[li].score, finalScore);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    leaderboard.push({ name: nameEntry, score: finalScore });
                }
                leaderboard.sort(function (a, b) { return b.score - a.score; });
                if (leaderboard.length > 5) leaderboard.length = 5;
                playerQualified = false;
                submitScore(nameEntry, finalScore);
                return;
            }
            if (key === "Backspace") {
                nameEntry = nameEntry.slice(0, -1);
                saveName(nameEntry);
                return;
            }
            if (key.length === 1 && /^[A-Za-z0-9\-]$/.test(key) && nameEntry.length < 16) {
                nameEntry += key.toUpperCase();
                saveName(nameEntry);
            }
            return;
        }

        /* Game over on non-game pages: any key restarts immediately */
        if (gameOver && !isGamePage) {
            e.preventDefault();
            leaveGameOver();
            return;
        }

        /* Game over on game page — press any key after leaderboard shown */
        if (gameOver && showLeaderboard && !nameEntryActive) {
            e.preventDefault();
            leaveGameOver();
            return;
        }

        /* Game over but leaderboard not yet shown — ignore keys */
        if (gameOver) {
            e.preventDefault();
            return;
        }

        if (e.key === " " && !e.target.closest("input, textarea, select, button")) {
            e.preventDefault();
            togglePause();
            return;
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
