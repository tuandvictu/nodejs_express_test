var mongoose = require('mongoose');

var SentencesSchema = new mongoose.Schema({
    sentenceID: Number,
    lang: String,
    text: String,
})

const Sentences = mongoose.model('Sentences', SentencesSchema);

module.exports = Sentences;