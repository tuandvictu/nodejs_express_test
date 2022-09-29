var mongoose = require('mongoose');

var SentencesWithAudioSchema = new mongoose.Schema({
    sentenceID: Number,
    attributionURL: String,
})

const SentencesWithAudio = mongoose.model('SentencesWithAudio', SentencesWithAudioSchema);

module.exports = SentencesWithAudio;