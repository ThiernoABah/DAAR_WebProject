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

exports.storageTreat = functions
.runWith({memory: "1GB", timeoutSeconds:540})
.storage.object()
.onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.

    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), object.name);

    await bucket.file(filePath).download({destination: tempFilePath});

    var myMap = new Map();
    var cpt = 0;

    var textByLine = fs.readFileSync(tempFilePath).toString().split("\n");
    textByLine.forEach(async line => {
      var tmpMots = line.replace(/(\r\n|\n|\r)/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]'));
      tmpMots.forEach(async word =>{
        if(word.length>2){
          if(!myMap.has(word)){
            myMap.set(word,String(cpt));
          }
          else{
            myMap.set(word,myMap.get(word)+","+cpt);
          }
        }
      });
      cpt = cpt + 1;
    });
    // console.log(myMap);
 
    // cette partie marche pas pour de grand document
    return myMap.forEach(async (value, key) =>{
      if(key !== ''){
          db.collection('livres').doc(object.name).collection('mots').doc(key.replace("/","")).set({lignes:value});
      }
    });

    // return sleep(2000)
  });

 