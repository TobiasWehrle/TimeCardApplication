const Joi = require('joi');
const mongoose = require('mongoose');

const DailyTimes = mongoose.model('dailyTimes', new mongoose.Schema({
    username: {
        type: String
    },
    state: {
        type: String
    },
    dateTime: {
        type: Date
    }
}), 'DailyTimes');

function validateDailyTimes(dailyTimes) {
    const schema = Joi.object({
        username: Joi.string(),
        state: Joi.string(),
        dateTime: Joi.string(),
    });

    return Joi.assert(dailyTimes, schema);
}

exports.DailyTimes = DailyTimes;
exports.validate = validateDailyTimes;