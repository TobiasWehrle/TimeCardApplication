const express = require('express');
const employee = require('../routes/employee');
const times = require('../routes/times');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/employee', employee);
    app.use('/api/times', times);
}