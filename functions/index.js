const functions = require('firebase-functions');
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.storageTreat = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .storage.object()
  .onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.

    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), object.name);

    await bucket.file(filePath).download({ destination: tempFilePath });
    var data = {};
    var lines;

    if (object.name === "id_node.txt") {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== "") {
          data[node] = tmpMots[1];
        }
      });
      await db.collection('graphe').doc(object.name).set(data)

    } else if (object.name === "graph.txt") {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== "") {
          for (i = 1; i < tmpMots.length; i++) {
            if (data.hasOwnProperty(node)) {
              data[node] = data[node] + " " + tmpMots[i]
            }
            else {
              data[node] = tmpMots[i]
            }
          }
        }
      });
      await db.collection('graphe').doc(object.name).set(data)
    }
    else if (object.name === "closeness.txt") {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== "") {
          data[node] = tmpMots[1];
        }
      });
      await db.collection('centrality').doc(object.name).set(data)
    }
    else if (object.name === "pagerank.txt") {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== "") {
          data[node] = tmpMots[1];
        }
      });
      await db.collection('centrality').doc(object.name).set(data)
    }
    else if (object.name === "suggest_closeness.txt") {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== "") {
          for (i = 1; i < tmpMots.length; i++) {
            if (data.hasOwnProperty(node)) {
              data[node] = data[node] + " " + tmpMots[i]
            }
            else {
              data[node] = tmpMots[i]
            }
          }
        }
      });
      await db.collection('suggest').doc(object.name).set(data)
    }
    else if (object.name === "suggest_pagerank.txt") {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== "") {
          for (i = 1; i < tmpMots.length; i++) {
            if (data.hasOwnProperty(node)) {
              data[node] = data[node] + " " + tmpMots[i]
            }
            else {
              data[node] = tmpMots[i]
            }
          }
        }
      });
      await db.collection('suggest').doc(object.name).set(data)
    }
    else if (object.name === "suggest_jaccard.txt") {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.split(" ");
        var node = tmpMots[0]
        if (node !== "") {
          for (i = 1; i < tmpMots.length; i++) {
            if (data.hasOwnProperty(node)) {
              data[node] = data[node] + " " + tmpMots[i]
            }
            else {
              data[node] = tmpMots[i]
            }
          }
        }
      });
      await db.collection('suggest').doc(object.name).set(data)
    }
    else {
      lines = fs.readFileSync(tempFilePath).toString().split("\n");
      lines.forEach(line => {
        var tmpMots = line.replace(/(\r\n|\n|\r|[-]|["])/gm, " ").split(new RegExp("[^a-zA-Z']+"));
        tmpMots.forEach(word => {
          if (word.length > 2) {
            if (data.hasOwnProperty(word.toLowerCase())) {
              data[word.toLowerCase()] = data[word.toLowerCase()] + 1
            }
            else {
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
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {
    
    
    db.collection('graphe').doc("id_node.txt").get().then(doc => {
      res.set('Access-Control-Allow-Origin', '*');
        return res.send({ books: doc.data() });
    } )
      .catch(error => {
        console.log(error)
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).send(error)
      });


  }
  );

exports.getBook = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {
    
    var book = req.path.replace("/", "");
    
    admin.storage().bucket().file(book).download().then(data => {
      res.set('Access-Control-Allow-Origin', '*');
      return res.send(data[0]);
    }).catch(error => {
          console.log(error)
          res.set('Access-Control-Allow-Origin', '*');
          res.status(500).send(error)
        })

  });

exports.deleteBook = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {
    var book = req.path.replace("/", "");

    db.collection('livres').doc(book).delete();
    return res.send(book + "deleted");

  });

  
exports.deleteAllBook = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    db.collection('livres').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        db.collection('livres').doc(doc.id).delete();
      });
      return res.send("all book deleted");
    }).catch(error => {
      console.log(error)
      res.status(500).send(error)
    });
  });


exports.search = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {
    r = {}
    var word = req.path.replace("/", "");

    db.collection('livres').orderBy(word,'desc').limit(10)
    .get().then(querySnapshot => {
      querySnapshot.forEach(book => {
        if (book.data()[word] !== undefined) {
          r[book.id] = book.data()[word]
        }
      });
      res.set('Access-Control-Allow-Origin', '*');
      return res.send(r);
    }).catch(error => {
        console.log(error)
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).send(error)
      });
  });

  exports.searchBook = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    var r = {}
    var book = req.path.replace("/", "");

    db.collection('graphe').doc("id_node.txt").get().then(doc => {
      data = doc.data();
      for (a in data) {
        if (data[a].toLowerCase().includes(book.toLowerCase())) {
          r[a] = data[a];
        }
      }
      res.set('Access-Control-Allow-Origin', '*');
      return res.send(r);
    } )
      .catch(error => {
        console.log(error)
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).send(error)
      });

  });

  function regExTransform(book){
    const reg = book.split("TOKEN_ACCOUV").join("{");
    const reg1 = reg.split("TOKEN_ACCFER").join("}");
    const reg2 = reg1.split("TOKEN_ANTI").join("\\");
    const reg3 = reg2.split("TOKEN_SLASH").join("/");
    const reg4 = reg3.split("TOKEN_SPACE").join("_");
    const reg5 = reg4.split("TOKEN_HAT").join("^");
    return reg5;
  }

  exports.searchBookRegEx = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    var r = {}
    var book = req.path.replace("/", "");
    
    if(book === ".*"){
      db.collection('graphe').doc("id_node.txt").get().then(doc => {
        res.set('Access-Control-Allow-Origin', '*');
          return res.send(doc.data());
      } )
        .catch(error => {
          console.log(error)
          res.set('Access-Control-Allow-Origin', '*');
          res.status(500).send(error)
        });
    }

    var regTransformed = regExTransform(book)
    var re = new RegExp(regTransformed);
    console.log("regex : "+ re)
    db.collection('graphe').doc("id_node.txt").get().then(doc => {
      data = doc.data();
      for (a in data) {
        if (data[a].search(re) !== -1) {
          r[a] = data[a];
        }
      }
      res.set('Access-Control-Allow-Origin', '*');
      return res.send(r);
    } )
      .catch(error => {
        console.log(error)
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).send(error)
      });

  });


exports.getTitleFromId = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    
    r = {}

    var request = req.path.replace("/", "");

    var ids = request.split("-");

    db.collection('graphe').doc("id_node.txt").get().then(doc => {

      ids.forEach(id => {
        if (doc.exists) {
          if (id !== "") {
            r[id] = doc.data()[id];
          }

        } else {
          console.log("No such document!");
        }
      })
      res.set('Access-Control-Allow-Origin', '*');
      return res.send(r);
    })
      .catch(error => {
        console.log(error)
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).send(error)
      });

  });

exports.getIdFromTitle = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    r = {}
    var request = req.path.replace("/", "");
    
    db.collection('graphe').doc("id_node.txt").get().then(doc => {
      if (doc.exists) {
        entries = Object.entries(doc.data())
        for (const [id, title] of entries) {
          if (title === request) {
            res.set('Access-Control-Allow-Origin', '*');
            return res.send(id);
          }
        }

      } else {
        console.log("No such document!");
      }
      res.set('Access-Control-Allow-Origin', '*');
      return res.send(r);
    })
      .catch(error => {
        console.log(error)
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).send(error)
      });

  });


  exports.suggestUsingJaccard = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest(async(req, res) => {

    potentialBooks = {}
    suggestions = {}

    var book = req.path.replace("/", "");
    
    var allBooks  = await (await db.collection('graphe').doc("id_node.txt").get()).data();
    
    for (a in allBooks) {
      if (allBooks[a].toLowerCase().includes(book.toLowerCase())) {
        potentialBooks[a] = allBooks[a];
      }
    }

    var jaccardScore  = await (await db.collection('suggest').doc("suggest_jaccard.txt").get()).data();

    for(id in potentialBooks){
      neigbors = jaccardScore[id].split(" ")
      for( n in neigbors){
        suggestions[neigbors[n]] = allBooks[neigbors[n]]
      }
    }

      res.set('Access-Control-Allow-Origin', '*');
      res.send(suggestions)
  });

  exports.suggestUsingCloseness = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest(async(req, res) => {

    potentialBooks = {}
    suggestions = {}

    var book = req.path.replace("/", "");
    
    var allBooks  = await (await db.collection('graphe').doc("id_node.txt").get()).data();
    
    for (a in allBooks) {
      if (allBooks[a].toLowerCase().includes(book.toLowerCase())) {
        potentialBooks[a] = allBooks[a];
      }
    }

    var closenessScore  = await (await db.collection('suggest').doc("suggest_closeness.txt").get()).data();

    for(id in potentialBooks){
      neigbors = closenessScore[id].split(" ")
      for( n in neigbors){
        suggestions[neigbors[n]] = allBooks[neigbors[n]]
      }
    }

      res.set('Access-Control-Allow-Origin', '*');
      res.send(suggestions)
  });

  exports.suggestUsingPagerank = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest(async(req, res) => {

    potentialBooks = {}
    suggestions = {}

    var book = req.path.replace("/", "");
    
    var allBooks  = await (await db.collection('graphe').doc("id_node.txt").get()).data();
    
    for (a in allBooks) {
      if (allBooks[a].toLowerCase().includes(book.toLowerCase())) {
        potentialBooks[a] = allBooks[a];
      }
    }

    var pagerank  = await (await db.collection('suggest').doc("suggest_pagerank.txt").get()).data();

    for(id in potentialBooks){
      neigbors = pagerank[id].split(" ")
      for( n in neigbors){
        suggestions[neigbors[n]] = allBooks[neigbors[n]]
      }
    }

      res.set('Access-Control-Allow-Origin', '*');
      res.send(suggestions)
  });