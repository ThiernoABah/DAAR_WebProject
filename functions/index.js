//firebase deploy --only functions --project prismaticos-ebe3f

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

exports.storageTreat = functions
.runWith({memory: "1GB", timeoutSeconds:540})
.storage.object()
.onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.    

    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), object.name);

    await bucket.file(filePath).download({destination: tempFilePath});

    var words = new Set();
    var textByLine = fs.readFileSync(tempFilePath).toString().split("\n");
    textByLine.forEach(async line => {
      var tmpMots = line.replace(/(\r\n|\n|\r)/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]'));
      tmpMots.forEach(async word =>{
        words.add(word);
      });
    });
    // console.log(words);
 
    var myMap = new Map();

    words.forEach(async w =>{
      myMap.set(w,"");
      var cpt = 0;
      textByLine.forEach(async line => {
        var tmpMots = line.replace(/(\r\n|\n|\r)/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]'));
        tmpMots.forEach(async word =>{
          if(w === word){
            old = myMap.get(w)
            if(old === ""){
              old = old +cpt
            }
            else{
              old = old +","+cpt
            }
            myMap.set(w,old)
          }
        });
        cpt = cpt + 1;
    })
  });
  // console.log(myMap);

    myMap.forEach(async (value, key) =>{
      if(key !== ''){
          db.collection('livres').doc(object.name).collection('mots').doc(key).set({lignes:value});
      }
    });

  });

 