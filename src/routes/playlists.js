const express = require(`express`);

const Playlist = require(`../models/Playlist`);
const User = require(`../models/User`);
const trwErr = require(`../utils/trwErr`);
const protect = require(`../middlewares/protect`);

// ROUTER CONFIG
const router = express.Router();

// ROUTE PROTECTION MIDDLEWARE
router.use(protect);

// Get all playlists
router.get(`/`, async (req, res) => {

    try {

        const playlists = await Playlist.find();

        res.status(200).json({
            status: 200,
            results: playlists.length,
            data: {
                playlists: playlists
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Get one playlist
router.get(`/:id`, async (req, res) => {

    try {

        const playlist = await Playlist.findById(req.params.id);

        res.status(200).json({
            status: 200,
            data: {
                playlist: playlist
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Create playlist
router.post(`/`, async (req, res) => {
    
    try {

        const user = await User.findById(req.currentUserId);

        const filteredObj = {
            userId: user._id,
            name: req.body.name,
            author: user.username
        }

        const newPlaylist = await Playlist.create(filteredObj);

        user.playlists += 1;
        await user.save();

        res.status(201).json({
            status: 201,
            data: {
                playlist: newPlaylist
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Update playlist
router.patch(`/:id`, async (req, res) => {
    
    try {

        const playlist = await Playlist.findById(req.params.id);
        const user = await User.findById(req.currentUserId);

        if (playlist.userId.valueOf() !== user._id.valueOf()) {
            return trwErr(res, 401, 'You can update only your playlist.');
        }

        playlist.name = req.body.name;
        await playlist.save();

        res.status(200).json({
            status: 200,
            data: {
                playlist: playlist
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Delete playlist
router.delete(`/:id`, async (req, res) => {

    try {

        const playlist = await Playlist.findById(req.params.id);
        const user = await User.findById(req.currentUserId);

        if (playlist.userId.valueOf() !== user._id.valueOf()) {
            return trwErr(res, 401, 'You can delete only your playlist.');
        }

        await Playlist.findByIdAndDelete(req.params.id);

        user.playlists -= 1;
        await user.save();

        res.status(204).json(null);
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

module.exports = router;