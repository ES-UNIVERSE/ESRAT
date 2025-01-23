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

    const torchOn = track.getSettings().torch || false;
    track.applyConstraints({ advanced: [{ torch: !torchOn }] });
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

// 🔹 Detect objects and draw bounding boxes
async function detectObjects() {
    if (!model) {
        console.log('Model is still loading...');
        setTimeout(detectObjects, 500);
        return;
    }

    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const predictions = await model.detect(video);

    // 🔹 Draw bounding boxes and labels
    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        const text = capitalizeFirstLetter(prediction.class);

        // 🔹 Draw bounding box (Thicker)
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 5; // 🔹 Increased thickness
        ctx.strokeRect(x, y, width, height);

        // 🔹 Draw label
        ctx.fillStyle = '#00FFFF';
        ctx.font = '18px Arial';
        ctx.fillText(text, x, y - 10);
    });

    // 🔹 Update resultDiv with detected objects
    resultDiv.innerHTML = '';
    predictions.forEach(prediction => {
        const capitalizedText = capitalizeFirstLetter(prediction.class);
        resultDiv.innerHTML += `<p>${capitalizedText}: ${Math.round(prediction.score * 100)}%</p>`;
    });

    // 🔹 Speak detected objects every 2 seconds
    if (predictions.length > 0) {
        const currentTime = Date.now();
        if (currentTime - lastAnnouncementTime >= 2000) { // 2 seconds interval
            const detectionText = getDetectionText(predictions);
            speak(detectionText);
            lastAnnouncementTime = currentTime;
        }
    }

    requestAnimationFrame(detectObjects);
}

// 🔹 Event Listeners for Buttons
startButton.addEventListener('click', () => {
    setupWebcam().then(() => {
        loadModel();
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }).catch(error => {
        console.error('Error setting up webcam:', error);
        alert('Failed to access webcam. Check permissions.');
    });
});

switchButton.addEventListener('click', switchCamera);
torchButton.addEventListener('click', toggleTorch);

// 🔹 Ensure HTTPS or localhost
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    alert('This page must be served over HTTPS or localhost for the camera to work.');
}