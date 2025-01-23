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
            detectObjects(); // Ensure detection starts when video loads
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

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const label = prediction.class;
            const confidence = (prediction.score * 100).toFixed(1);

            // Draw bounding box
            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 5;
            ctx.strokeRect(x, y, width, height);

            // Draw label
            ctx.fillStyle = "#00FFFF";
            ctx.font = "18px Arial";
            ctx.fillText(`${label} (${confidence}%)`, x, y - 5);
        });

        // Announce detections every 2 seconds
        if (predictions.length > 0) {
            const currentTime = Date.now();
            if (currentTime - lastAnnouncementTime >= 2000) {
                const objectNames = predictions.map(p => p.class);
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