const crypto = require(`crypto`);
const express = require(`express`);
const jwt = require(`jsonwebtoken`);
const rateLimit = require(`express-rate-limit`);

const User = require(`../models/User`);
const trwErr = require(`../utils/trwErr`);
const protect = require(`../middlewares/protect`);
const loginRateLimit = require(`../config/loginRateLimit`);

// ROUTER CONFIG
const router = express.Router();

// Register
router.post(`/register`, async (req, res) => {

    try {

        if (req.body.password !== req.body.confirmPassword) {
            return trwErr(res, 400, 'Password and confirm password must match.');
        }

        const filteredObj = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }

        const newUser = await User.create(filteredObj);

        const token = jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_DATE
        });

        res.cookie('token', token, {
            maxAge: 1000 * 60 * 60 * process.env.ACCESS_TOKEN_COOKIE_EXPIRE_DATE,
            httpOnly: true
        })

        newUser.password = undefined;

        res.status(201).json({
            status: 201,
            data: {
                user: newUser
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Login
router.post(`/login`, rateLimit(loginRateLimit), async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const currentUser = await User.findOne({ email: email });

        if (!currentUser) {
            return trwErr(res, 401, 'Email or password, or both, are incorrect.');
        }

        const match = await User.comparePasswords(password, currentUser.password);

        if (!match) {
            return trwErr(res, 401, 'Email or password, or both, are incorrect.');
        }

        const token = jwt.sign({ id: currentUser._id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_DATE
        })

        res.cookie('token', token, {
            maxAge: 1000 * 60 * 60 * process.env.ACCESS_TOKEN_COOKIE_EXPIRE_DATE,
            httpOnly: true
        })

        currentUser.password = undefined;

        res.status(200).json({
            status: 200,
            data: {
                user: currentUser
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Logout
router.get(`/logout`, async (req, res) => {

    try {

        res.cookie('token', '', {
            maxAge: 1,
            httpOnly: true
        })

        res.status(204).json(null);
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Forgot password
router.post(`/forgotPassword`, async (req, res) => {

    try {

        const email = req.body.email;

        const user = await User.findOne({ email: email });

        if (!user) {
            return trwErr(res, 400, 'Email is incorrect or such user does not exist.');
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.RESET_TOKEN_SECRET_KEY, {
            algorithm: process.env.RESET_TOKEN_ALGORITHM,
            expiresIn: process.env.RESET_TOKEN_EXPIRE_DATE
        })

        const link = `${process.env.BASE_URL}${process.env.PORT}/api/v1/auth/resetPassword/${resetToken}`;

        console.log(link);

        res.status(200).json({
            status: 200,
            msg: 'Link for resetting password should be sent to your email.'
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Reset password
router.patch(`/resetPassword/:token`, async (req, res) => {
    
    try {

        const resetToken = req.params.token;

        if (!resetToken) {
            return trwErr(res, 401, 'The token must have expired.');
        }

        const decoded = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET_KEY);

        const user = await User.findById(decoded.id);

        if (req.body.password !== req.body.confirmPassword) {
            return trwErr(res, 400, 'Password and confirm password must match.');
        }

        user.password = req.body.password;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_DATE
        })

        res.cookie('token', token, {
            maxAge: 1000 * 60 * 60 * process.env.ACCESS_TOKEN_COOKIE_EXPIRE_DATE,
            httpOnly: true
        })

        user.password = undefined;

        res.status(200).json({
            status: 200,
            data: {
                user: user
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Change password
router.patch(`/changePassword`, protect, async (req, res) => {

    try {

        const user = await User.findById(req.currentUserId);
        
        const oldPassword = req.body.oldPassword;

        const match = await User.comparePasswords(oldPassword, user.password);

        if (!match) {
            return trwErr(res, 401, 'Please provide the correct old password.');
        }

        if (req.body.password !== req.body.confirmPassword) {
            return trwErr(res, 400, 'Password and confirm password must match.');
        }

        user.password = req.body.password;
        await user.save();

        user.password = undefined;

        res.status(200).json({
            status: 200,
            data: {
                user: user
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

module.exports = router;