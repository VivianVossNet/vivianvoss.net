-- robots.txt — crawl rules for search engines and AI bots
-- Copyright 2026 Vivian Voss. All rights reserved.

function route()
    cn.res.header("Content-Type", "text/plain; charset=utf-8")
    cn.res.header("Cache-Control", "public, max-age=86400")
    cn.res.body([[User-agent: *
Allow: /
Disallow: /game
Disallow: /api/

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://vivianvoss.net/sitemap.xml
]])
end
