const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { format } = require('@fast-csv/format');
const Link = require('../models/Link');
const Sentences = require('../models/Sentences');
const SentencesWithAudio = require('../models/SentencesWithAudio');
const Translation = require('../models/Translation');

exports.importCsv = async (filePath) => {
    let bulk = [];
    const stream = fs.createReadStream(path.resolve(__dirname, "..", filePath))
        .pipe(csv.parse({
            headers: false,
            delimiter: "\n",
            strictColumnHandling: true
        }))
        .on('error', error => console.error(error))
        .on('data-invalid', (row, number, error) => {
            console.log(row, number, error);
        })
        .on('data', async (row) => {
            bulk.push(row);
            if (bulk.length >= 50) {
                stream.pause();
                if (filePath.includes("sentences_with_audio")) {
                    await insertSentenceWithAudio(bulk)
                } else if (filePath.includes("sentences")) {
                    await insertSentences(bulk)
                } else {
                    await insertLinks(bulk)
                }
                bulk = []
                stream.resume();
            }
        })
        .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
}


const insertSentences = async (bulk) => {
    try {
        let sentences = bulk.map(row => {
            let arr = row[0].split("\t")
            return {
                sentenceID: parseInt(arr[0]),
                lang: arr[1],
                text: arr[2]
            }
        });

        sentences = sentences.filter(sentence => {
            if (sentence.lang == "eng" || sentence.lang == "vie") {
                return sentence;
            }
        });

        const result = await Sentences.insertMany(sentences);
    } catch (error) {
        console.log(error);
        return error
    }

}

const insertLinks = async (bulk) => { 
    try {
        let links = bulk.map(row => {
            let arr = row[0].split("\t")
        return {
            sentenceID: parseInt(arr[0]),
            translationID: parseInt(arr[1]),
        }
    });

    const result = await Link.insertMany(links)

    } catch (error) {
        return error
    }
}

const insertSentenceWithAudio = async (arr) => {
    try {
        let sentencesWithAudio = bulk.map(row => {
            let arr = row.split("\t")
            return {
                sentenceID: parseInt(arr[0]),
                attributionURL: arr[3],
            }
        });

        const result = SentencesWithAudio.insertMany(sentencesWithAudio)

    } catch (error) {
        return error
    }
}

exports.createCsv = async () => {
    // execute query list sentences is english    
    const csvFile = fs.createWriteStream("output.csv");
    const stream = format({
        headers: ["sentence_id", "text", "url", "translation_id", "translation_text"],
        delimiter: '\t'
    });
    stream.pipe(csvFile);
    const cursor = Sentences.find({ lang: 'eng' }).cursor();
    for (
        let sentence = await cursor.next();
        sentence != null;
        sentence = await cursor.next()
    ) {
        try {
            // execute query to find url of sentence english's audio
            const sentencesUrlEnglishAudio = await SentencesWithAudio.findOne({ sentenceID: sentence.sentenceID })

            // execute query to fine transaltion_ids by sentence_id
            const links = await Link.find({
                sentenceID: sentence.sentenceID
            })
            // find translation english to vietnamese
            const vietNameSentence = await findVietNameTranslation(links, [sentence.sentenceID]);
            const obj = {
                sentence_id: sentence.sentenceID,
                text: sentence.text,
                url: sentencesUrlEnglishAudio ? sentencesUrlEnglishAudio.attributionURL : null,
                translation_id: vietNameSentence ? vietNameSentence.sentenceID : null,
                translation_text: vietNameSentence ? vietNameSentence.text : null,
            }
            // write csv
            stream.write(Object.values(obj));

            // insert into db
            const model = new Translation(obj)

            await model.save()

        } catch (error) {
            console.log(error);
            continue;
        }
    }
    stream.end()
}

const findVietNameTranslation = async (links, ids) => {
    for (const link of links) {
        const ignoreIds = ids || [];
        const sentence = await Sentences.findOne({ sentenceID: link.translationID, lang: "vie" });
        if (sentence) {
            return sentence
        }
        if (!ignoreIds.includes(link.translationID)) ignoreIds.push(link.translationID)
        const subLinks = await Link.find({ sentenceID: link.translationID, translationID: { $nin: ignoreIds } });
        return await findVietNameTranslation(subLinks, ignoreIds);
    }
}

exports.listTranslations = async (pageSize, pageIndex) => {
    const translations = await Translation.find().skip((pageIndex - 1) * pageSize).limit(pageSize);

    return translations
}

