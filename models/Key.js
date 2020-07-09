const { Schema, model } = require('mongoose');

const Key = new Schema({
    key: String,
    uses: {
        default: 0,
        type: Number
    },
    authLevel: {
        default: 0,
        type: Number
    }
})

module.exports = model('Key', Key);