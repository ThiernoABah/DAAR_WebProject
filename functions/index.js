const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const path = require('path');
const os = require('os');
const fs = require('fs');

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.storageTreat = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.    

    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), object.name);

    await bucket.file(filePath).download({destination: tempFilePath});

    var words = new Set();
    var textByLine = fs.readFileSync(tempFilePath).toString().split("\n");
    textByLine.forEach(async line => {
      var numFruit = line.replace(/(\r\n|\n|\r)/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]'));
      numFruit.forEach(async word =>{
        words.add(word);
      });
    });
    console.log(words);

/// A CORRIGER ////
    var line = 0;
    words.forEach(async w =>{
      db.collection('livres').doc(w).set({lignes:""});
      textByLine.forEach(async line => {
        var numFruit = line.replace(/(\r\n|\n|\r)/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]'));
        numFruit.forEach(async word =>{
          if(w === word){
            old = db.collection('livres').doc(w).get(lignes);
            old = old +","+line
            db.collection('livres').doc(w).update({lignes,old});
          }
        });
        line = line + 1;
    })
  });

  ////

  
  //   fs.readFile(tempFilePath, function (err, data) {
  //   if (err) {
  //      return console.error(err);
  //      }
  //      db.collection('livres').add({titre:object.name, auteur:data.toString()})
  //    });

  });