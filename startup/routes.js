const express = require('express');
const employee = require('../routes/employee');
const login = require('../routes/login');
const times = require('../routes/times');
const vacation = require('../routes/vacation');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/login', login);
    app.use('/api/employee', employee);
    app.use('/api/times', times);
    app.use('/api/vacation', vacation);
}