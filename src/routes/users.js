const path = require(`path`);
const express = require(`express`);
const multer = require(`multer`);

const User = require(`../models/User`);
const trwErr = require(`../utils/trwErr`);
const protect = require(`../middlewares/protect`);
const restrict = require(`../middlewares/restrict`);



// MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });



// ROUTER CONFIG
const router = express.Router();

// ROUTE PROTECTION MIDDLEWARE
router.use(protect);

// Get current account
router.get(`/account`, async (req, res) => {

    try {
        
        const account = await User.findById(req.currentUserId);

        account.password = undefined;

        res.status(200).json({
            status: 200,
            data: {
                account: account
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Update current account
router.patch(`/updateAccount`, async (req, res) => {

    try {

        if (req.body.password) {
            return trwErr(res, 400, 'You can change password on /changePassword route.');
        }

        if (req.body.picture) {
            return trwErr(res, 400, 'You can change picture on /changePicture route.');
        }

        const filteredObj = {
            username: req.body.username,
            email: req.body.email,
        }

        const updatedAccount = await User.findByIdAndUpdate(req.currentUserId, filteredObj, {
            new: true,
            runValidators: true
        })

        updatedAccount.password = undefined;

        res.status(200).json({
            status: 200,
            data: {
                account: updatedAccount
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Delete current account
router.delete(`/deleteAccount`, async (req, res) => {

    try {

        await User.findByIdAndDelete(req.currentUserId);

        res.cookie('token', '', {
            maxAge: 1,
            httpOnly: true
        })

        res.status(204).json(null);
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Change picture
router.patch(`/changePicture`, upload.single('picture'), async (req, res) => {

    try {

        const account = await User.findById(req.currentUserId);

        account.picture = req.file.filename;
        await account.save();

        account.password = undefined;

        res.status(200).json({
            data: {
                account: account
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Get all users
router.get(`/`, restrict, async (req, res) => {

    try {

        const users = await User.find();

        res.status(200).json({
            status: 200,
            results: users.length,
            data: {
                users: users
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Get one user
router.get(`/:id`, restrict, async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

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

// Update user
router.patch(`/:id`, restrict, async (req, res) => {

    try {

        const filteredObj = {
            username: req.body.username,
            email: req.body.email,
            playlists: req.body.playlists,
            isAdmin: req.body.isAdmin
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredObj, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 200,
            data: {
                user: updatedUser
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Delete user
router.delete(`/:id`, restrict, async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id);

        res.status(204).json(null);
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

module.exports = router;