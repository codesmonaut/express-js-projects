const mongoose = require(`mongoose`);
const validator = require(`validator`);
const bcrypt = require(`bcryptjs`);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'User must have username.'],
        minlength: 3,
        maxlength: 25
    },
    email: {
        type: String,
        required: [true, 'User must have an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email must be valid.']
    },
    password: {
        type: String,
        required: [true, 'User must have password.'],
        minlength: 6
    },
    picture: {
        type: String,
        default: 'default.png'
    },
    playlists: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

userSchema.pre(`save`, async function (next) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.statics.comparePasswords = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword);
}

const User = mongoose.model('User', userSchema);

module.exports = User;