const { Employee, validate } = require('../models/employee');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');

router.post('/validateLogin', async(req, res) => {
    try {
        validate(req.body);

        const employee = await Employee.findOne({ username: req.body.username });
        if (employee == null) return res.status(400).send("no user found");
        if (employee.password !== req.body.password) return res.status(400).send("invalid password");

        const token = employee.generateAuthToken();
        return res.header('x-auth-token', token).status(200).send(token);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

router.get('/getEmployee', auth, async(req, res) => {
    try {
        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));

        const employee = await Employee.findById(decoded._id);
        res.status(200).send(employee);
    } catch (err) {
        return res.status(500).send(err);
    }
});

module.exports = router;