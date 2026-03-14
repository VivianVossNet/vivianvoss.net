-- csrf_token — CSRF token for form submissions
-- Copyright 2026 Vivian Voss. All rights reserved.
--
-- Called from templates via {( cnx:csrf_token )}
-- Generates a fresh token per page load, stores it server-side.
-- Extensions validate and consume tokens on POST.

local TOKEN_TTL = 7200 -- 2 hours

function fn(args)
    -- clean up expired tokens
    local ok, tokens = pcall(cn.db.get, "csrf_tokens")
    if ok and tokens then
        local now = os.time()
        for _, t in ipairs(tokens) do
            if t.id and (now - (tonumber(t.created) or 0)) > TOKEN_TTL then
                cn.db.delete("csrf_tokens", { id = t.id })
            end
        end
    end

    -- generate and store new token
    local token = cn.crypto.token()
    cn.db.set("csrf_tokens", {
        token = token,
        created = tostring(os.time())
    })

    return token
end
