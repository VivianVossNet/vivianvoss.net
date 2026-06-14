/**
 * dictionary.js — Auto-link known IT terms in blog articles.
 * Fetches terms.json, scans .vv-article-body text nodes, wraps the
 * first occurrence of every known term in <a class="vv-term"> —
 * including several distinct terms within one text node.
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
                }).join("|") + ")\\b"
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
                if (parent.closest && parent.closest("pre, code, svg")) continue;
                if (parent.namespaceURI === "http://www.w3.org/2000/svg") continue;

                var text = node.nodeValue;
                // Wrap EVERY distinct, not-yet-linked term within this text
                // node, not merely the first match. A single paragraph can
                // name several terms (e.g. "Debian, Red Hat Enterprise Linux,
                // SUSE, Arch"); each still links only at its first occurrence
                // across the whole article (the `matched` guard).
                var re = new RegExp(pattern.source, "g");
                var frag = null;
                var lastIdx = 0;
                var m;
                while ((m = re.exec(text)) !== null) {
                    var found = m[1];
                    var canonical = keys.filter(function (k) {
                        return k === found;
                    })[0] || found;
                    if (matched[canonical.toLowerCase()]) continue;
                    matched[canonical.toLowerCase()] = true;

                    if (!frag) frag = document.createDocumentFragment();
                    if (m.index > lastIdx) {
                        frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
                    }

                    var id = canonical.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    var a = document.createElement("a");
                    a.href = "/dictionary#" + id;
                    a.className = "vv-term";
                    a.setAttribute("data-def", terms[canonical]);
                    a.textContent = found;
                    frag.appendChild(a);

                    lastIdx = m.index + found.length;
                }
                if (frag) {
                    if (lastIdx < text.length) {
                        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
                    }
                    parent.replaceChild(frag, node);
                }
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
