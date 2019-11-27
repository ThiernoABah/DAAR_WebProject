const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const path = require('path');
const os = require('os');

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

    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(tempFilePath)
      });

      var x = new Set();
      // new RegExp(' |[.]|[,]|[?]|[!]')
      lineReader.on('line', function (line) {
        var res = line.split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]'));
        var cpt;
        for (cpt = 0; cpt < res.length; cpt++) {
            x.add(res[cpt]);
        }
      });
      await sleep(2000)
      console.log(x);

  //   fs.readFile(tempFilePath, function (err, data) {
  //   if (err) {
  //      return console.error(err);
  //      }
  //      db.collection('livres').add({titre:object.name, auteur:data.toString()})
  //    });

  });