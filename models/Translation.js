var mongoose = require('mongoose');

var TranslationSchema = new mongoose.Schema({
    id: Number,
    text: String,
    audio_url: String,
    translation_id: Number,
    translation_text: String,
})

const Translation = mongoose.model('Translation', TranslationSchema);

module.exports = Translation;