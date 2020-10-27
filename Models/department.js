const Joi = require('joi');
const mongoose = require('mongoose');

const Department = mongoose.model('department', new mongoose.Schema({
    name: {
        type: String
    },
    location: {
        type: String
    },
    contact: {
        type: Number
    },
    lastChange: {
        type: Date
    },
    lastChangeUser: {
        type: String
    }
}));

function validateDepartment(department) {
    const schema = Joi.object({
        name: Joi.string(),
        location: Joi.string(),
        contact: Joi.number(),
        lastChange: Joi.date(),
        lastChangeUser: Joi.string()
    });

    return Joi.assert(department, schema);
}

exports.Department = department;
exports.validate = validateDepartment;