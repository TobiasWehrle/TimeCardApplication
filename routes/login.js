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
        if (isEmpty(req.body.username) || isEmpty(req.body.password)) return res.status(400).send("username or password are not filled");

        const employee = await Employee.findOne({ username: req.body.username });
        if (isEmpty(employee) || employee.password !== req.body.password) return res.status(400).send("username or password are invalid");

        const token = employee.generateAuthToken();
        return res.header('x-auth-token', token).status(200).send(token);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

router.put('/changePassword', auth, async(req, res) => {
    try {
        validate(req.body);
        if (isEmpty(req.body.username) || isEmpty(req.body.newPassword)) return res.status(400).send("username or password are not filled");

        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));
        if (isEmpty(decoded)) return res.status(400).send("unable to decode jsonWebToken");

        const oldEmployee = await Employee.findOne({ username: req.body.username });
        if (isEmpty(oldEmployee) || oldEmployee.password !== req.body.oldPassword) return res.status(400).send("old password is not correct");

        await Employee.updateOne({ username: req.body.username }, { password: req.body.newPassword });

        const newEmployee = await Employee.findOne({ username: req.body.username });
        if (isEmpty(newEmployee) || newEmployee.password !== req.body.newPassword) return res.status(400).send("username or password are invalid");

        const token = newEmployee.generateAuthToken();
        return res.header('x-auth-token', token).status(200).send(token);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

function isEmpty(value) {
    return (value == null || value.length === 0);
}

module.exports = router;