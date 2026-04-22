-- contact_form — server-side contact form via cn.mail.send()
-- Copyright 2026 Vivian Voss. All rights reserved.

local MAILTO = "0xc411@vivianvoss.net"

local function url_decode(s)
    s = s:gsub("+", " ")
    s = s:gsub("%%(%x%x)", function(hex)
        return string.char(tonumber(hex, 16))
    end)
    return s
end

local function parse_form(body)
    local fields = {}
    for pair in (body .. "&"):gmatch("([^&]*)&") do
        local key, value = pair:match("^([^=]*)=(.*)$")
        if key and value then
            fields[url_decode(key)] = url_decode(value)
        end
    end
    return fields
end

local function trim(s)
    return s and s:match("^%s*(.-)%s*$") or ""
end

local function sanitise(s)
    return s:gsub("[\r\n]", " ")
end

local function validate_csrf(token)
    if not token or token == "" then return false end

    local ok, tokens = pcall(cn.db.get, "csrf_tokens")
    if not ok or not tokens then return false end

    for _, t in ipairs(tokens) do
        if t.token == token then
            -- consume token (use-once)
            cn.db.delete("csrf_tokens", { id = t.id })
            return true
        end
    end

    return false
end

function route()
    if cn.req.method ~= "POST" then
        return cn.res.redirect("/contact")
    end

    local fields  = parse_form(cn.req.body or "")

    -- CSRF: token must come from a server-rendered /contact page
    if not validate_csrf(trim(fields["csrf_token"] or "")) then
        cn.log.warn("Contact form rejected: invalid CSRF token")
        return cn.res.redirect("/contact?error=2")
    end

    local name    = trim(fields["name"] or "")
    local email   = trim(fields["email"] or "")
    local subject = trim(fields["subject"] or "")
    local message = trim(fields["message"] or "")
    local honey   = trim(fields["website"] or "")

    -- honeypot filled = bot, silent redirect
    if honey ~= "" then
        return cn.res.redirect("/contact")
    end

    -- validation
    if name == "" or email == "" or subject == "" or message == "" then
        return cn.res.redirect("/contact?error=1")
    end

    -- sanitise header fields against injection
    name    = sanitise(name)
    email   = sanitise(email)
    subject = sanitise(subject)

    local full_subject = "[vivianvoss.net] " .. subject
    local body = "From: " .. name .. " <" .. email .. ">\n\n" .. message

    local result = cn.mail.send(MAILTO, full_subject, body, email)

    if result.success then
        cn.log.info("Contact form sent from " .. email)
        return cn.res.redirect("/contact?sent=1")
    else
        cn.log.warn("Contact form failed: " .. (result.error or "unknown"))
        return cn.res.redirect("/contact?error=2")
    end
end
