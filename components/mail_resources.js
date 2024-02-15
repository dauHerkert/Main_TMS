document.querySelector('body').style = "margin: 0;padding: 0;font-family: Arial, sans-serif;font-size: 16px;line-height: 1.4;color: #444444;background-color: #f2f2f2;";

// Repeat the process for other elements in your HTML
document.querySelector('div').style = "max-width: 500px;margin: 0 auto;background-color: #ffffff; padding: 50px 30px;";
document.querySelector('table').style = "background-color: #ffffff; padding: 50px 30px;";
document.querySelector('td').style = "text-align: center; vertical-align: middle;";
document.querySelector('img').style = "max-height: 100px;width: 80%;max-width: 100px;";


const firstImage = document.querySelector('#firstImage'); // Replace 'firstImage' with the actual id or class of the first image
firstImage.src = "https://uploads-ssl.webflow.com/63388d26d610dba24046d36b/63c5b449858ce5dabd4e6725_2023.png";
firstImage.style = "max-height: 100px;width: 80%;max-width: 100px;";

// Apply styles to the second image
const secondImage = document.querySelector('#secondImage'); // Replace 'secondImage' with the actual id or class of the second image
secondImage.src = "https://uploads-ssl.webflow.com/63388d26d610dba24046d36b/63c5b449527db5ad793bf849_WTA.png";
secondImage.style = "max-height: 100px;width: 55%;max-width: 150px;";


import {URLENV} from './a_constants';


const url = URLENV
