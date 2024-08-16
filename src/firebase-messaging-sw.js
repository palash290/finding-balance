// src/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBDF12j3pjff_Vs8b1yTd2Iqmwp9E82SM8",
    authDomain: "finding-balance-d1fff.firebaseapp.com",
    projectId: "finding-balance-d1fff",
    storageBucket: "finding-balance-d1fff.appspot.com",
    messagingSenderId: "190513740511",
    appId: "1:190513740511:web:cadfdc4f17f1573889476a",
    //measurementId: "G-SNCBP7C0EQ",
});

const messaging = firebase.messaging();

console.log("service worker", messaging);