firebase.initializeApp(firebaseConfig);

form = document.querySelector('#form');
resultDisplay = document.getElementById('resultDisplay');
modeDropdown = document.getElementById('btnGroupDrop1')

// By default the search mode is in searchWord
var mode = "searchWord"

// Change the search mode depending on wich mode the user want to do his research //
function setSearchinWordgMode(){
  mode = "searchWord"
  modeDropdown.innerHTML = "Search word"
}
function setSearchingBookMode(){
  mode = "searchBook"
  modeDropdown.innerHTML = "Search book by title"
}
function setSearchingBookRegExMode(){
  mode = "searchBookRegEx"
  modeDropdown.innerHTML = "Search book by RegEx"
}

///////////////////////////////////////////////////////////////////////////////////

// Call the right API call depending on the search mode ///////////////////////////
form.addEventListener('submit', async(e) => {
  e.preventDefault();

  if(mode === "searchWord"){
    word = form.searchField.value.split(" ").join("_")
    if (word.length >= 3) {
      resultDisplay.innerHTML = "";
      document.querySelector('#spinner').style.display = 'inline-block';
      await callSearchWord(word)
    }else{
      resultDisplay.innerHTML = "";
      let div = document.createElement('div');
      div.setAttribute('class', "mx-auto alert alert-warning")
      div.innerHTML = "Please enter at least 3 character";
      resultDisplay.appendChild(div);
    }

  }
  else if(mode === "searchBook"){
    bookTitle = form.searchField.value.split(" ").join("_")
    if (bookTitle.length >= 3) {
      resultDisplay.innerHTML = "";
      document.querySelector('#spinner').style.display = 'inline-block';
      await callSearchBook(bookTitle)
    }
    else{
      resultDisplay.innerHTML = "";
      let div = document.createElement('div');
      div.setAttribute('class', "mx-auto alert alert-warning")
      div.innerHTML = "Please enter at least 3 character";
      resultDisplay.appendChild(div);
    }

  }
  else if(mode === "searchBookRegEx"){
    bookRegEx = form.searchField.value.split(" ").join("_")
    resultDisplay.innerHTML = "";
    document.querySelector('#spinner').style.display = 'inline-block';
    await callSearchRegExBook(bookRegEx);

  }
  else{
    console.log("unknow research mode : "+ mode)
  }

  form.searchField.value = ""
  
});
///////////////////////////////////////////////////////////////////////////////////

/// Function that make the call to firebase functions to get informations /////////
async function callSearchWord(word){
  const url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/search" + "/" + word ;
  const result = await (await fetch(url)).json();
  document.querySelector('#spinner').style.display = 'none';
  for (key in result) {
    renderWordSearch(word, key.split("_").join(" "), result[key]);
  }
}

async function callSearchBook(bookTitle){
  fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/searchBook/"+bookTitle)
    .then(data => { return data.json() })
      .then(res => {
        for (a in res) {
          renderBook(res[a].split("_").join(" "))
        }
        document.querySelector('#spinner').style.display = 'none';
    })
}

async function callSearchRegExBook(bookTitleRegEx){
  treatedRegEx = regExTransform(bookTitleRegEx)
  fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/searchBookRegEx/"+treatedRegEx)
      .then(data => { return data.json() })
      .then(res => {
        for (a in res) {
            renderBook(res[a].split("_").join(" "))
        }
        document.querySelector('#spinner').style.display = 'none';
      })
}

async function randomBooks(){
  resultDisplay.innerHTML = "";
  document.querySelector('#spinner').style.display = 'inline-block';
  fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/randomBook")
      .then(data => { return data.json() })
      .then( res => {
        for(a in res){
          renderBook(res[a].split("_").join(" "))
        }
        document.querySelector('#spinner').style.display = 'none';
      })
}
///////////////////////////////////////////////////////////////////////////////////

//// Funtions that change the RegEx into a valid one that we can pass to a url ////
//// The server can translate it back to the RegEx the user has enter /////////////
function regExTransform(book){
  const reg = book.split("{").join("TOKEN_ACCOUV");
  const reg1 = reg.split("}").join("TOKEN_ACCFER");
  const reg2 = reg1.split("\\").join("TOKEN_ANTI");
  const reg3 = reg2.split("/").join("TOKEN_SLASH");
  const reg4 = reg3.split(" ").join("TOKEN_SPACE")
  const reg5 = reg4.split("^").join("TOKEN_HAT")
  return reg5
}

//// Functions in charge of displaying the result of functions call //////////////
async function renderBook(book) {
  let div = document.createElement('div');
  let a = document.createElement('a')

  a.setAttribute('class', "list-group-item list-group-item-primary")
  a.setAttribute('href',"https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getBook/" + book.split(" ").join("_") )
  a.innerHTML = book.slice(0, -4);
  a.style.fontSize = "large";

  div.setAttribute('class', 'list-group');
  div.appendChild(a)  
  
  div.style.marginTop = "1%"
  div.style.marginBottom = "1%"
  
  renderSuggestion(div, book);

  resultDisplay.appendChild(div);
  
}

async function renderWordSearch(word, res, occu) {
  
  let div = document.createElement('div');
  let span = document.createElement('span');
  let a = document.createElement('a')

  span.setAttribute('class', "list-group-item-secondary");
  span.innerHTML = "This book has " + occu + " occurences of the word : "+word;

  a.setAttribute('class', "list-group-item list-group-item-primary")
  a.setAttribute('href',"https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getBook/" + res.split(" ").join("_") )
  a.innerHTML = res.slice(0, -4);
  a.style.fontSize = "large";

  div.setAttribute('class', 'list-group');
  div.appendChild(a)
  div.appendChild(span)
  
  div.style.marginTop = "1%"
  div.style.marginBottom = "1%"

  renderSuggestion(div, res);

  resultDisplay.appendChild(div);  
}

// Function use to get suggestion for a book, we use it to make an implicite suggestion for books
async function renderSuggestion(container, bookTitle){
  let line = document.createElement('li');
  line.setAttribute('class', "list-group-item-secondary")
  

  let ul = document.createElement('ul');
  ul.setAttribute("class", "list-group list-group-horizontal");

  toss = Math.floor(Math.random() * 2);
  var url = ""
  if(toss == 0){
    url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/suggestUsingJaccard/" + bookTitle.split(" ").join("_");
  }
  else{
    url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/suggestUsingCloseness/" + bookTitle.split(" ").join("_");
  }
  
  const result = await (await fetch(url)).json();

  if(Object.keys( result ).length > 0){
    line.innerHTML = "You may also like these books : ";
    container.appendChild(line)
  }
  for (key in result) {
    book = result[key];
    let a = document.createElement('a');
    a.setAttribute('class', "list-group-item")
    a.setAttribute('href',"https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getBook/" + book )
    a.innerHTML = book.slice(0, -4).split("_").join(" ")
    ul.appendChild(a)
    }
  container.appendChild(ul)
}