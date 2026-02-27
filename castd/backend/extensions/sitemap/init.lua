-- sitemap.xml — search engine index
-- Copyright 2026 Vivian Voss. All rights reserved.

local SITE = "https://vivianvoss.net"

local pages = {
    { loc = "/",           priority = "1.0",  changefreq = "weekly"  },
    { loc = "/about",      priority = "0.8",  changefreq = "monthly" },
    { loc = "/ecosystem",  priority = "0.8",  changefreq = "monthly" },
    { loc = "/writing",    priority = "0.7",  changefreq = "weekly"  },
    { loc = "/blog",       priority = "0.9",  changefreq = "weekly"  },
    { loc = "/contact",    priority = "0.5",  changefreq = "yearly"  },
    -- blog articles
    { loc = "/blog/the-angular-tax",                   priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/oklch-colour-system",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/vanilla-js-the-framework-you-have", priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-ssh-replacement",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-event-sourcing-tax",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-sass-replacement",              priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/technical-beauty-wireguard",        priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/technical-beauty-curl",             priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/technical-beauty-lua",              priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/technical-beauty-postgresql",       priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/technical-beauty-make",             priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-dialog-element",              priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/technical-beauty-sed",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-specificity-war",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-kubernetes-performance-tax", priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/zfs-the-safety-net",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/pf-vs-nftables",              priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-caddy-replacement",       priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-esmodules-replacement",   priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-orm-illusion",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-saas-tax",                priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-kernel-question",          priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-mongodb-tax",           priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-docker-tax",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-javascript-tax",        priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-scrum-tax",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/containerise-everything",  priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/css-learns-to-think",       priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/why-every-byte-matters",    priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-original-microservices", priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/init-vs-systemd",           priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-webpack-tax",           priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-interpreted-stack",     priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/agile-the-hostile-takeover", priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-balkanisation",        priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/mvc-for-web",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-serverless-tax",         priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/typescript-the-build-tax",  priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-cicd-tax",              priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-pattern",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-cloud-native-tax",       priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-css-in-js-tax",         priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-npm-tax",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-spa-tax",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-microservices-tax",     priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/shallow-errors",            priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-react-tax",              priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-kubernetes-tax",         priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-framework-tax",          priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/unit-tests-for-everything",  priority = "0.7", changefreq = "yearly" },
}

function route()
    local xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml = xml .. '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for _, p in ipairs(pages) do
        xml = xml .. "  <url>\n"
        xml = xml .. "    <loc>" .. SITE .. p.loc .. "</loc>\n"
        xml = xml .. "    <changefreq>" .. p.changefreq .. "</changefreq>\n"
        xml = xml .. "    <priority>" .. p.priority .. "</priority>\n"
        xml = xml .. "  </url>\n"
    end

    xml = xml .. "</urlset>\n"

    cn.res.header("Content-Type", "application/xml; charset=utf-8")
    cn.res.header("Cache-Control", "public, max-age=86400")
    cn.res.body(xml)
end
