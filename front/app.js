const liste = document.querySelector('#closenessScore');

const motsListe = document.querySelector('#mots-list');
const form = document.querySelector('#mots-doc');

// CREER DES REQUETES HTTP SUR FIREBASE PUIS LES CALL DEPUIS LE FRONT
function renderCafe(doc){
  let li = document.createElement('li');
  li.setAttribute('data-id', doc.id);

  for (const [w, v] of Object.entries(doc.data())) {
    e = w+":"+v
    
    child = document.createElement('span')
    child.textContent = e
    li.appendChild(child);
  }

  motsListe.appendChild(li);
  
}

db.collection('livres').get().then( (snapshot) => {
    snapshot.docs.forEach(doc => {
       renderCafe(doc);
    });
});

function closeness(){
    db.collection("livres").get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log(doc.id);
  });
});

}