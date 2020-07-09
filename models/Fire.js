const { Schema, model } = require('mongoose');

const Fire = new Schema({
    locCode: Number,
    fires: [
        {
            id: Number, // unique ID, throw error upon fire creation if fire doesn't exist -- VERY IMPORTANT
            description: String,
            severity: Number,
            active: Boolean,
            timestamp: Number,
            humanFriendlyTimestamp: String,
            instantiatedBy: String
        }
    ]
})

module.exports = model('Fire', Fire)