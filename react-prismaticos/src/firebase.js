import firebase from 'firebase/app';
import 'firebase/firestore'

var firebaseConfig = {
    apiKey: "AIzaSyDv8TK258MSXrDnrdHyDxZDXzQtqpxa1JY",
    authDomain: "prismaticos-ebe3f.firebaseapp.com",
    databaseURL: "https://prismaticos-ebe3f.firebaseio.com",
    projectId: "prismaticos-ebe3f",
    storageBucket: "prismaticos-ebe3f.appspot.com",
    messagingSenderId: "399075689137",
    appId: "1:399075689137:web:fde803912e711114665890",
    measurementId: "G-21YCQT4YK3"
};

firebase.initializeApp(firebaseConfig);

export default firebase;