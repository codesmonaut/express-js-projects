const User = require(`../models/User`);
const ErrorResponse = require(`../utils/ErrorResponse`);
const handleErr = require(`../utils/handleErr`);

const restrict = async (req, res, next) => {
    const currentUser = await User.findById(req.currentUserId);

    if (!currentUser.isAdmin) {
        return handleErr(res, new ErrorResponse(401, 'You are not authorized to perform this action.'));
    }

    next();
}

module.exports = restrict;