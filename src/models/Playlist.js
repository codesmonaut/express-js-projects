const mongoose = require(`mongoose`);

const playlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
    },
    name: {
        type: String,
        required: [true, 'Playlist must have a name.'],
        minlength: 3,
        maxlength: 50
    },
    songs: {
        type: Array,
        default: []
    },
    songsNum: {
        type: Number,
        default: 0
    },
    author: {
        type: String,
        required: [true, 'Playlist must have an author.']
    },
    isPrivate: {
        type: Boolean,
        default: false
    }
})

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;