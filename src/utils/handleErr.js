const ErrorResponse = require(`./ErrorResponse`);

const handleErr = (res, err) => {
    let error = {...err};
    error.message = err.message;

    // Mongoose Bad ObjectID
    if (err.name === 'CastError') {
        const message = 'Ressource not found.';
        error = new ErrorResponse(404, message);
    }

    // Mongoose Duplicate Error
    if (err.code === 11000) {
        const message = 'Value that is entered and should be unique already exists. It could ussually be an email.';
        error = new ErrorResponse(400, message);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message);
        error = new ErrorResponse(400, message);
    }

    res.status(error.statusCode || 500).json({
        status: error.statusCode,
        error: error.message || 'It looks like there is an error on the server.'
    })
}

module.exports = handleErr;