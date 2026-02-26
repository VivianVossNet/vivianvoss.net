-- highscores — arcade leaderboard for Space Invaders easter egg
-- Copyright 2026 Vivian Voss. All rights reserved.

local MAX_ENTRIES = 5

local function parse_json(body)
    -- minimal JSON parser for { "name": "ABC", "score": 123, "token": "..." }
    local fields = {}
    if not body or body == "" then return fields end
    for key, val in body:gmatch('"(%w+)"%s*:%s*"?([^",}]+)"?') do
        fields[key] = val
    end
    return fields
end

local function safe_get()
    local ok, result = pcall(cn.db.get, "highscores")
    if ok then return result or {} end
    return {}
end

local function get_top()
    local all = safe_get()
    -- sort by score descending
    table.sort(all, function(a, b)
        return (tonumber(a.score) or 0) > (tonumber(b.score) or 0)
    end)
    local top = {}
    for i = 1, math.min(MAX_ENTRIES, #all) do
        top[i] = { name = all[i].name, score = tonumber(all[i].score) or 0 }
    end
    return top
end

function route()
    if cn.req.method == "GET" then
        return cn.res.json({ scores = get_top() })
    end

    if cn.req.method == "POST" then
        local fields = parse_json(cn.req.body or "")
        local name = (fields.name or ""):upper()
        local score_val = tonumber(fields.score)
        local client_token = fields.token or ""

        -- validate name: 1-16 chars, A-Z, 0-9 and hyphen only
        if #name < 1 or #name > 16 or name:find("[^A-Z0-9%-]") then
            cn.res.status(400)
            return cn.res.json({ error = "Invalid name" })
        end

        -- validate score
        if not score_val or score_val < 0 or score_val ~= math.floor(score_val) then
            cn.res.status(400)
            return cn.res.json({ error = "Invalid score" })
        end

        -- check if name already exists
        local all = safe_get()
        local existing_id = nil
        local existing_score = 0
        local existing_token = ""
        for _, entry in ipairs(all) do
            if entry.name == name then
                existing_id = entry.id
                existing_score = tonumber(entry.score) or 0
                existing_token = entry.token or ""
                break
            end
        end

        if existing_id then
            -- verify ownership
            if existing_token ~= "" and client_token ~= existing_token then
                cn.res.status(403)
                return cn.res.json({ error = "Name already taken" })
            end

            -- claim unclaimed entry: assign token on first authenticated update
            if existing_token == "" and client_token == "" then
                existing_token = cn.crypto.token()
                cn.db.update("highscores", { id = existing_id }, { token = existing_token })
            end

            -- only accept if new score is higher
            if score_val <= existing_score then
                cn.res.status(200)
                return cn.res.json({ scores = get_top(), qualified = false, token = existing_token })
            end
            -- update existing entry
            cn.db.update("highscores", { id = existing_id }, { score = tostring(score_val) })

            -- prune
            all = safe_get()
            table.sort(all, function(a, b)
                return (tonumber(a.score) or 0) > (tonumber(b.score) or 0)
            end)
            for i = MAX_ENTRIES + 1, #all do
                if all[i].id then
                    cn.db.delete("highscores", { id = all[i].id })
                end
            end

            cn.log.info("Highscore updated: " .. name .. " = " .. score_val)
            return cn.res.json({ scores = get_top(), qualified = true, token = existing_token })
        else
            -- new entry — check if qualifies for top 5
            local top = get_top()
            if #top >= MAX_ENTRIES and score_val < (top[MAX_ENTRIES].score or 0) then
                cn.res.status(200)
                return cn.res.json({ scores = top, qualified = false })
            end

            -- generate ownership token
            local new_token = cn.crypto.token()

            -- insert new entry
            cn.db.set("highscores", {
                name = name,
                score = tostring(score_val),
                token = new_token
            })

            -- prune
            all = safe_get()
            table.sort(all, function(a, b)
                return (tonumber(a.score) or 0) > (tonumber(b.score) or 0)
            end)
            for i = MAX_ENTRIES + 1, #all do
                if all[i].id then
                    cn.db.delete("highscores", { id = all[i].id })
                end
            end

            cn.log.info("New highscore: " .. name .. " = " .. score_val)
            return cn.res.json({ scores = get_top(), qualified = true, token = new_token })
        end
    end

    cn.res.status(405)
    return cn.res.json({ error = "Method not allowed" })
end
