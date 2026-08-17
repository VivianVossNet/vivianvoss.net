-- game_token — CSRF token for game score submissions
-- Copyright 2026 Vivian Voss. All rights reserved.
--
-- Called from templates via {( cnx:game_token )}
-- Generates a fresh token per page load, stores it server-side.
-- The highscores extension validates and consumes it on POST.

local TOKEN_TTL = 7200 -- 2 hours

function fn(args)
    -- clean up expired tokens
    local ok, tokens = pcall(cn.db.get, "game_tokens")
    if ok and tokens then
        local now = os.time()
        for _, t in ipairs(tokens) do
            if t.id and (now - (tonumber(t.created) or 0)) > TOKEN_TTL then
                cn.db.delete("game_tokens", { id = t.id })
            end
        end
    end

    -- generate and store new token
    local token = cn.crypto.token()
    cn.db.set("game_tokens", {
        token = token,
        created = tostring(os.time())
    })

    return token
end
