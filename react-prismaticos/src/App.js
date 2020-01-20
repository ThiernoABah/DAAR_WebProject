import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import firebase from './firebase'


async function bookSuggest(name, finalRes) {  
  var url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getIdFromTitle" + "/" + name;
  const resutl = await fetch(url);
  const id = await resutl.json();
  url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/suggestUsingCloseness" + "/" + id;
  const resut2 = await fetch(url);
  const suggest = await resut2.json();
  for(let s in suggest){
    url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/getTitleFromId" + "/" + suggest[s].split(" ").join('-');
    const resut3 = await fetch(url);
    const title = await resut3.json();
    finalRes[Object.values(title)] = 1
  }
  return finalRes
}

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      title: 'React simple CRUD'
    }
  }

  searchWord = (e) => {
    e.preventDefault();
    let word = this.refs.searchWord.value.toLowerCase();
    const url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/search" + "/" + word ;
    fetch(url)
    .then(data => { return data.json() })
    .then(res => {
      console.log(res)
      for (let key in res) {
        console.log(key)
      }  
    })
    this.refs.searchWord.value = ""
  }

  searchBook = (e) => {
    e.preventDefault();
    let bookTitle = this.refs.searchBook.value.toLowerCase();
    if ( bookTitle.length< 3) {
      console.log("your entrie is too short, enter at least 3 character");
    }
    else{
      bookTitle = bookTitle.split(" ").join("_");
      const url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/allBooks";
      fetch(url)
      .then(data => { return data.json() })
      .then(res => {
        for (let a in res['books']) {
          const title = res['books'][a].toLowerCase()
          if (title.includes(bookTitle)) {
            console.log(res['books'][a])
          }
        }
      })
      this.refs.searchBook.value = ""
    }
  }

  

  suggestBook =  async (e) => {
    e.preventDefault();
    
    var finalRes = {}
    let bookTitle = this.refs.suggestBook.value.toLowerCase();

    if ( bookTitle.length< 3) {
      console.log("your entrie is too short, enter at least 3 character");
    }
    else{
      bookTitle = bookTitle.split(" ").join("_");
      const url = "https://europe-west2-prismaticos-ebe3f.cloudfunctions.net/allBooks";
      const result = await fetch(url);
      const books = await result.json();
        for (let a in books['books']) {
          let title = books['books'][a]
          if (title.toLowerCase().includes(bookTitle)) {
           await bookSuggest(title, finalRes)
          }
      }
    for(let a in finalRes){
      console.log(a.split("_").join(" "))
    }
    return finalRes;
    }
  }

  

  render() {
    return (<div className="App">
      <h1>
        Prismaticos
      </h1>
      <div className="searchBar" >
            <form ref="search-word-form" >
                <input type="text" ref="searchWord" placeholder="enter word"/>
                <button onClick={this.searchWord} className="searchWordButton">Search</button>
            </form>
      </div>
      <div className="searchBar" >
            <form ref="search-book-form" >
                <input type="text" ref="searchBook" placeholder="enter book title"/>
                <button onClick={this.searchBook} className="searchBookButton">Search</button>
            </form>
      </div>
      <div className="searchBar" >
            <form ref="suggest-book-form" >
                <input type="text" ref="suggestBook" placeholder="enter book title"/>
                <button onClick={this.suggestBook} className="suggestBookButton">Search</button>
            </form>
      </div>
    </div>);
  }
}

export default App;
