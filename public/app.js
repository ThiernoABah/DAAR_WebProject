firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const searchWordForm = document.querySelector('#search-word-form');
const searchBookForm = document.querySelector('#search-book-form');
const suggestBookForm = document.querySelector('#suggest-book-form');

const basicList = document.querySelector('#basic-display');
const suggestList = document.querySelector('#suggest-display');


// Search a book
searchBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
 bookTitle = searchBookForm.bookName.value
  if ( bookTitle.length< 3) {
    alert("your entrie is too short, enter at least 3 character");
  }
  else {
    document.getElementById("basic-display").innerHTML = "";
    fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/allBooks")
      .then(data => { return data.json() })
      .then(res => {
        for (a in res.books) {
          if (res.books[a].includes(bookTitle)) {
            renderBook(res.books[a])
          }
        }
      })
  }
  searchBookForm.bookName.value = ""
  

});



// Search word occurences in all books
searchWordForm.addEventListener('submit', (e) => {
  e.preventDefault();

  word = searchWordForm.searchWord.value
  document.getElementById("basic-display").innerHTML = "";

  const url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/search" + "/" + word ;
  fetch(url)
    .then(data => { return data.json() })
    .then(res => {
      for (key in res) {
        renderWordSearch(res[key].book, res[key].occurence);
      }
      
    })
    searchWordForm.searchWord.value = ""
});

// Book suggestion
suggestBookForm.addEventListener('submit', async(e) => {
  e.preventDefault();

  bookTitle = suggestBookForm.bookName.value
  var finalRes = {}

  if (bookTitle.length < 3) {
    alert("your entrie is too short, enter at least 3 character");
  }
  else {

    document.getElementById("basic-display").innerHTML = "";

    const result = await fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/allBooks")
      .then(data => { return data.json() })
      .then( async(res) => {
        for (a in res.books) {
          if (res.books[a].includes(bookTitle)) {
            const suge = await bookSuggest(res.books[a], finalRes)
            
          }
          
        }
        return finalRes
      })
      for(a in result){
        renderBook(a.split("_").join(" "))
      }
     
    return finalRes;
  }
  suggestBookForm.bookName.value = ""
});



async function bookSuggest(name, finalRes) {

  var url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getIdFromTitle" + "/" + name;
  
  const result = await fetch(url)
    .then(data => { return data.json() })
    .then( async (id) => {
      url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/suggestUsingCloseness" + "/" + id;
      
      const result2 = await fetch(url)
        .then(data => { return data.json() })
        .then( async (suggest) => {

          books = suggest[id].split(" ").join("-")
          url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getTitleFromId" + "/" + books;
          const result3 = await fetch(url)
            .then(data => { return data.json() })
            .then(res => {
              for (key in res) {
                finalRes[res[key]] = 1
              }
              return finalRes;
            });
            return finalRes;
        });
        return finalRes;
        
    });
    
  return finalRes
}


function renderBook(book) {
  let li = document.createElement('li');
  let name = document.createElement('span');
  li.setAttribute('book-id', book);
  name.textContent = book;
  li.appendChild(name);
  basicList.appendChild(li);
}

function renderWordSearch(res, occu) {
  let li = document.createElement('li');
  let name = document.createElement('span');

  li.setAttribute('search-id', res);
  name.textContent = res + " : " + occu;
  li.appendChild(name);
  basicList.appendChild(li);
}
