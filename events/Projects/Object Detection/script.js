const video = document.getElementById("webcam");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");

const toggleTorchBtn = document.getElementById("toggleTorch");
const switchCameraBtn = document.getElementById("switchCamera");
const startCameraBtn = document.getElementById("startCamera");

let model, stream;
let useBackCamera = true;
let lastAnnouncementTime = 0;
let torchOn = false;

// YOLOv8 Model URL
const modelUrl = "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx";

// Load YOLOv8 ONNX Model
async function loadModel() {
  model = await ort.InferenceSession.create(modelUrl);
  detectObjects();
}

// Start Camera
async function setupWebcam() {
  stopCamera();
  const constraints = {
    video: { 
      facingMode: useBackCamera ? "environment" : "user",
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.onloadedmetadata = () => video.play();
  } catch (error) {
    console.error("Camera error:", error);
  }
}

// Switch Camera
switchCameraBtn.addEventListener("click", async () => {
  useBackCamera = !useBackCamera;
  await setupWebcam();
});

// Toggle Torch
toggleTorchBtn.addEventListener("click", () => {
  if (!stream) return;

  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();

  if (capabilities.torch) {
    torchOn = !torchOn;
    track.applyConstraints({ advanced: [{ torch: torchOn }] });
  } else {
    alert("Torch not supported on this device.");
  }
});

// Stop Camera
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// Convert Video Frame to Tensor
async function processVideoFrame() {
  const tensor = tf.browser.fromPixels(video).resizeNearestNeighbor([640, 640]).expandDims(0).toFloat();
  const input = tensor.dataSync();
  return new ort.Tensor("float32", input, [1, 3, 640, 640]);
}

// Detect Objects with YOLOv8
async function detectObjects() {
  if (!model) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const inputTensor = await processVideoFrame();
  const outputs = await model.run({ images: inputTensor });

  const predictions = outputs["output"];
  predictions.forEach(prediction => {
    const [x, y, width, height, confidence, classIndex] = prediction;
    if (confidence > 0.5) {
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 6;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "#00FFFF";
      ctx.font = "24px Arial";
      ctx.fillText(`Object ${classIndex}`, x, y - 5);
    }
  });

  // Announce detections every 2 seconds
  if (predictions.length > 0) {
    const currentTime = Date.now();
    if (currentTime - lastAnnouncementTime >= 2000) {
      speak(`Detected ${predictions.length} objects`);
      lastAnnouncementTime = currentTime;
    }
  }

  requestAnimationFrame(detectObjects);
}

// Voice Announcements
function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

// Start Camera & Model
startCameraBtn.addEventListener("click", async () => {
  await setupWebcam();
  if (!model) await loadModel();
});