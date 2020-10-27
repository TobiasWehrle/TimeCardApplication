const Joi = require('joi');
const mongoose = require('mongoose');

const VacationRequests = mongoose.model('vacationRequests', new mongoose.Schema({
    applicant: {
        type: String
    },
    approver: {
        type: String
    },
    startOfVacation: {
        type: Date
    },
    endOfVacation: {
        type: Date
    },
    createDate: {
        type: Date
    }
}));

function validateVacationRequests(vacationRequests) {
    const schema = Joi.object({
        applicant: Joi.string(),
        approver: Joi.string(),
        startOfVacation: Joi.date(),
        endOfVacation: Joi.date(),
        createDate: Joi.date()
    });

    return Joi.assert(vacationRequests, schema);
}

exports.VacationRequests = vacationRequests;
exports.validate = validateVacationRequests;