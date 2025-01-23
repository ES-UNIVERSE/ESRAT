const video = document.getElementById('webcam');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const resultDiv = document.getElementById('result');
const startButton = document.getElementById('startButton');

let model;
let lastAnnouncementTime = 0;

// Start Webcam
async function setupWebcam() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
      .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => resolve(video);
      })
      .catch(error => {
        console.error('Webcam error:', error);
        alert('Failed to access webcam. Check browser permissions.');
        reject(error);
      });
  });
}

// Load Model
async function loadModel() {
  model = await cocoSsd.load();
  detectObjects();
}

// Resize Canvas
function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

// Speak Detected Objects
function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

// Capitalize Object Name
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Format Detection Text
function getDetectionText(predictions) {
  const counts = {};
  predictions.forEach(prediction => {
    const className = capitalizeFirstLetter(prediction.class);
    counts[className] = (counts[className] || 0) + 1;
  });

  const items = Object.entries(counts).map(([className, count]) => 
    count === 1 ? className : `${count} ${className}s`
  );

  return `A ${items.join(', ')} detected`;
}

// Detect Objects and Draw Bounding Boxes
async function detectObjects() {
  if (!model) {
    console.log('Model is still loading...');
    setTimeout(detectObjects, 500);
    return;
  }

  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const predictions = await model.detect(video);

  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox;
    const text = capitalizeFirstLetter(prediction.class);

    // Draw Bounding Box
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Draw Label
    ctx.fillStyle = '#00FFFF';
    ctx.font = '16px Arial';
    ctx.fillText(text, x, y - 10);
  });

  // Update Detected Objects List
  resultDiv.innerHTML = predictions.map(prediction => 
    `<p>${capitalizeFirstLetter(prediction.class)}: ${Math.round(prediction.score * 100)}%</p>`
  ).join('');

  // Announce Detected Objects Every 2 Seconds
  if (predictions.length > 0) {
    const currentTime = Date.now();
    if (currentTime - lastAnnouncementTime >= 2000) { // 2-second interval
      const detectionText = getDetectionText(predictions);
      speak(detectionText);
      lastAnnouncementTime = currentTime;
    }
  }

  requestAnimationFrame(detectObjects);
}

// Start Camera on Button Click
startButton.addEventListener('click', () => {
  setupWebcam().then(() => {
    video.play();
    loadModel();
  }).catch(error => console.error('Camera setup failed:', error));
});

// Ensure HTTPS or localhost for Camera Access
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  alert('This page must be served over HTTPS or localhost for the camera to work.');
}