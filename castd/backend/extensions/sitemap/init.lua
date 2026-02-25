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
    { loc = "/blog/css-learns-to-think",       priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/why-every-byte-matters",    priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-original-microservices", priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-interpreted-stack",     priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/agile-the-hostile-takeover", priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/mvc-for-web",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/typescript-the-build-tax",  priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-pattern",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-npm-tax",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-spa-tax",               priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/the-microservices-tax",     priority = "0.7", changefreq = "yearly" },
    { loc = "/blog/shallow-errors",            priority = "0.7", changefreq = "yearly" },
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
