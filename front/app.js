
const liste = document.querySelector('#closenessScore');


function closeness(){
    db.collection("livres").get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log(doc.id);
  });
});

}