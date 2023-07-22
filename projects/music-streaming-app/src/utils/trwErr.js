const trwErr = (res, statusCode, message) => {
    res.status(statusCode).json({
        status: statusCode,
        msg: message
    })
}

module.exports = trwErr;