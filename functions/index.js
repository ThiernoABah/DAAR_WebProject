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
    var lines;

    if(object.name === "id_node.txt"){
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== ""){
          data[node] = tmpMots[1];  
        }
       } );
       await db.collection('graphe').doc(object.name).set(data)

    }else if(object.name === "graph.txt"){
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== ""){
          for(i = 1;i<tmpMots.length;i++){
            if(data.hasOwnProperty(node)){
            data[node] = data[node] + " " + tmpMots[i]
            }
            else{
              data[node] = tmpMots[i]
            }
          } 
        }
       } );
       await db.collection('graphe').doc(object.name).set(data)
    }
    else if(object.name === "closeness.txt"){
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== ""){
          data[node] = tmpMots[1];  
        }
       } );
       await db.collection('centrality').doc(object.name).set(data) 
    }
    else if(object.name === "pagerank.txt"){
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== ""){
          data[node] = tmpMots[1];  
        }
       } );
       await db.collection('centrality').doc(object.name).set(data)
    }
    else if(object.name === "suggest_closeness.txt"){
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== ""){
          for(i = 1;i<tmpMots.length;i++){
            if(data.hasOwnProperty(node)){
            data[node] = data[node] + " " + tmpMots[i]
            }
            else{
              data[node] = tmpMots[i]
            }
          } 
        }
       } );
       await db.collection('suggest').doc(object.name).set(data)
    }
    else if(object.name === "suggest_pagerank.txt"){
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== ""){
          for(i = 1;i<tmpMots.length;i++){
            if(data.hasOwnProperty(node)){
            data[node] = data[node] + " " + tmpMots[i]
            }
            else{
              data[node] = tmpMots[i]
            }
          } 
        }
       } );
       await db.collection('suggest').doc(object.name).set(data)
    }
    else{

  
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        //var tmpMots = line.replace(/(\r\n|\n|\r|[-]|["])/gm," ").split(new RegExp(' |[.]|[,]|[?]|[!]|[)]|[(]|[[]|[]]|[/]|[:]|[;]|["]|[@]|[*]|[0-9]|[-]|[\']|[_]'));
        var tmpMots = line.replace(/(\r\n|\n|\r|[-]|["])/gm," ").split(new RegExp("[^a-zA-Z']+"));
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

      });
  
      await db.collection('livres').doc(object.name).set(data)
    }
    
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

  exports.search = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {
 
  r = {}
  var word = req.path.replace("/","");

  db.collection('livres').get().then(querySnapshot => {
    querySnapshot.forEach(book => {
      d = book.data()
      r[book.id] = d[word]
    });
    return res.send(r);
  })
  .catch(error =>{
  console.log(error)
  res.status(500).send(error)});
  });

  exports.suggestUsingCloseness = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {
 
  r = {}
  var book = req.path.replace("/","");
  db.collection('suggest').doc("suggest_closeness.txt").get().then(doc => {
    if (doc.exists) {
      r[book] = doc.data()[book];
    } else {
        console.log("No such document!");
    }
      return res.send(r);
  })
  .catch(error =>{
  console.log(error)
  res.status(500).send(error)});
  });

  exports.suggestUsingPagerank = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {
 
  r = {}
  var book = req.path.replace("/","");
  db.collection('suggest').doc("suggest_pagerank.txt").get().then(doc => {
    if (doc.exists) {
      r[book] = doc.data()[book];
    } else {
        console.log("No such document!");
    }
      return res.send(r);
  })
  .catch(error =>{
  console.log(error)
  res.status(500).send(error)});
  });

  exports.getTitleFromId = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {
 
  r = {}
  var request = req.path.replace("/","");
  var ids = request.split(" ");
  ids.forEach(id =>{
    db.collection('graphe').doc("id_node.txt").get().then(doc => {
      if (doc.exists) {
        r[id] = doc.data()[id];
      } else {
          console.log("No such document!");
      }
        return res.send(r);
    })
    .catch(error =>{
    console.log(error)
    res.status(500).send(error)});
  })
  
  });

  exports.getIdFromTitle = functions
  .region('europe-west2')
  .runWith({memory: "1GB", timeoutSeconds:540})
  .https.onRequest((req, res) => {
 
  r = {}
  var request = req.path.replace("/",""); 
 
    db.collection('graphe').doc("id_node.txt").get().then(doc => {
      if (doc.exists) {
        entries = Object.entries(doc.data())
        for (const [id, title] of entries) {
          if(title === request){
            return res.send(id);
          }
        }

      } else {
          console.log("No such document!");
      }
        return res.send(r);
    })
    .catch(error =>{
    console.log(error)
    res.status(500).send(error)});
  
  });

