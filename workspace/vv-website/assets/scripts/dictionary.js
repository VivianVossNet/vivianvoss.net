/**
 * dictionary.js — Auto-link known IT terms in blog articles.
 * Fetches terms.json, scans .vv-article-body text nodes, wraps
 * first occurrence of each term in <a class="vv-term">.
 *
 * Copyright 2026 Vivian Voss. All rights reserved.
 */
(function () {
    var body = document.querySelector(".vv-article-body");
    if (!body) return;

    fetch("/assets/data/terms.json")
        .then(function (r) { return r.json(); })
        .then(function (terms) {
            var keys = Object.keys(terms).sort(function (a, b) {
                return b.length - a.length;
            });
            var pattern = new RegExp(
                "\\b(" + keys.map(function (k) {
                    return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                }).join("|") + ")\\b", "i"
            );
            var matched = {};
            var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
            var nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);

            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (!node.parentNode) continue;
                var parent = node.parentNode;
                var tag = parent.tagName;
                if (tag === "A" || tag === "CODE" || tag === "PRE" || tag === "SCRIPT" ||
                    tag === "STYLE" || tag === "H1" || tag === "H2" || tag === "H3" ||
                    parent.classList.contains("vv-term")) continue;
                if (parent.namespaceURI === "http://www.w3.org/2000/svg" ||
                    (parent.closest && parent.closest("svg"))) continue;

                var text = node.nodeValue;
                var m = pattern.exec(text);
                if (!m) continue;

                var found = m[1];
                var canonical = keys.filter(function (k) {
                    return k.toLowerCase() === found.toLowerCase();
                })[0] || found;
                if (matched[canonical.toLowerCase()]) continue;
                matched[canonical.toLowerCase()] = true;

                var id = canonical.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                var before = text.slice(0, m.index);
                var after = text.slice(m.index + found.length);

                var a = document.createElement("a");
                a.href = "/dictionary#" + id;
                a.className = "vv-term";
                a.setAttribute("data-def", terms[canonical]);
                a.textContent = found;

                var frag = document.createDocumentFragment();
                if (before) frag.appendChild(document.createTextNode(before));
                frag.appendChild(a);
                if (after) frag.appendChild(document.createTextNode(after));
                parent.replaceChild(frag, node);
            }

            /* Touch: first tap shows tooltip, second tap navigates */
            var isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            if (isTouch) {
                var active = null;
                document.addEventListener("click", function (e) {
                    var term = e.target.closest(".vv-term");
                    if (term) {
                        if (active !== term) {
                            e.preventDefault();
                            if (active) active.classList.remove("is-touched");
                            term.classList.add("is-touched");
                            active = term;
                            return;
                        }
                    }
                    if (active) {
                        active.classList.remove("is-touched");
                        active = null;
                    }
                });
            }
        });
})();
