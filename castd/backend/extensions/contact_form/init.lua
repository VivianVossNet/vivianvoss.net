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

function route()
    if cn.req.method ~= "POST" then
        return cn.res.redirect("/contact")
    end

    local fields  = parse_form(cn.req.body or "")
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
