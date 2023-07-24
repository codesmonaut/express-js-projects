const User = require(`../models/User`);
const trwErr = require(`../utils/trwErr`);

const restrict = async (req, res, next) => {
    const currentUser = await User.findById(req.currentUserId);

    if (!currentUser.isAdmin) {
        return trwErr(res, 401, 'You are not authorized to perform this action.');
    }

    next();
}

module.exports = restrict;