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
    res.set('Access-Control-Allow-Origin', '*');

    db.collection('graphe').doc("id_node.txt").get().then(doc => {
        return res.send({ books: doc.data() });
    })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });


  });

exports.getBook = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    var book = req.path.replace("/", "");

    db.collection('livres').doc(book).get().then(snapshot => {
      const d = snapshot.data()

      return res.send(d)

    })
      .catch(error => {
        console.log(error)

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

    res.set('Access-Control-Allow-Origin', '*');

    r = {}
    var word = req.path.replace("/", "");

    db.collection('livres').get().then(querySnapshot => {
      querySnapshot.forEach(book => {
        d = book.data()
        if (d[word] !== undefined) {
          r[book.id] = d[word]
        }

      });

      var arr = sortSearchResult(r);
      return res.send(arr);
    })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });
  });

exports.suggestUsingCloseness = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    r = {}
    var book = req.path.replace("/", "");
    db.collection('suggest').doc("suggest_closeness.txt").get().then(doc => {
      if (doc.exists) {
        r[book] = doc.data()[book];
      } else {
        console.log("No such document!");
      }

      return res.send(r);
    })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });
  });

exports.suggestUsingPagerank = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    res.set('Access-Control-Allow-Origin', '*');

    r = {}
    var book = req.path.replace("/", "");
    db.collection('suggest').doc("suggest_pagerank.txt").get().then(doc => {
      if (doc.exists) {
        r[book] = doc.data()[book];
      } else {
        console.log("No such document!");
      }

      return res.send(r);
    })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });
  });

exports.suggestUsingJaccard = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    res.set('Access-Control-Allow-Origin', '*');

    r = {}
    var book = req.path.replace("/", "");
    db.collection('suggest').doc("suggest_jaccard.txt").get().then(doc => {
      if (doc.exists) {
        r[book] = doc.data()[book];
      } else {
        console.log("No such document!");
      }

      return res.send(r);
    })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });
  });

exports.getTitleFromId = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
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
      return res.send(r);
    })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });

  });

exports.getIdFromTitle = functions
  .region('europe-west2')
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .https.onRequest((req, res) => {

    r = {}
    var request = req.path.replace("/", "");
    res.set('Access-Control-Allow-Origin', '*');
    db.collection('graphe').doc("id_node.txt").get().then(doc => {
      if (doc.exists) {
        entries = Object.entries(doc.data())
        for (const [id, title] of entries) {
          if (title === request) {
            return res.send(id);
          }
        }

      } else {
        console.log("No such document!");
      }
      return res.send(r);
    })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });

  });

function sortSearchResult(obj) {
  var arr = [];
  var prop;
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      arr.push({
        'book': prop,
        'occurence': obj[prop]
      });
    }
  }
  arr.sort(function (a, b) {
    if (a.occurence - b.occurence > 0) {
      return -1;
    }
    else if (a.occurence - b.occurence < 0) {
      return 1
    }
    return 0;
  });
  return arr; // returns array
}