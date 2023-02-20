// Sample JavaScript code
console.log('Script loaded.');

// Grab index.html and inject into body
const index = document.createElement('div');
index.innerHTML = require('./index.html');

// Inject into body
document.body.appendChild(index);