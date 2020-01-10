const functions = require('firebase-functions');

firebase.initializeApp(firebaseConfig);


const db = firebase.firestore();

const buttonGetAllBooks = document.querySelector('#all-books');
const booksList = document.querySelector('#books-list');
const getBookForm = document.querySelector('#get-book');
const bookContent = document.querySelector('#book-content');


var list = new Array();
var pageList = new Array();
var currentPage = 1;
var numberPerPage = 30;
var numberOfPages = 0;

// all books in data base
function getAllBooks(){

  db.collection('livres').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        renderBook(doc.id)
      });
  })
  .catch(error =>{
    console.log(error)
    res.status(500).send(error)
  });

}

function renderBook(book){
  let li = document.createElement('li');
  let name = document.createElement('span');

  li.setAttribute('book-id', book);
  name.textContent = book;
  li.appendChild(name);
  booksList.appendChild(li);
}

getBookForm.addEventListener('submit',(e) =>{
  e.preventDefault();
  db.collection('livres').doc(getBookForm.name.value).get().then(snapshot => {
    for(key in snapshot.data()){
      mot = key+" : "+snapshot.data()[key]
      list.push(mot);
    }
    numberOfPages = getNumberOfPages();
    firstPage(); // j'arrive pas a refresh la page
    
 })
 .catch(error =>{
  console.log(error)
  res.status(500).send(error)
})

getBookForm.name.value = "";

});


function getNumberOfPages() {
return Math.ceil(list.length / numberPerPage);
}

function nextPage() {
currentPage += 1;
loadList();
}

function previousPage() {
currentPage -= 1;
loadList();
}

function firstPage() {
currentPage = 1;
loadList();
}

function lastPage() {
currentPage = numberOfPages;
loadList();
}

function loadList() {
var begin = ((currentPage - 1) * numberPerPage);
var end = begin + numberPerPage;

pageList = list.slice(begin, end);
drawList();
check();
}

function drawList() {
document.getElementById("word-list").innerHTML = "";
for (r = 0; r < pageList.length; r++) {
    document.getElementById("word-list").innerHTML += pageList[r] + "<br/>";
}
}

function check() {
document.getElementById("next").disabled = currentPage == numberOfPages ? true : false;
document.getElementById("previous").disabled = currentPage == 1 ? true : false;
document.getElementById("first").disabled = currentPage == 1 ? true : false;
document.getElementById("last").disabled = currentPage == numberOfPages ? true : false;
}

function load() {
  loadList();
}
  
window.onload = load;