
let apiKey = 'tk_H9Rg9tqGkia65rwvbsMeYoUihS3UauB3xUNKg'; // Add your Thaura API key here

let img;
let isWaiting = false;
let response = '';
let base64Image = '';
let imageLoaded = false;

const THAURA_PROXY = '/.netlify/functions/thaura-proxy';

async function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  
  try {
    console.log('Loading initial image...');
    img = await loadImage('[picsum.photos](https://picsum.photos/400/300)');
    imageLoaded = true;
    console.log('Image loaded successfully:', img);
  } catch (err) {
    console.error('Image loading error:', err);
    response = 'Failed to load image';
  }
}

function draw() {
  background(240);
  
  if (img && imageLoaded) {
    image(img, 50, 50, 300, 225);
  }
  
  fill(0);
  noStroke();
  textSize(16);
  text('Press SPACE to send image to Thaura API', width/2, 320);
  text('Press R to load a random image', width/2, 350);
  
  if (isWaiting) {
    fill(100, 100, 255);
    text('Sending to Thaura...', width/2, 400);
  } else if (!imageLoaded) {
    fill(255, 100, 100);
    text('Loading image...', width/2, 400);
  }
  
  if (response) {
    fill(0);
    textSize(14);
    text('Thaura Response:', width/2, 430);
    
    let words = response.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (let word of words) {
      let testLine = currentLine + word + ' ';
      if (textWidth(testLine) > 300) {
        lines.push(currentLine);
        currentLine = word + ' ';
     
