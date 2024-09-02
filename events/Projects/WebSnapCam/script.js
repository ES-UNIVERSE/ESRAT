// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEAy2KXezICmuuQZnhNq12nqwwBouDjt4",
    authDomain: "webcamera-es-universe-git.firebaseapp.com",
    projectId: "webcamera-es-universe-git",
    storageBucket: "webcamera-es-universe-git.appspot.com",
    messagingSenderId: "949054088643",
    appId: "1:949054088643:web:039f79fcae7259f4358976"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

// Access the camera and start the video stream
async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('message').textContent = 'Camera access granted!';

        // Create a video element to display the stream
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        // Create a canvas element for capturing the photo
        const canvas = document.createElement('canvas');
        document.body.appendChild(video);  // Add video to body for preview
        document.body.appendChild(canvas); // Add canvas to body

        // Capture the photo once the video stream is ready
        video.addEventListener('loadeddata', () => {
            captureAndUploadPhoto(video, canvas, stream);
        });
    } catch (error) {
        document.getElementById('message').textContent = 'Camera access denied or an error occurred.';
        console.error('Error accessing camera:', error);
    }
}

// Capture and upload the photo to Firebase Storage
async function captureAndUploadPhoto(video, canvas, stream) {
    const context = canvas.getContext('2d');

    // Set the canvas size to the video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Blob
    canvas.toBlob(async function(blob) {
        // Create a unique filename
        const timestamp = new Date().toISOString();
        const fileName = `users/photo_${timestamp}.png`;

        // Create a reference to Firebase Storage
        const storageRef = storage.ref(fileName);

        try {
            // Upload the image to Firebase Storage
            await storageRef.put(blob);
            alert('Photo uploaded to Firebase successfully!');

            // Stop all video tracks after capturing the photo
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
            alert('Failed to upload photo.');
        }
    });
}

// Request camera permission when the page loads
window.onload = requestCameraPermission;
