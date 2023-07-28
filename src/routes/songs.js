const fs = require(`fs`);
const path = require(`path`);
const express = require(`express`);
const multer = require(`multer`);

const Song = require(`../models/Song`);
const protect = require(`../middlewares/protect`);
const restrict = require(`../middlewares/restrict`);
const handleErr = require(`../utils/handleErr`);



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

// ROUTE PROTECTION MIDDLEWARE
router.use(protect);

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
        handleErr(res, err);
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
        handleErr(res, err);
    }
})

// Create song
router.post(`/`, restrict, upload.single('song'), async (req, res) => {

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
        handleErr(res, err);
    }
})

// Update song
router.patch(`/:id`, restrict, async (req, res) => {

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
        handleErr(res, err);
    }
})

// Delete song
router.delete(`/:id`, restrict, async (req, res) => {

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
        handleErr(res, err);
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
        handleErr(res, err);
    }
})

// Download song
router.get(`/download/:id`, async (req, res) => {

    try {

        const song = await Song.findById(req.params.id);

        res.download(`${__dirname}/../audio/${song.file}`);
        
    } catch (err) {
        handleErr(res, err);
    }
})

module.exports = router;