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

// 🎥 Start Camera
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

// 🔄 Switch Camera
switchCameraBtn.addEventListener("click", async () => {
  useBackCamera = !useBackCamera;
  await setupWebcam();
});

// 🔦 Toggle Torch (Only Works on Supported Devices)
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

// 🛑 Stop Camera
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

// 🎙️ Speak Function
function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

// 📦 Load COCO-SSD Model
async function loadModel() {
  model = await cocoSsd.load();
  detectObjects();
}

// 🖼️ Detect Objects
async function detectObjects() {
  if (!model) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const predictions = await model.detect(video);
  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox;
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 6;  // Thicker Boxes
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#00FFFF";
    ctx.font = "24px Arial";
    ctx.fillText(prediction.class, x, y - 5);
  });

  // 📢 Announce Detections (Every 2 Seconds)
  if (predictions.length > 0) {
    const currentTime = Date.now();
    if (currentTime - lastAnnouncementTime >= 2000) {
      const objectsDetected = predictions.map(p => p.class);
      const uniqueObjects = [...new Set(objectsDetected)];
      const detectionText = uniqueObjects.length === 1 
        ? `A ${uniqueObjects[0]} detected` 
        : `${uniqueObjects.length} objects detected: ${uniqueObjects.join(", ")}`;

      speak(detectionText);
      lastAnnouncementTime = currentTime;
    }
  }

  requestAnimationFrame(detectObjects);
}

// ▶️ Start Camera & Model
startCameraBtn.addEventListener("click", async () => {
  await setupWebcam();
  if (!model) await loadModel();
});