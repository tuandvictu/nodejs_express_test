var mongoose = require('mongoose');

var LinkSchema = new mongoose.Schema({
    sentenceID: Number,
    translationID: Number,
})

mongoose.model('Link', LinkSchema);

const Link = mongoose.model('Link', LinkSchema);

module.exports = Link;