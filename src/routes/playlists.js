const express = require(`express`);

const Playlist = require(`../models/Playlist`);
const User = require(`../models/User`);
const Song = require(`../models/Song`);
const trwErr = require(`../utils/trwErr`);
const protect = require(`../middlewares/protect`);
const restrict = require(`../middlewares/restrict`);

// ROUTER CONFIG
const router = express.Router();

// ROUTE PROTECTION MIDDLEWARE
router.use(protect);

// Get account playlists
router.get(`/accountPlaylists`, async (req, res) => {

    try {

        const account = await User.findById(req.currentUserId);
        const playlists = await Playlist.find({ userId: account._id });

        if (playlists.length === 0) {
            return trwErr(res, 400, 'You need to create playlists in order to see them and user them.');
        }

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

// Get one account playlist
router.get(`/accountPlaylist/:id`, async (req, res) => {

    try {

        const account = await User.findById(req.currentUserId);
        const playlist = await Playlist.findById(req.params.id);

        if (playlist.userId.valueOf() !== account._id.valueOf()) {
            return (res, 401, 'On this route you can see only your playlist.');
        }

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

// Make new playlist
router.post(`/makeNewPlaylist`, async (req, res) => {
    
    try {

        const user = await User.findById(req.currentUserId);

        const filteredObj = {
            userId: user._id,
            name: req.body.name,
            author: user.username,
            isPrivate: req.body.isPrivate
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

// Change playlist
router.patch(`/changePlaylist/:id`, async (req, res) => {
    
    try {

        const playlist = await Playlist.findById(req.params.id);
        const user = await User.findById(req.currentUserId);

        if (playlist.userId.valueOf() !== user._id.valueOf()) {
            return trwErr(res, 401, 'You can update only your playlist.');
        }

        const filteredObj = {
            name: req.body.name,
            isPrivate: req.body.isPrivate
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(req.params.id, filteredObj, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 200,
            data: {
                playlist: updatedPlaylist
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Delete account playlist
router.delete(`/deletePlaylist/:id`, async (req, res) => {

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

// Add song
router.patch(`/addSong/:id`, async (req, res) => {

    try {

        const playlist = await Playlist.findById(req.params.id);
        const user = await User.findById(req.currentUserId);
        const song = await Song.findById(req.body.songId);

        if (playlist.userId.valueOf() !== user._id.valueOf()) {
            return trwErr(res, 400, 'You can add song only to your playlist.');
        }

        if (playlist.songs.includes(song._id)) {
            return trwErr(res, 400, 'That song is already in playlist.');
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(req.params.id, {
            $push: { songs: song._id },
            $inc: { songsNum: 1 }
        }, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 200,
            data: {
                playlist: updatedPlaylist
            }
        })
        
    } catch (err) {
        trwErr(res, 500, err.message);
    }
})

// Remove song
router.patch(`/removeSong/:id`, async (req, res) => {

    try {

        const playlist = await Playlist.findById(req.params.id);
        const user = await User.findById(req.currentUserId);
        const song = await Song.findById(req.body.songId);

        if (playlist.userId.valueOf() !== user._id.valueOf()) {
            return trwErr(res, 401, 'You can remove song only from your playlist.');
        }

        if (!playlist.songs.includes(song._id)) {
            return trwErr(  res, 400, 'You can remove only the song that is in the playlist.');
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(req.params.id, {
            $pull: { songs: song._id },
            $inc: { songsNum: -1 }
        }, {
            new: true,
            runValidators: true
        })

        res.status(204).json(null);
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Get user playlists
router.get(`/userPlaylists/:id`, async (req, res) => {

    try {

        const account = await User.findById(req.currentUserId);

        if (account._id.valueOf() === req.params.id) {
            return res.redirect(`/api/v1/playlists/accountPlaylists`);
        }

        const user = await User.findById(req.params.id);
        const playlists = await Playlist.find({ userId: user._id, isPrivate: false });

        res.status(200).json({
            status: 200,
            results: playlists.length,
            data: {
                user: {
                    username: user.username,
                    picture: user.picture,
                    playlists: user.playlists
                },
                playlists: playlists
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Get one user playlist
router.get(`/userPlaylist/:id`, async (req, res) => {

    try {

        const account = await User.findById(req.currentUserId);
        const playlist = await Playlist.findById(req.params.id);
        const user = await User.findById(playlist.userId);

        if (account._id.valueOf() === user._id.valueOf()) {
            return res.redirect(`/api/v1/playlists/accountPlaylist/${req.params.id}`);
        }

        if (playlist.isPrivate) {
            return trwErr(res, 401, 'This playlist is private.');
        }

        res.status(200).json({
            status: 200,
            data: {
                user: {
                    username: user.username,
                    picture: user.picture
                },
                playlist: playlist
            }
        })
        
    } catch (err) {
        
    }
})

// ROUTE RESTRICTION MIDDLEWARE
router.use(restrict);

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

        const currentAdmin = await User.findById(req.currentUserId);
        
        const filteredObj = {
            userId: currentAdmin._id,
            name: req.body.name,
            author: currentAdmin.username,
            isPrivate: req.body.isPrivate
        }

        const newPlaylist = await Playlist.create(filteredObj);

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

        const filteredObj = {
            name: req.body.name,
            songs: req.body.songs,
            isPrivate: req.body.isPrivate
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(req.params.id, filteredObj, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 200,
            data: {
                playlist: updatedPlaylist
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Delete playlist
router.delete(`/:id`, async (req, res) => {

    try {

        await Playlist.findByIdAndDelete(req.params.id);

        res.status(204).json(null);
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

module.exports = router;