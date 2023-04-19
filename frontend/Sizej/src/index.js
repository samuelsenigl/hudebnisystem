import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
//import './fonts/Poppins/Poppins-SemiBold.ttf';
import Axios from 'axios';
Axios.defaults.baseURL = 'https://sizej.eu:8000/';
//Axios.defaults.baseURL = 'http://sizej.eu:8001/';
//Axios.defaults.baseURL = '127.0.0.1:8000/';
try {
    //var token_object = JSON.parse(localStorage.getItem("token"));
    //Axios.defaults.headers.common = {'Authorization': `${token_object.token}`}
    const token = localStorage.getItem('saved_token') || "";
    Axios.defaults.headers.common = {'Token': token}
}
catch(error){
    // I was not able to load token
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
