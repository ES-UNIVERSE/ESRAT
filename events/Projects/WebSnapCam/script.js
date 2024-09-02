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
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('message').textContent = 'Camera access granted!';
        
        // Start the video stream
        const video = document.getElementById('video');
        video.srcObject = stream;
        
        // Capture photo after the video metadata is loaded
        video.onloadedmetadata = capturePhoto;
    } catch (error) {
        document.getElementById('message').textContent = 'Camera access denied or an error occurred.';
        console.error('Error accessing camera:', error);
    }
}

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas'); // Create an off-screen canvas
    const context = canvas.getContext('2d');

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Blob and upload it to Firebase
    canvas.toBlob(async function(blob) {
        const fileName = `photo_${Date.now()}.png`;
        const storageRef = storage.ref(`users/${fileName}`);

        try {
            await storageRef.put(blob);
            document.getElementById('message').textContent = `Photo uploaded as ${fileName}!`;
        } catch (error) {
            document.getElementById('message').textContent = 'Failed to upload photo.';
            console.error('Error uploading to Firebase:', error);
        }
    });
}

// Request camera permission on page load
window.onload = requestCameraPermission;
