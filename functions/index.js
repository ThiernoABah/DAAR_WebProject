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
.region('europe-west2')
.runWith({memory: "1GB", timeoutSeconds:540})
.storage.object()
.onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.

    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), object.name);

    await bucket.file(filePath).download({destination: tempFilePath});

    var data = {};
    var cpt = 0;

    var textByLine = fs.readFileSync(tempFilePath).toString().split("\n");
    textByLine.forEach(line => {
      var tmpMots = line.replace(/(\r\n|\n|\r|[-]|["])/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]|[/]|[:]|[;]|["]|[@]|[*]|[0-9]|[-]|[\']|[_]'));
      
      tmpMots.forEach(word =>{
        if(word.length>2){
          if(data.hasOwnProperty(word.toLowerCase())){
           data[word.toLowerCase()] = data[word.toLowerCase()] + 1
          }
         else{
            data[word.toLowerCase()] = 1
          }
       }
        
      });
      cpt = cpt + 1;
    });

    await db.collection('livres').doc(object.name).set(data)
    
  });

  exports.allBooks = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {

    var msg = {};
    i = 1;
    db.collection('livres').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          msg[i] = doc.id;
          i = i + 1;
        });
        return res.send({books : msg});
    })
    .catch(error =>{
      console.log(error)
      res.status(500).send(error)
    });

    console.log(msg);

  });

  exports.getBook = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {
 
    var book = req.path.replace("/","");

  db.collection('livres').doc(book).get().then(snapshot => {
    const d = snapshot.data()
    return res.send(d)

 })
 .catch(error =>{
  console.log(error)
  res.status(500).send(error)
})

  });

  exports.deleteBook = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {
 
    var book = req.path.replace("/","");

  db.collection('livres').doc(book).delete();
  return res.send(book+"deleted");

  });

 