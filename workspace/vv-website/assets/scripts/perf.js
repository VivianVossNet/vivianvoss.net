/**
 * perf.js — Live performance dashboard
 * Measures real page load metrics via Performance API.
 * No estimates, no averages. Your connection, your browser, right now.
 *
 * Copyright 2026 Vivian Voss. All rights reserved.
 */
(function () {
    var ids = ["perf-ttfb", "perf-fcp", "perf-load", "perf-size", "perf-requests", "perf-dom"];
    if (!document.getElementById(ids[0])) return;

    function ms(v) { return Math.round(v) + " ms"; }
    function kb(v) { return (v / 1024).toFixed(1) + " KB"; }
    function set(id, v) {
        var el = document.getElementById(id);
        if (el) el.textContent = v;
    }

    function measure() {
        var nav = performance.getEntriesByType("navigation")[0];
        if (!nav) return;

        set("perf-ttfb", ms(nav.responseStart - nav.requestStart));
        set("perf-load", ms(nav.loadEventEnd - nav.startTime));

        var resources = performance.getEntriesByType("resource");
        var total = nav.transferSize || 0;
        for (var i = 0; i < resources.length; i++) {
            total += resources[i].transferSize || 0;
        }
        set("perf-size", kb(total));
        set("perf-requests", (resources.length + 1).toString());
        set("perf-dom", document.querySelectorAll("*").length.toString());
    }

    try {
        var po = new PerformanceObserver(function (list) {
            var entries = list.getEntries();
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].name === "first-contentful-paint") {
                    set("perf-fcp", ms(entries[i].startTime));
                }
            }
        });
        po.observe({ type: "paint", buffered: true });
    } catch (e) {}

    if (document.readyState === "complete") {
        measure();
    } else {
        window.addEventListener("load", function () {
            setTimeout(measure, 0);
        });
    }
})();
