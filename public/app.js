firebase.initializeApp(firebaseConfig);

const form = document.querySelector('#form');

resultDisplay = document.getElementById('resultDisplay');
modeDropdown = document.getElementById('btnGroupDrop1')

var mode = "searchWord"

function setSearchinWordgMode(){
  mode = "searchWord"
  modeDropdown.innerHTML = "Search word mode"
}
function setSearchingBookMode(){
  mode = "searchBook"
  modeDropdown.innerHTML = "Search book by title mode"
}
function setSearchingBookRegExMode(){
  mode = "searchBookRegEx"
  modeDropdown.innerHTML = "Search book by RegEx mode"
}
function setSuggestClosenessMode(){
  mode = "suggestClosenessBook"
  modeDropdown.innerHTML = "Suggest book by closeness mode"
}
function setSuggestJaccardMode(){
  mode = "suggestJaccardBook"
  modeDropdown.innerHTML = "Suggest book by Jaccard dist mode"
}

form.addEventListener('submit', async(e) => {
  e.preventDefault();

  if(mode === "searchWord"){
    word = form.searchField.value.split(" ").join("_")
    if (word.length >= 3) {
      resultDisplay.innerHTML = "";
      document.querySelector('#spinner').style.display = 'block';
      await callSearchWord(word)
    }

  }
  else if(mode === "searchBook"){
    bookTitle = form.searchField.value.split(" ").join("_")
    if (bookTitle.length >= 3) {
      resultDisplay.innerHTML = "";
      document.querySelector('#spinner').style.display = 'block';
      await callSuggestBook(bookTitle)
    }

  }
  else if(mode === "searchBookRegEx"){
    bookRegEx = form.searchField.value.split(" ").join("_")
    resultDisplay.innerHTML = "";
    document.querySelector('#spinner').style.display = 'block';
    await callSearchRegExBook(bookRegEx);

  }
  else if(mode === "suggestClosenessBook"){
    bookTitle = form.searchField.value.split(" ").join("_")
    if (bookTitle.length >= 3) {
      resultDisplay.innerHTML = "";
      document.querySelector('#spinner').style.display = 'block';
      await callSuggestClosenessBook(bookTitle)
    }

  }
  else if(mode === "suggestJaccardBook"){
    bookTitle = form.searchField.value.split(" ").join("_")
    if (bookTitle.length >= 3) {
      resultDisplay.innerHTML = "";
      document.querySelector('#spinner').style.display = 'block';
      await callSuggestJaccardBook(bookTitle)
    }

  }
  else{
    console.log("unknow research mode : "+ mode)
  }

  form.searchField.value = ""
  
});

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
        document.querySelector('#spinner').style.display = 'none';
        for (a in res) {
            renderBook(res[a].split("_").join(" "))
        }
      })
}

async function callSearchRegExBook(bookTitleRegEx){
  treatedRegEx = regExTransform(bookTitleRegEx)
  fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/searchBookRegEx/"+treatedRegEx)
      .then(data => { return data.json() })
      .then(res => {
        document.querySelector('#spinner').style.display = 'none';
        for (a in res) {
            renderBook(res[a].split("_").join(" "))
        }
      })
}

async function callSuggestClosenessBook(bookTitle){
  fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/suggestUsingCloseness/"+bookTitle)
      .then(data => { return data.json() })
      .then(res => {
        document.querySelector('#spinner').style.display = 'none';
        for(a in res){
          renderBook(res[a].split("_").join(" "))
        }
      })
}

async function callSuggestJaccardBook(bookTitle){
  fetch("https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/suggestUsingJaccard/"+bookTitle)
      .then(data => { return data.json() })
      .then( res => {
        document.querySelector('#spinner').style.display = 'none';
        for(a in res){
          renderBook(res[a].split("_").join(" "))
        }
      })
}

function regExTransform(book){
  const reg = book.split("{").join("TOKEN_ACCOUV");
  const reg1 = reg.split("}").join("TOKEN_ACCFER");
  const reg2 = reg1.split("\\").join("TOKEN_ANTI");
  const reg3 = reg2.split("/").join("TOKEN_SLASH");
  const reg4 = reg3.split(" ").join("TOKEN_SPACE")
  const reg5 = reg4.split("^").join("TOKEN_HAT")
  return reg5
}


function renderBook(book) {
  let div = document.createElement('div');
  let li = document.createElement('li');
  let a = document.createElement('a')

  li.setAttribute('class', "p-2 flex-fill list-group-item");
  li.innerHTML = book.slice(0, -4);

  a.setAttribute('class', "p-2 flex-fill d-flex badge badge-primary badge-pill")
  a.setAttribute('href',"https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getBook/" + book.split(" ").join("_") )
  a.innerHTML = "Download book"

  div.setAttribute('class', 'd-flex list-group list-group-horizontal');


  li.appendChild(a)
  div.appendChild(li)  
  
  resultDisplay.appendChild(div);
}

function renderWordSearch(word, res, occu) {
  
  let div = document.createElement('div');
  let li = document.createElement('li');
  let span = document.createElement('span');
  let a = document.createElement('a')

  li.setAttribute('class', "p-2 flex-fill list-group-item");
  li.innerHTML = res.slice(0, -4);

  span.setAttribute('class', "p-2 flex-fill d-flex align-items-end badge badge-light badge-pill");
  span.innerHTML = "Has " + occu + " occurences of "+word;

  a.setAttribute('class', "p-2 flex-fill d-flex badge badge-primary badge-pill")
  a.setAttribute('href',"https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getBook/" + res.split(" ").join("_") )
  a.innerHTML = "Download book"

  div.setAttribute('class', 'd-flex list-group list-group-horizontal');

  
  li.appendChild(span)
  li.appendChild(a)
  div.appendChild(li)
  resultDisplay.appendChild(div);  
  
}

