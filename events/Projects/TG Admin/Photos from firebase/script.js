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
const database = firebase.database(); // Initialize the Realtime Database

// Variable to store photos and their locations
let photosByDate = {};

// Function to retrieve and display photos grouped by date
function displayPhotosByDate() {
    const storageRef = storage.ref('users');
    const dateList = document.getElementById('dateList');
    const photoList = document.getElementById('photoList');

    storageRef.listAll().then((result) => {
        const photos = result.items;

        // Group photos by date
        const promises = photos.map((imageRef) => {
            return imageRef.getMetadata().then((metadata) => {
                const timestamp = metadata.timeCreated;
                const date = new Date(timestamp).toLocaleDateString();

                if (!photosByDate[date]) {
                    photosByDate[date] = [];
                }

                photosByDate[date].push({
                    name: imageRef.name,
                    fullPath: imageRef.fullPath,
                    time: new Date(timestamp).toLocaleTimeString(),
                    photoId: imageRef.name // Store the photo name (or ID) to query the location from the Realtime Database
                });
            });
        });

        Promise.all(promises).then(() => {
            // Display date list after grouping photos
            const sortedDates = Object.keys(photosByDate).sort((a, b) => new Date(b) - new Date(a)); // Sort dates
            sortedDates.forEach((date) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                dateItem.textContent = `${new Date(date).toLocaleDateString()} (${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })})`;
                dateItem.onclick = () => displayPhotosForDate(photosByDate[date]);

                dateList.appendChild(dateItem);
            });
        });
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
            <button onclick="showMap('${photo.photoId}')">Map</button>
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

// Function to fetch the latest photo's metadata and open a map
async function openMap() {
    try {
        // Get a reference to the latest uploaded photo
        const storageRef = storage.ref('users/');
        const listResult = await storageRef.list({ maxResults: 1 }); // Fetch the latest photo
        
        if (listResult.items.length > 0) {
            const latestPhotoRef = listResult.items[0];

            // Get the metadata of the latest photo
            const metadata = await latestPhotoRef.getMetadata();
            const latitude = metadata.customMetadata.latitude;
            const longitude = metadata.customMetadata.longitude;

            if (latitude && longitude) {
                // Open Google Maps with the latitude and longitude
                const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                window.open(mapUrl, '_blank');
            } else {
                alert('Location data not available for the latest photo.');
            }
        } else {
            alert('No photos found.');
        }
    } catch (error) {
        console.error('Error fetching metadata:', error);
        alert('Failed to retrieve location.');
    }
}

// Attach the openMap function to your "Map" button
document.getElementById('mapButton').addEventListener('click', openMap);
