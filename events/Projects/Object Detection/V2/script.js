const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const switchCamBtn = document.getElementById('switchCamBtn');
const torchBtn = document.getElementById('torchBtn');

let model;
let currentStream = null;
let isTorchOn = false;
let isFrontCamera = false;
let lastAnnouncementTime = 0;

async function loadModel() {
  model = await ort.InferenceSession.create('yolov8.onnx');
  console.log('YOLOv8 Model Loaded!');
}

async function setupCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      facingMode: isFrontCamera ? "user" : "environment",
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 60 }
    }
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
    video.play();
    detectObjects();
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
}

async function detectObjects() {
  if (!model) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageTensor = new ort.Tensor('float32', new Float32Array(video.videoWidth * video.videoHeight * 3), [1, 3, video.videoHeight, video.videoWidth]);
  
  const results = await model.run({ images: imageTensor });
  const boxes = results['output0'].data;
  
  drawBoundingBoxes(boxes);
  
  requestAnimationFrame(detectObjects);
}

function drawBoundingBoxes(predictions) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 4;
  ctx.font = "24px Arial";

  let detectedObjects = [];

  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(prediction.class, x, y - 10);
    detectedObjects.push(prediction.class);
  });

  announceObjects(detectedObjects);
}

function announceObjects(detectedObjects) {
  if (detectedObjects.length > 0) {
    const currentTime = Date.now();
    if (currentTime - lastAnnouncementTime >= 2000) {
      const detectionText = detectedObjects.join(', ');
      speak(`A ${detectionText} detected`);
      lastAnnouncementTime = currentTime;
    }
  }
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

startBtn.addEventListener('click', () => {
  setupCamera();
});

switchCamBtn.addEventListener('click', () => {
  isFrontCamera = !isFrontCamera;
  setupCamera();
});

torchBtn.addEventListener('click', () => {
  if (!currentStream) return;
  const videoTrack = currentStream.getVideoTracks()[0];
  const capabilities = videoTrack.getCapabilities();

  if (capabilities.torch) {
    isTorchOn = !isTorchOn;
    videoTrack.applyConstraints({ advanced: [{ torch: isTorchOn }] });
  } else {
    alert('Torch not supported on this device');
  }
});

window.onload = () => {
  loadModel();
};
