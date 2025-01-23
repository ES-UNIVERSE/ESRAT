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
let previousDetections = new Map(); // Store previous detections for smoothing

// Load the COCO-SSD model
async function loadModel() {
    model = await cocoSsd.load();
    console.log("COCO-SSD Model Loaded!");
    detectObjects();
}

// Start the webcam
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
        video.onloadedmetadata = () => {
            video.play();
            detectObjects(); // Start detection when video is ready
        };
    } catch (error) {
        console.error("Camera error:", error);
    }
}

// Switch between front and back camera
switchCameraBtn.addEventListener("click", async () => {
    useBackCamera = !useBackCamera;
    await setupWebcam();
});

// Toggle Torch (only works on mobile with a rear camera)
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

// Stop the camera stream
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// Object detection function
async function detectObjects() {
    if (!model) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (video.readyState === 4) {
        const predictions = await model.detect(video);

        // Smooth object tracking using previous detections
        let updatedDetections = new Map();

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const label = prediction.class;
            const confidence = prediction.score;

            // Only consider confident detections (reduce flickering)
            if (confidence > 0.5) {
                let prev = previousDetections.get(label);
                if (prev) {
                    // Smooth the position using interpolation
                    prediction.bbox[0] = prev.x * 0.7 + x * 0.3;
                    prediction.bbox[1] = prev.y * 0.7 + y * 0.3;
                    prediction.bbox[2] = prev.width * 0.7 + width * 0.3;
                    prediction.bbox[3] = prev.height * 0.7 + height * 0.3;
                }
                updatedDetections.set(label, { x, y, width, height });
            }
        });

        previousDetections = updatedDetections; // Store smoothed detections

        // Draw bounding boxes smoothly
        previousDetections.forEach((bbox, label) => {
            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 5;
            ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

            ctx.fillStyle = "#00FFFF";
            ctx.font = "18px Arial";
            ctx.fillText(`${label}`, bbox.x, bbox.y - 5);
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
    }

    requestAnimationFrame(detectObjects);
}

// Format speech announcement
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
    await setupWebcam();
    if (!model) await loadModel();
});