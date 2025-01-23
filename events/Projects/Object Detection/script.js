const video = document.getElementById('webcam');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const resultDiv = document.getElementById('result');
const startButton = document.getElementById('startButton');
const toggleButton = document.getElementById('toggleCamera');
const torchButton = document.getElementById('toggleTorch');

let model;
let lastAnnouncementTime = 0;
let currentFacingMode = "environment"; // Default to rear camera
let stream = null;
let track = null;
let torchOn = false;

// 🔹 Stop Current Camera Stream
function stopStream() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

// 🔹 Start Webcam with High Resolution
async function setupWebcam(facingMode) {
  stopStream(); // Stop previous stream before switching

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: facingMode,
        width: { ideal: 1920 },  // High resolution width
        height: { ideal: 1080 }, // High resolution height
        frameRate: { ideal: 30 } // Smooth 30 FPS
      }
    });

    video.srcObject = stream;
    video.onloadedmetadata = () => video.play();

    // Get video track for torch control
    track = stream.getVideoTracks()[0];
  } catch (error) {
    console.error('Webcam error:', error);
    alert('Failed to access webcam. Check browser permissions.');
  }
}

// 🔹 Toggle Torch (Flashlight)
function toggleTorch() {
  if (!track || !track.getCapabilities) {
    alert("Torch mode is not supported on this device.");
    return;
  }

  const capabilities = track.getCapabilities();
  if (capabilities.torch) {
    torchOn = !torchOn;
    track.applyConstraints({ advanced: [{ torch: torchOn }] })
      .catch(error => console.error('Torch error:', error));
  } else {
    alert("Torch mode is not supported on this device.");
  }
}

// 🔹 Load COCO-SSD Model
async function loadModel() {
  model = await cocoSsd.load();
  detectObjects();
}

// 🔹 Resize Canvas
function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

// 🔹 Speak Detected Objects (Every 2 Seconds)
function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

// 🔹 Format Detection Text
function getDetectionText(predictions) {
  const counts = {};
  predictions.forEach(prediction => {
    const className = prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1);
    counts[className] = (counts[className] || 0) + 1;
  });

  const items = Object.entries(counts).map(([className, count]) => 
    count === 1 ? className : `${count} ${className}s`
  );

  return items.length ? `A ${items.join(', ')} detected` : '';
}

// 🔹 Detect Objects and Draw Bounding Boxes
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
    const text = prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1);

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
    `<p>${prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1)}: ${Math.round(prediction.score * 100)}%</p>`
  ).join('');

  // Announce Detected Objects Every 2 Seconds
  if (predictions.length > 0) {
    const currentTime = Date.now();
    if (currentTime - lastAnnouncementTime >= 2000) { // 2-second interval
      const detectionText = getDetectionText(predictions);
      if (detectionText) {
        speak(detectionText);
        lastAnnouncementTime = currentTime;
      }
    }
  }

  requestAnimationFrame(detectObjects);
}

// 🔹 Start Camera Button Click
startButton.addEventListener('click', () => {
  setupWebcam(currentFacingMode).then(() => {
    loadModel();
  }).catch(error => console.error('Camera setup failed:', error));
});

// 🔹 Toggle Camera Button Click
toggleButton.addEventListener('click', () => {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  setupWebcam(currentFacingMode);
});

// 🔹 Torch Toggle Button Click
torchButton.addEventListener('click', toggleTorch);

// 🔹 Ensure HTTPS or localhost for Camera Access
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  alert('This page must be served over HTTPS or localhost for the camera to work.');
}