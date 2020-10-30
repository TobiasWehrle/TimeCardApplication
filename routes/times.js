const { DailyTimes, validate } = require('../models/dailyTimes');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const formatISO = require('date-fns/formatISO');
const isValid = require('date-fns/isValid');
const config = require('config');
const { Router, json } = require('express');
const router = Router();



router.post('/writeTimes', auth, async(req, res) => {
    try {
        validate(req.body);
        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));
        if (decoded === null) return res.status(400).send("unable to decode jsonWebToken");

        const dailyTime = await DailyTimes.create({ username: decoded.username, state: req.body.state, dateTime: formatISO(Date.now()) });
        if (dailyTime === null) return res.status(400).send("unable to insert time");

        return res.status(200).send(dailyTime);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

router.get('/:username', auth, async(req, res) => {
    try {
        let currentDate = new Date(Date.now());
        let dateTimeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 1);
        let dateTimeMax = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 0);

        if (!isValid(dateTimeMin) || !isValid(dateTimeMax)) {
            return res.status(400).send("invalid date");
        }

        const dailyTimes = await DailyTimes.find({ username: req.params.username, dateTime: { $gt: dateTimeMin, $lt: dateTimeMax } }).sort("asc");
        if (isEmpty(dailyTimes)) return res.status(400).send("no time found");

        return res.status(200).send(dailyTimes);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

router.get('/getLastTime/:username', auth, async(req, res) => {
    try {
        let currentDate = new Date(Date.now());
        let dateTimeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 1);
        let dateTimeMax = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 0);

        if (!isValid(dateTimeMin) || !isValid(dateTimeMax)) {
            return res.status(400).send("invalid date");
        }

        const dailyTimes = await DailyTimes.findOne({ username: req.params.username, dateTime: { $gt: dateTimeMin, $lt: dateTimeMax } }).sort({ dateTime: -1 });
        if (isEmpty(dailyTimes)) return res.status(400).send("no time found");

        return res.status(200).send(dailyTimes);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

function isEmpty(value) {
    return (value == null || value.length === 0);
}

module.exports = router;