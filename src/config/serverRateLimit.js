const serverRateLimit = {
    windowMs: 1000 * 60 * 60,
    max: 100,
    message: 'Too many requests from the same IP. Try again in an hour.'
}

module.exports = serverRateLimit;