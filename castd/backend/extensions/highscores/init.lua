-- highscores — arcade leaderboard for Space Invaders easter egg
-- Copyright 2026 Vivian Voss. All rights reserved.

local MAX_ENTRIES = 5
local MAX_SCORE = 10000
local TOKEN_TTL = 7200

local function parse_json(body)
    local fields = {}
    if not body or body == "" then return fields end
    for key, val in body:gmatch('"(%w+)"%s*:%s*"?([^",}]+)"?') do
        fields[key] = val
    end
    return fields
end

local function safe_get(collection)
    local ok, result = pcall(cn.db.get, collection)
    if ok then return result or {} end
    return {}
end

local migrated = false

local function purge_invalid()
    -- one-time migration: remove hacked scores, seed legitimate entries
    if not migrated then
        migrated = true
        local all = safe_get("highscores")
        local dominated = { WTF = true, VERMADEN = true, WILDMORT = true }
        for _, entry in ipairs(all) do
            if entry.id and dominated[entry.name] then
                cn.log.warn("Purging hacked score: " .. entry.name .. " = " .. (entry.score or "?"))
                cn.db.delete("highscores", { id = entry.id })
            end
        end
        -- seed missing entries
        all = safe_get("highscores")
        local names = {}
        for _, entry in ipairs(all) do names[entry.name] = true end
        if not names["QSYSOPR"] then
            cn.db.set("highscores", { name = "QSYSOPR", score = "2641", token = cn.crypto.token() })
        end
        if not names["PREA"] then
            cn.db.set("highscores", { name = "PREA", score = "2191", token = cn.crypto.token() })
        end
        if not names["RAZCAL"] then
            cn.db.set("highscores", { name = "RAZCAL", score = "1485", token = cn.crypto.token() })
        end
    end

    local all = safe_get("highscores")
    for _, entry in ipairs(all) do
        if entry.id and (tonumber(entry.score) or 0) > MAX_SCORE then
            cn.log.warn("Purging invalid score: " .. (entry.name or "?") .. " = " .. (entry.score or "?"))
            cn.db.delete("highscores", { id = entry.id })
        end
    end
end

local function get_top()
    local all = safe_get("highscores")
    table.sort(all, function(a, b)
        return (tonumber(a.score) or 0) > (tonumber(b.score) or 0)
    end)
    local top = {}
    for i = 1, math.min(MAX_ENTRIES, #all) do
        top[i] = { name = all[i].name, score = tonumber(all[i].score) or 0 }
    end
    return top
end

local function prune_scores()
    local all = safe_get("highscores")
    table.sort(all, function(a, b)
        return (tonumber(a.score) or 0) > (tonumber(b.score) or 0)
    end)
    for i = MAX_ENTRIES + 1, #all do
        if all[i].id then
            cn.db.delete("highscores", { id = all[i].id })
        end
    end
end

local function validate_game_token(gtoken)
    if not gtoken or gtoken == "" then return false end

    local tokens = safe_get("csrf_tokens")
    for _, t in ipairs(tokens) do
        if t.token == gtoken then
            local age = os.time() - (tonumber(t.created) or 0)
            if age > TOKEN_TTL then
                cn.db.delete("csrf_tokens", { id = t.id })
                return false
            end
            -- consume: one token, one submission
            cn.db.delete("csrf_tokens", { id = t.id })
            return true
        end
    end

    return false
end

function route()
    purge_invalid()

    if cn.req.method == "GET" then
        return cn.res.json({ scores = get_top() })
    end

    if cn.req.method == "POST" then
        local fields = parse_json(cn.req.body or "")
        local gtoken = fields.gtoken or ""

        -- CSRF: token must come from a server-rendered /game page
        if not validate_game_token(gtoken) then
            cn.res.status(403)
            cn.log.warn("Score rejected: invalid game token")
            return cn.res.json({ error = "Invalid game token" })
        end

        local name = (fields.name or ""):upper()
        local score_val = tonumber(fields.score)
        local client_token = fields.token or ""
        local kn = tonumber(fields.kn) or 0
        local kg = tonumber(fields.kg) or 0
        local ke = tonumber(fields.ke) or 0

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

        -- validate kill counts are non-negative integers
        if kn < 0 or kg < 0 or ke < 0 then
            cn.res.status(400)
            return cn.res.json({ error = "Invalid kill counts" })
        end

        -- score must match kills: normal*1 + gunner*5 + elite*10
        local expected_score = kn + kg * 5 + ke * 10
        if score_val ~= expected_score then
            cn.res.status(400)
            cn.log.warn("Score mismatch: claimed " .. score_val .. ", kills say " .. expected_score)
            return cn.res.json({ error = "Score mismatch" })
        end

        -- enforce score cap
        if score_val > MAX_SCORE then
            cn.res.status(400)
            return cn.res.json({ error = "Score exceeds maximum" })
        end

        -- check if name already exists
        local all = safe_get("highscores")
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

            -- claim unclaimed entry
            if existing_token == "" and client_token == "" then
                existing_token = cn.crypto.token()
                cn.db.update("highscores", { id = existing_id }, { token = existing_token })
            end

            -- only accept if new score is higher
            if score_val <= existing_score then
                cn.res.status(200)
                return cn.res.json({ scores = get_top(), qualified = false, token = existing_token })
            end

            cn.db.update("highscores", { id = existing_id }, { score = tostring(score_val) })
            prune_scores()
            cn.log.info("Highscore updated: " .. name .. " = " .. score_val)
            return cn.res.json({ scores = get_top(), qualified = true, token = existing_token })
        else
            -- new entry — check if qualifies for top 5
            local top = get_top()
            if #top >= MAX_ENTRIES and score_val < (top[MAX_ENTRIES].score or 0) then
                cn.res.status(200)
                return cn.res.json({ scores = top, qualified = false })
            end

            local new_token = cn.crypto.token()
            cn.db.set("highscores", {
                name = name,
                score = tostring(score_val),
                token = new_token
            })
            prune_scores()
            cn.log.info("New highscore: " .. name .. " = " .. score_val)
            return cn.res.json({ scores = get_top(), qualified = true, token = new_token })
        end
    end

    cn.res.status(405)
    return cn.res.json({ error = "Method not allowed" })
end
