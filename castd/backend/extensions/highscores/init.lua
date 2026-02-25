-- highscores — arcade leaderboard for Space Invaders easter egg
-- Copyright 2026 Vivian Voss. All rights reserved.

local MAX_ENTRIES = 5

local function parse_json(body)
    -- minimal JSON parser for { "name": "ABC", "score": 123 }
    local fields = {}
    if not body or body == "" then return fields end
    for key, val in body:gmatch('"(%w+)"%s*:%s*"?([^",}]+)"?') do
        fields[key] = val
    end
    return fields
end

local function get_top()
    local all = cn.db.get("highscores") or {}
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

        -- validate name: 1-8 chars, A-Z and 0-9 only
        if #name < 1 or #name > 8 or name:find("[^A-Z0-9]") then
            cn.res.status(400)
            return cn.res.json({ error = "Invalid name" })
        end

        -- validate score
        if not score_val or score_val < 0 or score_val ~= math.floor(score_val) then
            cn.res.status(400)
            return cn.res.json({ error = "Invalid score" })
        end

        -- check if qualifies for top 5
        local top = get_top()
        if #top >= MAX_ENTRIES and score_val <= (top[MAX_ENTRIES].score or 0) then
            cn.res.status(200)
            return cn.res.json({ scores = top, qualified = false })
        end

        -- insert
        cn.db.set("highscores", {
            name = name,
            score = tostring(score_val)
        })

        -- prune: keep only top entries to avoid unbounded growth
        local all = cn.db.get("highscores") or {}
        table.sort(all, function(a, b)
            return (tonumber(a.score) or 0) > (tonumber(b.score) or 0)
        end)
        for i = MAX_ENTRIES + 1, #all do
            if all[i].id then
                cn.db.delete("highscores", { id = all[i].id })
            end
        end

        cn.log.info("New highscore: " .. name .. " = " .. score_val)
        return cn.res.json({ scores = get_top(), qualified = true })
    end

    cn.res.status(405)
    return cn.res.json({ error = "Method not allowed" })
end
