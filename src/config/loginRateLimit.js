const loginRateLimit = {
    windowMs: 1000 * 60 * 60,
    max: 3,
    message: 'Too many login attempts from same IP. Try again in an hour.'
}

module.exports = loginRateLimit;