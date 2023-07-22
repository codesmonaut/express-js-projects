const fs = require(`fs`);
const path = require(`path`);
const express = require(`express`);
const multer = require(`multer`);

const Song = require(`../models/Song`);
const trwErr = require(`../utils/trwErr`);



// MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'audio/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });



// ROUTER CONFIG
const router = express.Router();

// Get all songs
router.get(`/`, async (req, res) => {

    try {

        const songs = await Song.find();

        res.status(200).json({
            status: 200,
            results: songs.length,
            data: {
                songs: songs
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Get one song
router.get(`/:id`, async (req, res) => {

    try {

        const song = await Song.findById(req.params.id);

        res.status(200).json({
            status: 200,
            data: {
                song: song
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Create song
router.post(`/`, upload.single('song'), async (req, res) => {

    try {

        const obj = {
            title: req.body.title,
            artist: req.body.artist,
            lyrics: req.body.lyrics,
            file: `${req.file.filename}`
        }

        const newSong = await Song.create(obj);

        res.status(201).json({
            status: 201,
            data: {
                song: newSong
            }
        })
        
    } catch (err) {
        trwErr(res, 500, 'It looks like there is an error on the server.');
    }
})

// Update song
router.patch(`/:id`, async (req, res) => {

    try {

        const filteredObj = {
            title: req.body.title,
            artist: req.body.artist,
            lyrics: req.body.lyrics
        }

        const updatedSong = await Song.findByIdAndUpdate(req.params.id, filteredObj, {
            runValidators: true,
            new: true
        })

        res.status(200).json({
            status: 200,
            data: {
                song: updatedSong
            }
        })
        
    } catch (err) {
        trwErr(res, 500, err.message);
    }
})

// Delete song
router.delete(`/:id`, async (req, res) => {

    try {

        const song = await Song.findById(req.params.id);

        fs.unlink(`${__dirname}/../audio/${song.file}`, err => {
            
            if (err) {
                console.log(err.message);
            }
        })

        await Song.findByIdAndDelete(req.params.id);

        res.status(204).json(null);
        
    } catch (err) {
        trwErr(res, 500, err.message);
    }
})

// Play song
router.get(`/play/:id`, async (req, res) => {

    try {

        const song = await Song.findById(req.params.id);

        res.set('content-type', 'audio/mp3');
        res.set('accept-ranges', 'bytes');

        const songFilePath = `${__dirname}/../audio/${song.file}`;

        fs.createReadStream(songFilePath).pipe(res);
        
    } catch (err) {
        trwErr(res, 500, err.message);
    }
})

// Download song
router.get(`/download/:id`, async (req, res) => {

    try {

        const song = await Song.findById(req.params.id);

        res.download(`${__dirname}/../audio/${song.file}`);
        
    } catch (err) {
        trwErr(res, 500, err.message);
    }
})

module.exports = router;