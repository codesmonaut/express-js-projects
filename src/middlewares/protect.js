const jwt = require(`jsonwebtoken`);

const trwErr = require(`../utils/trwErr`);

const protect = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return trwErr(res, 401, 'You need to login in order to proceed.');
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, decoded) => {

        if (err) {
            console.log(err.message);
        }

        if (decoded) {
            req.currentUserId = decoded.id;
            next();
        }
    })
}

module.exports = protect;