const {MongoClient} = require('mongodb');

const uri = process.env.mongodb_url;
const dbname = process.env.mongodb_db_name;

const instant = {
    getMongoClient: () => {
        return new MongoClient(uri);
    },
    getDbName: () => {
        return dbname;
    }
}

module.exports = instant;