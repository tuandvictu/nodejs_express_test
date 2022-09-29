const { importCsv, createCsv} = require('./service/sentences');
const mongoose = require('mongoose');
const initHttpServer = require('./app');

// initialize connection to mongodb
mongoose.connect('mongodb://db:27017/test');
mongoose.set('debug', false);

require('./models/Sentences');

const files = [
    "assets/sentences.csv",
    "assets/sentences_with_audio.csv",
    "assets/links.csv"
];

const bootstrap = async () => {
    // import csv file && convert as required
    for (const file of files) {
        await importCsv(file);
    }

    // export csv
    await createCsv() 

    // start http server
    initHttpServer();
};
bootstrap()
