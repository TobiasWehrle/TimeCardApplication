const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const { min } = require('date-fns');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String
    },
    abbreviation: {
        type: String
    },
    employeeNumber: {
        type: Number
    },
    username: {
        type: String,
        minlength: 5
    },
    password: {
        type: String,
        minlength: 5
    },
    department: {
        type: String
    },
    eMail: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    leaveCredit: {
        type: String
    },
    flexiTimeCredit: {
        type: String
    },
    targetTime: {
        type: Number
    },
    isAdmin: {
        type: Boolean
    }
});

employeeSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin, username: this.username }, config.get('jwtPrivateKey'));
    return token;
}

const Employee = mongoose.model('Employee', employeeSchema, "Employee");

function validateEmployee(employee) {
    const schema = Joi.object({
        name: Joi.string(),
        abbreviation: Joi.string(),
        employeeNumber: Joi.number(),
        role: Joi.string(),
        username: Joi.string().min(5),
        password: Joi.string().min(5),
        department: Joi.string(),
        eMail: Joi.string(),
        phoneNumber: Joi.string(),
        leaveCredit: Joi.string(),
        flexiTimeCredit: Joi.string(),
        targetTime: Joi.number(),
    });

    return Joi.assert(employee, schema);
}

exports.Employee = Employee;
exports.validate = validateEmployee;