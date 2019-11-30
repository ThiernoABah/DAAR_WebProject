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
    textByLine.forEach(line => {
      var tmpMots = line.replace(/(\r\n|\n|\r)/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]|[/]|[:]|[;]'));
      tmpMots.forEach(word =>{
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
    console.log(myMap);
    console.log(myMap.size);
    cpt2 = 0
    // cette partie marche pas pour de grand document gaffe au cpt2 < 500
    myMap.forEach(async(value, key) =>{
   //   if(key !== '' && cpt2<500){

          db.collection('livres').doc(object.name).collection('mots').doc(key.replace("/","")).create({key:value});
          // db.collection('livres').doc(object.name).collection('mots').doc("APPPP"+cpt2).create({lignes:"2"});

          // console.log("ici"+object.name+":"+key+":"+value);
          cpt2 = cpt2 + 1
 //     }
    });

    // console.log("cpt2 : "+cpt2+" cpt 1 :"+cpt);
    // return sleep(2000)
  });

 