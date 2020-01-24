firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


const searchWordForm = document.querySelector('#search-word-form');
const searchBookForm = document.querySelector('#search-book-form');
const searchBookRegExForm = document.querySelector('#search-bookRegEx-form');
const suggestBookForm = document.querySelector('#suggest-book-form');

const basicList = document.querySelector('#basic-display');
displayText = document.getElementById('display_text')



// Search a book
searchBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
 bookTitle = searchBookForm.bookName.value.split(" ").join("_")
  if ( bookTitle.length< 3) {
    alert("your entrie is too short, enter at least 3 character");
  }
  else {
    document.getElementById("basic-display").innerHTML = "";
    displayText.textContent = ""

    fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/searchBook/"+bookTitle)
      .then(data => { return data.json() })
      .then(res => {
        for (a in res) {
            renderBook(res[a].split("_").join(" "))
        }
      })
  }

  searchBookForm.bookName.value = ""
  
});

searchBookRegExForm.addEventListener('submit', (e) => {
  e.preventDefault();
 bookTitle = searchBookRegExForm.bookRegExName.value.split(" ").join("_")
  treatedRegEx = regExTransform(bookTitle)

    document.getElementById("basic-display").innerHTML = "";
    displayText.textContent = ""

    fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/searchBookRegEx/"+treatedRegEx)
      .then(data => { return data.json() })
      .then(res => {
        for (a in res) {
            renderBook(res[a].split("_").join(" "))
        }
      })

      searchBookRegExForm.bookRegExName.value = ""
});



// Search word occurences in all books
searchWordForm.addEventListener('submit', (e) => {
  e.preventDefault();

  word = searchWordForm.searchWord.value
  document.getElementById("basic-display").innerHTML = "";
  displayText.textContent = ""

  const url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/search" + "/" + word ;
  fetch(url)
    .then(data => { return data.json() })
    .then(res => {
      for (key in res) {
        renderWordSearch(key.split("_").join(" "), res[key]);
      }
    })
    searchWordForm.searchWord.value = ""
    
});



// Book suggestion
suggestBookForm.addEventListener('submit', async(e) => {
  e.preventDefault();

  bookTitle = suggestBookForm.bookName.value.split(" ").join("_")

  if (bookTitle.length < 3) {
    alert("your entrie is too short, enter at least 3 character");
  }
  else {
    document.getElementById("basic-display").innerHTML = "";
    displayText.textContent = ""
    
    const result = await fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/suggestUsingCloseness/"+bookTitle)
      .then(data => { return data.json() })
      .then( async(res) => {
        for(a in res){
          renderBook(res[a].split("_").join(" "))
        }
      })

  }
  suggestBookForm.bookName.value = ""
});

function displayBook(book){
  const url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getBook" + "/" + book ;
  
  fetch(url)
    .then(data => { return data.json() })
    .then(res => {
        renderBookContent(res.book);
    })
}

function renderBook(book) {
  let li = document.createElement('li');
  let name = document.createElement('span');

  li.setAttribute('book-id', book);
  li.setAttribute('onclick','displayBook("'+book.split(" ").join("_")+'")');
  
  name.textContent = book;
  li.appendChild(name);
  basicList.appendChild(li);
}

function renderWordSearch(res, occu) {
  let li = document.createElement('li');
  let name = document.createElement('span');

  li.setAttribute('search-id', res);
  li.setAttribute('onclick','displayBook("'+res.split(" ").join("_")+'")');
  
  name.textContent = res + " : " + occu;
  li.appendChild(name);
  basicList.appendChild(li);
}



function renderBookContent(bookContent){
  
  displayText.setAttribute('style', 'white-space: pre;');
  displayText.textContent = ""

  displayText.textContent += "To read more you can go to Gutenberg.org or downloand this book here : " + "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getBook" + "/" + bookContent + "\n\n"
  
  if(bookContent.length < 11000){
    text = bookContent.split("\n")
    for (line in text){
      displayText.textContent += text[line] + "\r\n"
    }
  }
}

function regExTransform(book){
  const reg = book.split("{").join("accOuv");
  const reg1 = reg.split("}").join("accFer");
  const reg2 = reg1.split("\\").join("anti");
  const reg3 = reg2.split("/").join("slash");
  const reg4 = reg3.split(" ").join("space")
  const reg5 = reg4.split("^").join("hat")
  return reg5
}