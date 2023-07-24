const mongoose = require(`mongoose`);

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Song must have a title.'],
        minlength: 3,
        maxlength: 50
    },
    artist: {
        type: String,
        required: [true, 'Song must have an artist.'],
        minlength: 3,
        maxlength: 25
    },
    lyrics: {
        type: String,
        minlength: 2,
        maxlength: 10000,
        default: 'This track has no lyrics.'
    },
    file: {
        type: String
    }
})

const Song = mongoose.model('Song', songSchema);

module.exports = Song;