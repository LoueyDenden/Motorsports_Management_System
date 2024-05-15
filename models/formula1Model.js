const mongoose = require('mongoose');

const formula1Schema = new mongoose.Schema({
    name: String,
    team: String,
});

const Formula1 = mongoose.model('Formula1', formula1Schema);

module.exports = Formula1;