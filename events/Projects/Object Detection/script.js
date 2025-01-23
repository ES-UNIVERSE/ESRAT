const video = document.getElementById("webcam");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");

const toggleTorchBtn = document.getElementById("toggleTorch");
const switchCameraBtn = document.getElementById("switchCamera");
const startCameraBtn = document.getElementById("startCamera");

let model, stream;
let useBackCamera = true;
let torchOn = false;
let lastAnnouncementTime = 0;
let previousDetections = new Map();
let isDetecting = false;

// Load COCO-SSD Model
async function loadModel() {
    model = await cocoSsd.load();
    console.log("COCO-SSD Model Loaded!");
    detectObjects();
}

// Start Webcam with High FPS
async function setupWebcam() {
    stopCamera();
    const constraints = {
        video: {
            facingMode: useBackCamera ? "environment" : "user",
            width: { ideal: 1920 },  // High resolution
            height: { ideal: 1080 },
            frameRate: { ideal: 60, max: 60 } // 60 FPS
        }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            detectObjects(); 
        };
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

// Optimized Object Detection Loop
async function detectObjects() {
    if (!model || isDetecting) return;

    isDetecting = true;
    requestAnimationFrame(detectObjects);  // Ensure 60 FPS loop

    if (video.readyState !== 4) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Run detection asynchronously to avoid frame lag
    model.detect(video).then(predictions => {
        let updatedDetections = new Map();

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const label = prediction.class;
            const confidence = prediction.score;

            // Only keep high-confidence detections to prevent flickering
            if (confidence > 0.6) {
                let prev = previousDetections.get(label);
                if (prev) {
                    // Smooth position using interpolation
                    prediction.bbox[0] = prev.x * 0.8 + x * 0.2;
                    prediction.bbox[1] = prev.y * 0.8 + y * 0.2;
                    prediction.bbox[2] = prev.width * 0.8 + width * 0.2;
                    prediction.bbox[3] = prev.height * 0.8 + height * 0.2;
                }
                updatedDetections.set(label, { x, y, width, height });
            }
        });

        previousDetections = updatedDetections;

        // Draw smooth bounding boxes
        previousDetections.forEach((bbox, label) => {
            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 6; // Thicker bounding box
            ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

            ctx.fillStyle = "#00FFFF";
            ctx.font = "20px Arial";
            ctx.fillText(`${label}`, bbox.x, bbox.y - 10);
        });

        // Announce detections every 2 seconds
        if (previousDetections.size > 0) {
            const currentTime = Date.now();
            if (currentTime - lastAnnouncementTime >= 2000) {
                const objectNames = [...previousDetections.keys()];
                const announcementText = formatAnnouncement(objectNames);
                speak(announcementText);
                lastAnnouncementTime = currentTime;
            }
        }

        isDetecting = false; // Allow next detection cycle
    });
}

// Format Speech Announcement
function formatAnnouncement(objects) {
    const uniqueObjects = [...new Set(objects)];
    if (uniqueObjects.length === 1) {
        return `A ${uniqueObjects[0]} detected.`;
    } else if (uniqueObjects.length === 2) {
        return `A ${uniqueObjects[0]} and a ${uniqueObjects[1]} detected.`;
    } else {
        return `${uniqueObjects.length} objects detected.`;
    }
}

// Text-to-Speech
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

// Start Camera & Model
startCameraBtn.addEventListener("click", async () => {
    await loadModel();
    await setupWebcam();
});