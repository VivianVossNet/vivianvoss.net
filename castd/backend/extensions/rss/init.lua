-- rss.xml — RSS 2.0 feed for blog articles
-- Copyright 2026 Vivian Voss. All rights reserved.

local SITE = "https://vivianvoss.net"

local articles = {
    { date = "Wed, 11 Mar 2026 00:00:00 GMT", title = "Bytes of Art: 0mix", loc = "/blog/bytes-of-art-0mix", desc = "64 kilobytes. A seven-minute techno live set with procedural visuals and synthesised audio, running in your browser. Won Best Soundtrack at The Meteoriks 2024 against every production of the year." },
    { date = "Wed, 11 Mar 2026 00:00:00 GMT", title = "Native WebSocket: Server Pushes, Client Listens", loc = "/blog/websocket", desc = "Your frontend needs live data. React taught an entire generation of developers to poll. The browser solved this in 2011 with two lines of JavaScript and zero npm packages." },
    { date = "Mon, 10 Mar 2026 00:00:00 GMT", title = "diff: The Tool That Enabled Collaboration", loc = "/blog/technical-beauty-diff", desc = "In 1974, James Hunt and Douglas McIlroy built diff at Bell Labs. Two files in, one output: what changed. Every code review, every pull request, every version control system since RCS stores history as diffs. 52 years in production. No subscription." },
    { date = "Sun, 09 Mar 2026 00:00:00 GMT", title = "SSH Config: The File Nobody Reads", loc = "/blog/ssh-config", desc = "You type ssh -i ~/.ssh/prod_key -p 2222 deploy@192.168.50.12 fourteen times a day. There is a plain text file that reduces this to ssh prod. It has existed since 1999. One file. No GUI. No subscription." },
    { date = "Sat, 08 Mar 2026 00:00:00 GMT", title = "The Distributed Tax", loc = "/blog/the-distributed-tax", desc = "A function call costs 0.001 ms. A network call between two microservices costs 1 to 5 ms. That is factor 5,000 before any business logic executes." },
    { date = "Fri, 07 Mar 2026 00:00:00 GMT", title = "The Enshittification Cycle", loc = "/blog/the-enshittification-cycle", desc = "Cory Doctorow named it. You have lived it. Every platform begins by being useful, then monetises its users, then monetises its business customers, then dies." },
    { date = "Thu, 06 Mar 2026 00:00:00 GMT", title = "Rolling Releases: The Perpetual Beta", loc = "/blog/rolling-releases", desc = "Software used to ship when it was ready. Now it ships when the sprint ends. Chrome halved its release cycle twice. CrowdStrike pushed one update and crashed 8.5 million machines." },
    { date = "Wed, 05 Mar 2026 00:00:00 GMT", title = "BEM: The Naming Convention That Named Itself Indispensable", loc = "/blog/bem", desc = "BEM was invented at Yandex to stop CSS from breaking across 100 services. The industry adopted it to name twelve classes on a landing page." },
    { date = "Tue, 04 Mar 2026 00:00:00 GMT", title = "The Server Question", loc = "/blog/the-server-question", desc = "72% of the web runs on PHP. Not an accident. But the web has moved: persistent connections, live pushes, minimal memory. Five languages, one task, a 128x difference in memory." },
    { date = "Mon, 03 Mar 2026 00:00:00 GMT", title = "Technical Beauty: jq", loc = "/blog/technical-beauty-jq", desc = "In 2012, JSON was the lingua franca of the web and the Unix toolbox had nothing for it. One PhD student at Cambridge wrote a functional language in 510 KB of C." },
    { date = "Sun, 02 Mar 2026 00:00:00 GMT", title = "Capsicum vs seccomp: Process Sandboxing", loc = "/blog/capsicum-vs-seccomp", desc = "A compromised process inherits the full authority of the user who launched it. Two operating systems fixed this with opposite philosophies." },
    { date = "Sat, 01 Mar 2026 00:00:00 GMT", title = "GraphQL: The Query You Didn't Need", loc = "/blog/the-graphql-tax", desc = "GraphQL was built at Facebook for the News Feed. REST is 50% faster on relational databases. 34x faster with eager loading. The performance tax, itemised." },
    { date = "Sat, 28 Feb 2026 00:00:00 GMT", title = "The Permanent Beta", loc = "/blog/the-permanent-beta", desc = "Software used to come on a disc. A bug on a pressed CD was a recall, not a hotfix. Then the internet removed the disc." },
    { date = "Fri, 27 Feb 2026 00:00:00 GMT", title = "SaaS: The Subscription Tax", loc = "/blog/the-saas-tax", desc = "In 2012, you could buy Adobe Creative Suite for $2,599. You owned it. In 2026, you pay $660 per year and own nothing." },
    { date = "Thu, 26 Feb 2026 00:00:00 GMT", title = "The Kernel Question", loc = "/blog/the-kernel-question", desc = "Europe wants digital sovereignty but builds on a kernel governed by US corporations. 84.3% of Linux commits, $500K board seats." },
    { date = "Thu, 26 Feb 2026 00:00:00 GMT", title = "Containerise Everything", loc = "/blog/containerise-everything", desc = "Docker solved deployment. Then the industry decided it also solved development. On macOS, that means running a Linux VM to execute a process that runs natively." },
    { date = "Wed, 25 Feb 2026 00:00:00 GMT", title = "CSS Learns to Think", loc = "/blog/css-learns-to-think", desc = "For twenty-three years, CSS could only look downward. A parent styled its children. Never the reverse. In 2023, three pseudo-classes changed the direction of the cascade." },
    { date = "Wed, 25 Feb 2026 00:00:00 GMT", title = "Why Every Byte Matters", loc = "/blog/why-every-byte-matters", desc = "The demoscene taught a generation that constraint is not limitation; it is method. Every instruction must justify its presence." },
    { date = "Tue, 24 Feb 2026 00:00:00 GMT", title = "make: Three Concepts, Fifty Years", loc = "/blog/technical-beauty-make", desc = "1976. Stuart Feldman writes make in a weekend. Targets, dependencies, timestamps. Three concepts. Fifty years. Same algorithm." },
    { date = "Mon, 23 Feb 2026 00:00:00 GMT", title = "The Original Microservices", loc = "/blog/the-original-microservices", desc = "Unix had single responsibility, API contracts, message queues, and service discovery in 1973. The industry repackaged it and called it microservices." },
    { date = "Sun, 22 Feb 2026 00:00:00 GMT", title = "JavaScript Bloat: The Battery Tax", loc = "/blog/the-javascript-tax", desc = "558 KB median JavaScript per page. 44 per cent never executes. Mobile parses 25x slower than your dev machine." },
    { date = "Fri, 20 Feb 2026 00:00:00 GMT", title = "The Scrum Tax", loc = "/blog/the-scrum-tax", desc = "Six developers, 80 hours of sprint, 18 hours of ceremonies. A Scrum Master who costs $126k and requires no technical prerequisites." },
    { date = "Wed, 18 Feb 2026 00:00:00 GMT", title = "HTML Dialog: Modal or Not Modal", loc = "/blog/the-dialog-element", desc = "22.5 million npm installs per week for JavaScript that recreates the native dialog element. Focus traps, escape handlers, backdrop overlays. Every browser ships it. Since 2022." },
    { date = "Wed, 18 Feb 2026 00:00:00 GMT", title = "Bytes of Art: Neuron Activated", loc = "/blog/bytes-of-art-neuron-activated", desc = "5 kilobytes. One person. First place. Krzysztof Kluczek wrote the code, designed the visuals, and built a guitar synthesiser at Riverwash 2014." },
    { date = "Tue, 17 Feb 2026 00:00:00 GMT", title = "Technical Beauty: sed", loc = "/blog/technical-beauty-sed", desc = "A psychologist at Bell Labs writes a text editor that never opens a file. 53 years later, it runs everywhere. 25 commands, two buffers, one pass." },
    { date = "Mon, 16 Feb 2026 00:00:00 GMT", title = "Service Management: init vs systemd", loc = "/blog/init-vs-systemd", desc = "FreeBSD init runs on 178 shell scripts and one shared library. systemd ships 690,000 lines of C across 150 compiled binaries." },
    { date = "Sun, 15 Feb 2026 00:00:00 GMT", title = "The Webpack Tax", loc = "/blog/the-webpack-tax", desc = "Webpack solved a 2012 problem that ES Modules natively solved in 2017. esbuild is 106x faster. Vite cold-starts in 1.7 seconds." },
    { date = "Fri, 13 Feb 2026 00:00:00 GMT", title = "MongoDB: The Reinvention of the Wheel", loc = "/blog/the-mongodb-tax", desc = "MongoDB stores relational data in a document store, then spends a decade rebuilding the relational features it discarded." },
    { date = "Thu, 12 Feb 2026 00:00:00 GMT", title = "Unit Tests for Everything", loc = "/blog/unit-tests-for-everything", desc = "In 1994, Kent Beck wrote SUnit to test isolated units of logic. By 2015, the industry had turned his invention into a coverage KPI." },
    { date = "Wed, 11 Feb 2026 00:00:00 GMT", title = "The Specificity War Is Over", loc = "/blog/the-specificity-war", desc = "CSS Cascade Layers end the two-decade specificity war permanently. One declaration line sets the hierarchy. Layer order outranks specificity." },
    { date = "Tue, 10 Feb 2026 00:00:00 GMT", title = "HTTP/2: The Bundling Myth", loc = "/blog/http2-the-bundling-myth", desc = "HTTP/1.1 made bundling necessary. HTTP/2 made it obsolete. Multiplexing, granular caching, and the rule that inverted itself a decade ago." },
    { date = "Mon, 09 Feb 2026 00:00:00 GMT", title = "ZFS Snapshots &amp; Boot Environments: The Safety Net", loc = "/blog/zfs-the-safety-net", desc = "Same ZFS, same commands, radically different experience. On FreeBSD, bectl is in base, the bootloader understands boot environments natively." },
    { date = "Sun, 08 Feb 2026 00:00:00 GMT", title = "Kubernetes: You Are Not Google", loc = "/blog/the-kubernetes-performance-tax", desc = "82 per cent of container users run Kubernetes in production. The control plane demands 12-24 GB RAM before your app serves one request." },
    { date = "Sun, 08 Feb 2026 00:00:00 GMT", title = "The Interpreted Stack", loc = "/blog/the-interpreted-stack", desc = "The job description is admirably brief: a request arrives, HTML leaves. And yet, a quarter century of accretion has produced something rather more elaborate." },
    { date = "Sat, 07 Feb 2026 00:00:00 GMT", title = "ORM: The Illusion of Portability", loc = "/blog/the-orm-illusion", desc = "ORMs hide complexity instead of eliminating it. They promise database portability you will never use and obscure queries you should understand." },
    { date = "Fri, 06 Feb 2026 00:00:00 GMT", title = "Docker: The Capitulation", loc = "/blog/the-docker-tax", desc = "Docker did not solve a technical problem. It monetised a political one. Linux could not agree on a base system, so the industry shipped the entire OS with every application." },
    { date = "Thu, 05 Feb 2026 00:00:00 GMT", title = "READS: The Five Prefixes", loc = "/blog/reads-the-five-prefixes", desc = "OOCSS arrived in 2009. BEM arrived in 2010. Both produce identical specificity. One reads like a sentence. The other reads like a German compound noun." },
    { date = "Thu, 05 Feb 2026 00:00:00 GMT", title = "MVC for Web", loc = "/blog/mvc-for-web", desc = "In 1979, Trygve Reenskaug invented MVC for Smalltalk desktop applications. Then Ruby on Rails borrowed the terminology for the web." },
    { date = "Wed, 04 Feb 2026 00:00:00 GMT", title = "Technical Beauty: Redis", loc = "/blog/technical-beauty-redis", desc = "Salvatore Sanfilippo built Redis in 2009. Single-threaded by design. One event loop, no locks. 100,000+ operations per second on modest hardware." },
    { date = "Sun, 01 Feb 2026 00:00:00 GMT", title = "Technical Beauty: ZFS", loc = "/blog/technical-beauty-zfs", desc = "Jeff Bonwick and Matthew Ahrens built ZFS at Sun Microsystems in 2005. Filesystems trusted hardware that lies. ZFS trusts mathematics instead." },
    { date = "Sun, 01 Feb 2026 00:00:00 GMT", title = "Technical Beauty: OpenSSH", loc = "/blog/technical-beauty-openssh", desc = "Theo de Raadt forked SSH in 1999. The original was accumulating licence restrictions. OpenSSH stripped it down, audited everything, and assumed the network is hostile." },
    { date = "Sun, 01 Feb 2026 00:00:00 GMT", title = "Team Autonomy: The Balkanisation", loc = "/blog/the-balkanisation", desc = "Four teams, four frameworks, four pipelines, four security postures. A cross-team feature ships in month three." },
    { date = "Sun, 01 Feb 2026 00:00:00 GMT", title = "The Framework Tax", loc = "/blog/the-framework-tax", desc = "In 2010, vanilla JavaScript built the web. In 2026, a React Hello World installs 2,839 packages." },
    { date = "Sat, 31 Jan 2026 00:00:00 GMT", title = "From REST Ceremony to JSON-RPC", loc = "/blog/the-json-rpc-replacement", desc = "Five HTTP verbs. Fifty status codes. URL hierarchies. Content negotiation. All to answer: client wants something from server. JSON-RPC answered that in 2005." },
    { date = "Fri, 30 Jan 2026 00:00:00 GMT", title = "Serverless: What You Actually Pay", loc = "/blog/the-serverless-tax", desc = "Serverless is not serverless. It is MicroVMs with amnesia, vendor lock-in with four incompatible dialects, and cold starts." },
    { date = "Fri, 30 Jan 2026 00:00:00 GMT", title = "Technical Beauty: rsync", loc = "/blog/technical-beauty-rsync", desc = "Andrew Tridgell had a problem in 1996: synchronising files over slow links. rsync splits files into chunks, computes rolling checksums, and transfers only the differences." },
    { date = "Thu, 29 Jan 2026 00:00:00 GMT", title = "Technical Beauty: FFmpeg", loc = "/blog/technical-beauty-ffmpeg", desc = "Fabrice Bellard started FFmpeg in 2000. The multimedia world was fragmented. FFmpeg handles every format ever created. 1.5 million lines of C." },
    { date = "Thu, 29 Jan 2026 00:00:00 GMT", title = "Technical Beauty: tar", loc = "/blog/technical-beauty-tar", desc = "1979. John Gilmore writes tar for Unix V7. Tape ARchive. One format, one purpose: bundle files into a stream. Every container image is a stack of tarballs." },
    { date = "Thu, 29 Jan 2026 00:00:00 GMT", title = "OKLCH: The Colour System That Does Not Lie", loc = "/blog/oklch-colour-system", desc = "For three decades, CSS lied about lightness. HEX told you nothing. HSL promised perceptual uniformity and delivered optical illusion. OKLCH fixes the problem." },
    { date = "Wed, 28 Jan 2026 00:00:00 GMT", title = "Technical Beauty: tmux", loc = "/blog/technical-beauty-tmux", desc = "Nicholas Marriott wrote tmux in 2007 because GNU Screen had accumulated three decades of cruft. BSD-licensed. 60,000 lines of C." },
    { date = "Wed, 28 Jan 2026 00:00:00 GMT", title = "The Replacement: FreeBSD Jails", loc = "/blog/the-jails-replacement", desc = "Docker needs a daemon, image layers, a registry, overlay networks. FreeBSD Jails need a directory and a config file. Native kernel isolation since 2000." },
    { date = "Tue, 27 Jan 2026 00:00:00 GMT", title = "From PHP to Rust: Why I Skipped Go", loc = "/blog/the-rust-replacement", desc = "After 20 years of PHP, I needed something new. Everyone said Go. I chose Rust instead. The compiler is your private tutor." },
    { date = "Tue, 27 Jan 2026 00:00:00 GMT", title = "pf vs nftables: Bruteforce", loc = "/blog/pf-vs-nftables", desc = "Fresh server, SSH open, auth.log fills up. Linux reaches for fail2ban, a Python daemon that parses logs after the fact. FreeBSD solves it in four lines of pf.conf." },
    { date = "Mon, 26 Jan 2026 00:00:00 GMT", title = "The Linux Compatibility Layer", loc = "/blog/the-linux-compatibility-layer", desc = "FreeBSD runs Linux binaries natively. No emulator. No VM. No container. The kernel translates syscalls in real time, at less than 1% overhead. Since 1995." },
    { date = "Sun, 25 Jan 2026 00:00:00 GMT", title = "TypeScript: The Build Tax", loc = "/blog/typescript-the-build-tax", desc = "ECMAScript is a complete language. Types are not missing from JavaScript: they were never part of the specification." },
    { date = "Sat, 24 Jan 2026 00:00:00 GMT", title = "CI/CD Pipelines: What You Actually Pay", loc = "/blog/the-cicd-tax", desc = "45-minute pipelines, 20 per cent of the work week lost to YAML, and a supply chain that leaked 23,000 repositories of secrets." },
    { date = "Fri, 23 Jan 2026 00:00:00 GMT", title = "Technical Beauty: Lua", loc = "/blog/technical-beauty-lua", desc = "25,000 lines of C. A 200 KB binary. Embedded in World of Warcraft, Lightroom, nginx, Redis, Neovim, Roblox, Nmap. Born from Brazilian trade barriers." },
    { date = "Tue, 20 Jan 2026 00:00:00 GMT", title = "Technical Beauty: awk", loc = "/blog/technical-beauty-awk", desc = "Aho, Weinberger, Kernighan. 1977. A pattern-action language for text processing. One pass through the data. No compilation." },
    { date = "Mon, 19 Jan 2026 00:00:00 GMT", title = "The Pattern", loc = "/blog/the-pattern", desc = "Over eight episodes we dissected individual performance problems. Stand back far enough and a shape emerges. The same shape, every time." },
    { date = "Sun, 18 Jan 2026 00:00:00 GMT", title = "Bytes of Art: Clean Slate", loc = "/blog/bytes-of-art-clean-slate", desc = "65,536 bytes. Three people. A real-time rendered film with physically-based rendering, volumetric lighting, procedural everything." },
    { date = "Sun, 18 Jan 2026 00:00:00 GMT", title = "The Monitoring Replacement", loc = "/blog/the-monitoring-replacement", desc = "Prometheus needs 2 GB RAM to monitor 10 services. The Unix shell has had monitoring since 1971: ps, top, vmstat, netstat." },
    { date = "Sat, 17 Jan 2026 00:00:00 GMT", title = "Event Sourcing: The Archaeology Tax", loc = "/blog/the-event-sourcing-tax", desc = "Complete audit trail! Time travel! A shopping cart with 10 items produces 13+ events. A 3 TB replay takes 10 hours." },
    { date = "Sat, 17 Jan 2026 00:00:00 GMT", title = "The SSH Replacement", loc = "/blog/the-ssh-replacement", desc = "SSH plus shell replaces Ansible, Python, YAML, Jinja2, inventory files, role dependencies, and Galaxy collections." },
    { date = "Thu, 15 Jan 2026 00:00:00 GMT", title = "Bytes of Art: The Scene Is Dead", loc = "/blog/bytes-of-art-scene-is-dead", desc = "Razor 1911, founded 1985. Their 2012 demo is 64 kilobytes of irony: CRT scanlines, Dubmood's soundtrack, and a running gag." },
    { date = "Wed, 14 Jan 2026 00:00:00 GMT", title = "Agile Estimation Theatre", loc = "/blog/agile-estimation-theatre", desc = "Story points were invented to stop managers converting estimates into deadlines. Then the industry converted story points into deadlines." },
    { date = "Wed, 14 Jan 2026 00:00:00 GMT", title = "Native Form Validation: The Library You Never Needed", loc = "/blog/the-native-form", desc = "44 KB of JavaScript to accomplish what HTML does with five characters. The browser validates. Accessible by default. Since 2014." },
    { date = "Tue, 13 Jan 2026 00:00:00 GMT", title = "Technical Beauty: cron", loc = "/blog/technical-beauty-cron", desc = "One loop. One file. Every minute. Since 1975. Ken Thompson wrote the first version at Bell Labs. Paul Vixie rewrote it in 1987. 2,500 lines of C." },
    { date = "Mon, 12 Jan 2026 00:00:00 GMT", title = "Bytes of Art: Zetsubo", loc = "/blog/bytes-of-art-zetsubo", desc = "4,096 bytes. A complete audiovisual experience: procedural geometry, synthesised soundtrack, real-time rendering. Prismbeings, 2018." },
    { date = "Fri, 09 Jan 2026 00:00:00 GMT", title = "The Cloud-Native Tax", loc = "/blog/the-cloud-native-tax", desc = "The bill is 47 pages and requires a FinOps specialist to decode. Netflix uses AWS for the back office. For video delivery: FreeBSD, jails, bare metal." },
    { date = "Wed, 07 Jan 2026 00:00:00 GMT", title = "Vanilla JS: The Framework You Already Have", loc = "/blog/vanilla-js-the-framework-you-have", desc = "React ships 142 KB before your code runs. The browser ships querySelector, addEventListener, Web Components, Proxy, and fetch. Zero kilobytes." },
    { date = "Wed, 07 Jan 2026 00:00:00 GMT", title = "Technical Beauty: age", loc = "/blog/technical-beauty-age", desc = "Filippo Valsorda wrote age because GPG had become unusable. One binary. One command to encrypt. One command to decrypt. No key servers, no web of trust." },
    { date = "Tue, 06 Jan 2026 00:00:00 GMT", title = "Technical Beauty: FreeBSD Jails", loc = "/blog/technical-beauty-jails", desc = "Poul-Henning Kamp built FreeBSD Jails in 1999. Kernel-level isolation, near-zero overhead. Stable API for 25 years. No daemon, no overlay network." },
    { date = "Mon, 05 Jan 2026 00:00:00 GMT", title = "The CSS-in-JS Tax", loc = "/blog/the-css-in-js-tax", desc = "CSS-in-JS is writing CSS in JavaScript to generate CSS. The runtime overhead, the 13 KB library tax, hydration roulette." },
    { date = "Sun, 04 Jan 2026 00:00:00 GMT", title = "Vanilla CSS: The Sass Replacement", loc = "/blog/the-sass-replacement", desc = "Sass was revolutionary in 2012. Variables, nesting, functions. In 2026, CSS does all of it natively. No build step. No node-sass conflicts." },
    { date = "Fri, 02 Jan 2026 00:00:00 GMT", title = "The npm Tax", loc = "/blog/the-npm-tax", desc = "That sentence has done more damage to software security than any zero-day exploit. It installs 1,400 packages before your kettle has boiled." },
    { date = "Wed, 31 Dec 2025 00:00:00 GMT", title = "The SPA Tax", loc = "/blog/the-spa-tax", desc = "We need a Single Page Application. A perfectly reasonable sentence, provided one does not ask the follow-up question." },
    { date = "Tue, 30 Dec 2025 00:00:00 GMT", title = "Technical Beauty: nginx", loc = "/blog/technical-beauty-nginx", desc = "Igor Sysoev built nginx in 2004 because Apache's thread-per-connection model was architecturally wrong. Event-driven, pure C, no framework." },
    { date = "Mon, 29 Dec 2025 00:00:00 GMT", title = "The Angular Tax", loc = "/blog/the-angular-tax", desc = "Angular is the SAP of frontend frameworks. Zone.js monkey-patches 30+ browser APIs, a Hello World ships 500 KB, and Google builds Angular but does not use it." },
    { date = "Sun, 28 Dec 2025 00:00:00 GMT", title = "Agile: The Hostile Takeover", loc = "/blog/agile-the-hostile-takeover", desc = "Divide and conquer. The oldest strategy of control. Fragment the opposition. Isolate the units. They call it Agile." },
    { date = "Sat, 27 Dec 2025 00:00:00 GMT", title = "The Kubernetes Tax", loc = "/blog/the-kubernetes-tax", desc = "81 resource types. 200 lines of YAML to replace one systemctl command. A platform team before your first customer." },
    { date = "Fri, 26 Dec 2025 00:00:00 GMT", title = "Technical Beauty: curl", loc = "/blog/technical-beauty-curl", desc = "Daniel Stenberg released curl in 1998. 26 years, zero breaking changes, one dependency: libc. Runs on 10+ billion devices." },
    { date = "Wed, 24 Dec 2025 00:00:00 GMT", title = "Technical Beauty: PostgreSQL", loc = "/blog/technical-beauty-postgresql", desc = "Michael Stonebraker built POSTGRES at Berkeley in 1986. Minimal core, everything extensible. 38 years, same BSD licence. No corporate owner." },
    { date = "Tue, 23 Dec 2025 00:00:00 GMT", title = "Technical Beauty: git", loc = "/blog/technical-beauty-git", desc = "Linus Torvalds built git in ten days. 10 MB, no server, no database, no dependencies beyond libc. Content-addressable, distributed, backwards compatible since 2005." },
    { date = "Mon, 22 Dec 2025 00:00:00 GMT", title = "The Flexbox Tax", loc = "/blog/the-flexbox-tax", desc = "Flexbox arrived to solve layout. Then the industry used it for everything. Twelve wrapper divs for a holy grail layout that CSS Grid solves in three lines." },
    { date = "Sat, 20 Dec 2025 00:00:00 GMT", title = "The Microservices Tax", loc = "/blog/the-microservices-tax", desc = "But deployments are cleaner! That sentence has launched more Kubernetes clusters than any legitimate scaling requirement." },
    { date = "Wed, 17 Dec 2025 00:00:00 GMT", title = "WireGuard: The VPN That Fits in Your Head", loc = "/blog/technical-beauty-wireguard", desc = "Jason Donenfeld built WireGuard in 4,000 lines of code. OpenVPN needs 100,000. Linus Torvalds called it a work of art." },
    { date = "Tue, 16 Dec 2025 00:00:00 GMT", title = "Technical Beauty: SQLite", loc = "/blog/technical-beauty-sqlite", desc = "D. Richard Hipp built SQLite in 2000 for a US Navy destroyer. 600 KB, single file, zero configuration. Public domain. Supported until 2050." },
    { date = "Mon, 15 Dec 2025 00:00:00 GMT", title = "The React Tax", loc = "/blog/the-react-tax", desc = "React 18 ships 136 KB minified before you have written a single line of application code. The Virtual DOM costs 30 per cent versus vanilla JavaScript." },
    { date = "Sun, 14 Dec 2025 00:00:00 GMT", title = "Native ES Modules: The Replacement", loc = "/blog/the-esmodules-replacement", desc = "Browsers have understood ES Modules since 2018. HTTP/2 solved the request overhead in 2015. For 90% of projects, the build pipeline is the complexity." },
    { date = "Sun, 07 Dec 2025 00:00:00 GMT", title = "Shallow Errors", loc = "/blog/shallow-errors", desc = "In 2013, a German data scientist discovered Xerox scanners were silently changing numbers in scanned documents. No error. No warning." },
    { date = "Sun, 07 Dec 2025 00:00:00 GMT", title = "The Caddy Replacement", loc = "/blog/the-caddy-replacement", desc = "Caddy replaces Nginx, Certbot, Cron, and renewal hooks. One binary. Zero TLS configuration. Auto HTTPS since 2015." },
}

local function escape(s)
    s = s:gsub("&", "&amp;")
    s = s:gsub("<", "&lt;")
    s = s:gsub(">", "&gt;")
    s = s:gsub("\"", "&quot;")
    s = s:gsub("'", "&apos;")
    return s
end

function route()
    local xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml = xml .. '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    xml = xml .. '<channel>\n'
    xml = xml .. '  <title>Vivian Voss</title>\n'
    xml = xml .. '  <link>' .. SITE .. '/blog</link>\n'
    xml = xml .. '  <description>Software architecture, Unix philosophy, and the demoscene. Selected articles by Vivian Voss.</description>\n'
    xml = xml .. '  <language>en-gb</language>\n'
    xml = xml .. '  <atom:link href="' .. SITE .. '/feed" rel="self" type="application/rss+xml"/>\n'

    for _, a in ipairs(articles) do
        xml = xml .. '  <item>\n'
        xml = xml .. '    <title>' .. escape(a.title) .. '</title>\n'
        xml = xml .. '    <link>' .. SITE .. a.loc .. '</link>\n'
        xml = xml .. '    <guid isPermaLink="true">' .. SITE .. a.loc .. '</guid>\n'
        xml = xml .. '    <pubDate>' .. a.date .. '</pubDate>\n'
        xml = xml .. '    <description>' .. escape(a.desc) .. '</description>\n'
        xml = xml .. '  </item>\n'
    end

    xml = xml .. '</channel>\n'
    xml = xml .. '</rss>\n'

    cn.res.header("Content-Type", "application/rss+xml; charset=utf-8")
    cn.res.header("Cache-Control", "public, max-age=3600")
    cn.res.body(xml)
end
