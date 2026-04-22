-- csrf_token — CSRF token for form submissions
-- Copyright 2026 Vivian Voss. All rights reserved.
--
-- Called from templates via {( cmxt:csrf_token )}
-- Generates a fresh token per page load, stores it server-side.

function fn(args)
    -- generate token using math.random (no cn.crypto in 0.9.10)
    local chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    local token = ""
    for i = 1, 64 do
        local idx = math.random(1, #chars)
        token = token .. chars:sub(idx, idx)
    end

    cn.db.set("csrf_tokens", {
        token = token
    })

    return token
end
