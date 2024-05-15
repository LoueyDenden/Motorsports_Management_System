const mongoose = require('mongoose');

const motoGPSchema = new mongoose.Schema({
    name: String,
    team: String,
});

const MotoGP = mongoose.model('MotoGP', motoGPSchema);

module.exports = MotoGP;