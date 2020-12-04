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
        if (isEmpty(req.body.username) || isEmpty(req.body.password)) return res.status(400).send("username or password are not filled");

        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));
        if (isEmpty(decoded)) return res.status(400).send("unable to decode jsonWebToken");

        await Employee.updateOne({ username: req.body.username }, { password: req.body.password });

        const employee = await Employee.findOne({ username: req.body.username });
        if (isEmpty(employee) || employee.password !== req.body.password) return res.status(400).send("username or password are invalid");

        const token = employee.generateAuthToken();
        return res.header('x-auth-token', token).status(200).send(token);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

router.get('/getEmployee', auth, async(req, res) => {
    try {
        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));
        if (isEmpty(decoded)) return res.status(400).send("unable to decode jsonWebToken");

        const employee = await Employee.findById(decoded._id);
        if (isEmpty(employee)) return res.status(400).send("no user found");

        res.status(200).send(employee);
    } catch (err) {
        return res.status(400).send(err);
    }
});

router.get('/getEmployees', auth, async(req, res) => {
    try {
        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));
        if (isEmpty(decoded)) return res.status(400).send("unable to decode jsonWebToken");

        const employees = await Employee.find();
        if (isEmpty(employees)) return res.status(400).send("no users found");

        res.status(200).send(employees);
    } catch (err) {
        return res.status(400).send(err);
    }
});

router.get('/getAdmins', auth, async(req, res) => {
    try {
        const decoded = jwt.verify(req.header("x-auth-token"), config.get('jwtPrivateKey'));
        if (isEmpty(decoded)) return res.status(400).send("unable to decode jsonWebToken");

        const admins = await Employee.find({ isAdmin: true });
        if (isEmpty(admins)) return res.status(400).send("no admins found");

        res.status(200).send(admins);
    } catch (err) {
        return res.status(400).send(err);
    }
});

function isEmpty(value) {
    return (value == null || value.length === 0);
}

module.exports = router;