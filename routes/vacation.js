const { VacationRequests, validate } = require('../models/vacationRequests');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const formatISO = require('date-fns/formatISO');
const isValid = require('date-fns/isValid');
const config = require('config');
const { Router, json } = require('express');
const { date } = require('joi');
const router = Router();

router.post('/writeVacationRequest', auth, async(req, res) => {
    try {
        validate(req.body);
        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));
        if (isEmpty(decoded)) return res.status(400).send("unable to decode jsonWebToken");

        const vacationRequest = await VacationRequests.create({ applicant: req.body.applicant, approver: req.body.approver, startOfVacation: req.body.startOfVacation, endOfVacation: req.body.endOfVacation, createDate: formatISO(Date.now()) });
        if (isEmpty(vacationRequest)) return res.status(400).send("unable to insert time");

        return res.status(200).send(vacationRequest);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

function isEmpty(value) {
    return (value == null || value.length === 0);
}

module.exports = router;