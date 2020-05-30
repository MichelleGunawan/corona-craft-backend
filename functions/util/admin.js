const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert(require('./admin.json')),
    storageBucket: "gs://corona-craft-2dfcb.appspot.com/",
    databaseURL: "https://corona-craft-2dfcb.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db};