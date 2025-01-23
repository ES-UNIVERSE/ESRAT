const video = document.getElementById('webcam');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const resultDiv = document.getElementById('result');
const startButton = document.getElementById('startButton');
const switchButton = document.getElementById('switchButton');
const torchButton = document.getElementById('torchButton');

let model;
let lastAnnouncementTime = 0;
let currentStream = null;
let useFrontCamera = false;
let track = null;
let torchEnabled = false;

// 🔹 Start webcam
async function setupWebcam() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            facingMode: useFrontCamera ? "user" : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        track = currentStream.getVideoTracks()[0];
        video.onloadedmetadata = () => video.play();
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Failed to access webcam. Check permissions.');
    }
}

// 🔹 Load model and start detection
async function loadModel() {
    model = await cocoSsd.load();
    detectObjects();
}

// 🔹 Resize canvas
function resizeCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

// 🔹 Toggle torch (flashlight) ON/OFF
function toggleTorch() {
    if (!track) return;
    
    const capabilities = track.getCapabilities();
    if (!capabilities.torch) {
        alert("Torch is not supported on this device.");
        return;
    }

    torchEnabled = !torchEnabled;
    track.applyConstraints({ advanced: [{ torch: torchEnabled }] });
}

// 🔹 Switch between front and back cameras
function switchCamera() {
    useFrontCamera = !useFrontCamera;
    setupWebcam();
}

// 🔹 Announce detected objects every 2 seconds
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

// 🔹 Format detected object names
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// 🔹 Create announcement text for detected objects
function getDetectionText(predictions) {
    const counts = {};
    predictions.forEach(prediction => {
        const className = capitalizeFirstLetter(prediction.class);
        counts[className] = (counts[className] || 0) + 1;
    });

    const items = Object.entries(counts).map(([className, count]) => {
        return count === 1 ? className : `${count} ${className}s`;
    });

    return `A ${items.join(', ')} detected`;
}

// 🔹 Smooth object detection using keyframe tracking-like logic
let previousPredictions = [];

function smoothPredictions(newPredictions) {
    const smoothed = [];
    newPredictions.forEach(newPred => {
        let closestMatch = null;
        let minDistance = Infinity;

        previousPredictions.forEach(oldPred => {
            const dx = newPred.bbox[0] - oldPred.bbox[0];
            const dy = newPred.bbox[1] - oldPred.bbox[1];
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                closestMatch = oldPred;
            }
        });

        if (closestMatch && minDistance < 50) {
            smoothed.push({
                ...newPred,
                bbox: closestMatch.bbox.map((val, i) => (val * 0.6 + newPred.bbox[i] * 0.4))
            });
        } else {
            smoothed.push(newPred);
        }
    });

    previousPredictions = smoothed;
    return smoothed;
}

// 🔹 Detect objects and draw bounding boxes
async function detectObjects() {
    if (!model) {
        console.log('Model is still loading...');
        setTimeout(detectObjects, 500);
        return;
    }

    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let predictions = await model.detect(video);
    predictions = smoothPredictions(predictions);

    // 🔹 Draw bounding boxes and labels
    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        const text = capitalizeFirstLetter(prediction.class);

        // 🔹 Draw bounding box (Thicker)
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 5;
        ctx.strokeRect(x, y, width, height);

        // 🔹 Draw label
        ctx.fillStyle = '#00FFFF';
        ctx.font = '18px Arial';
        ctx.fillText(text, x, y - 10);
    });

    if (predictions.length > 0) {
        const currentTime = Date.now();
        if (currentTime - lastAnnouncementTime >= 2000) {
            const detectionText = getDetectionText(predictions);
            speak(detectionText);
            lastAnnouncementTime = currentTime;
        }
    }

    requestAnimationFrame(detectObjects);
}

startButton.addEventListener('click', setupWebcam);
switchButton.addEventListener('click', switchCamera);
torchButton.addEventListener('click', toggleTorch);