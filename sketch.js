let apiKey = 'tk_NjXdufLLXLabSZAo8DGGAnVXVxo5Cb2o8kgAN'; // Add your Thaura API key here

let img;
let isWaiting = false;
let response = '';
let base64Image = '';
let imageLoaded = false;

// CORS Proxy - using cors-anywhere as it's reliable
const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const THAURA_API = 'https://backend.thaura.ai/v1/chat/completions';

async function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  
  try {
    console.log('Loading initial image...');
    img = await loadImage('https://picsum.photos/400/300');
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
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], width/2, 460 + i * 20);
    }
  }
}

function keyPressed() {
  if (key === ' ' && !isWaiting && imageLoaded) {
    console.log('SPACE key pressed - starting image conversion...');
    base64Image = getBase64Image(img);
    console.log('Base64 image generated, length:', base64Image ? base64Image.length : 'undefined');
    sendImageToThaura();
  } else if (key === ' ' && !imageLoaded) {
    response = 'Please wait for image to load first.';
  } else if (key === 'r' || key === 'R') {
    console.log('R key pressed - loading random image...');
    loadRandomImage();
  }
}

async function loadRandomImage() {
  let randomNum = Math.floor(Math.random() * 10000);
  imageLoaded = false;
  response = '';
  base64Image = '';
  
  try {
    console.log('Loading random image with seed:', randomNum);
    img = await loadImage(`https://picsum.photos/400/300?random=${randomNum}`);
    imageLoaded = true;
    console.log('Random image loaded successfully:', img);
  } catch (err) {
    console.error('Random image loading error:', err);
    response = 'Failed to load image';
  }
}

function getBase64Image(p5Img) {
  console.log('Converting image to base64...');
  
  let tempCanvas = createGraphics(p5Img.width, p5Img.height);
  tempCanvas.image(p5Img, 0, 0);
  
  let dataURL = tempCanvas.canvas.toDataURL('image/jpeg', 0.8);
  let base64 = dataURL.split(',');
  
  console.log('Base64 conversion complete. Data URL length:', dataURL.length);
  return base64;
}

async function sendImageToThaura() {
  console.log('Starting API call to Thaura...');
  
  if (!apiKey) {
    const errorMsg = 'Please add your Thaura API key to the apiKey variable';
    console.error(errorMsg);
    response = errorMsg;
    return;
  }
  
  if (!base64Image) {
    const errorMsg = 'No image available to send';
    console.error(errorMsg);
    response = errorMsg;
    return;
  }
  
  if (!img) {
    const errorMsg = 'No image object available';
    console.error(errorMsg);
    response = errorMsg;
    return;
  }
  
  isWaiting = true;
  response = '';
  
  try {
    console.log('Sending request to Thaura API...');
    
    // Construct the proxied URL
    const proxiedUrl = CORS_PROXY + THAURA_API;
    
    console.log('Using proxied URL:', proxiedUrl);
    
    const apiResponse = await fetch(proxiedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Requested-With': 'XMLHttpRequest', // Required for CORS proxy
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      body: JSON.stringify({
        model: 'thaura',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and describe what you see. Provide detailed information about objects, text, and any other relevant details visible in the image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });
    
    console.log('API response status:', apiResponse.status);
    console.log('API response headers:', apiResponse.headers);
    
    const data = await apiResponse.json();
    console.log('API response data:', data);
    
    if (apiResponse.ok) {
      if (data.choices && data.choices && data.choices.message) {
        response = data.choices.message.content;
        console.log('Thaura response received:', response);
      } else {
        const errorMsg = 'No response from Thaura API';
        console.error(errorMsg, data);
        response = errorMsg;
      }
    } else {
      const errorMsg = `Error: ${data.error?.message || 'Unknown error'}`;
      console.error(errorMsg, data);
      response = errorMsg;
    }
    
  } catch (error) {
    const errorMsg = `Network error: ${error.message}`;
    console.error(errorMsg, error);
    response = errorMsg;
  } finally {
    isWaiting = false;
    console.log('API call completed. isWaiting:', isWaiting);
  }
}
