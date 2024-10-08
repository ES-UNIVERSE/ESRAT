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

// Variable to store photos and their locations
let photosByDate = {};

// Function to format date in the desired format
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
    return new Date(date).toLocaleDateString('en-US', options);
}

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
                const dayName = formatDate(timestamp); // Correctly formatted date and day

                if (!photosByDate[date]) {
                    photosByDate[date] = [];
                }

                const userLocation = {
                    latitude: metadata.customMetadata ? metadata.customMetadata.latitude : null,
                    longitude: metadata.customMetadata ? metadata.customMetadata.longitude : null
                };

                photosByDate[date].push({
                    name: imageRef.name,
                    fullPath: imageRef.fullPath,
                    time: new Date(timestamp).toLocaleTimeString(),
                    location: userLocation
                });
            });
        });

        Promise.all(promises).then(() => {
            // Display date list after grouping photos
            const sortedDates = Object.keys(photosByDate).sort((a, b) => new Date(b) - new Date(a)); // Sort dates
            dateList.innerHTML = ''; // Clear previous date list

            sortedDates.forEach((date) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                dateItem.textContent = formatDate(date);  // Correct format
                dateItem.onclick = () => displayPhotosForDate(photosByDate[date]);

                dateList.appendChild(dateItem);
            });

            // Check if dates were found
            if (sortedDates.length === 0) {
                dateList.textContent = 'No photos found for any date.';
            }
        });
    }).catch((error) => {
        console.error('Error listing images:', error);
        document.getElementById('dateList').textContent = 'Error loading photos. Please try again later.';
    });
}

// Function to display photos for a specific date
function displayPhotosForDate(photos) {
    const photoList = document.getElementById('photoList');
    photoList.innerHTML = ''; // Clear previous list

    if (photos.length === 0) {
        photoList.textContent = 'No photos available for this date.';
        return;
    }

    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <span>${index + 1}. ${photo.name} - ${photo.time}</span>
            <button onclick="viewPhoto('${photo.fullPath}')">View</button>
            <button onclick="showMap(${photo.location.latitude}, ${photo.location.longitude})">Map</button>
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

// Function to show map for given coordinates
function showMap(latitude, longitude) {
    if (latitude && longitude) {
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;
        window.open(mapUrl, '_blank'); // Open map in new tab
    } else {
        alert('No coordinates available for this photo.');
    }
}

// Call the display function on page load
window.onload = displayPhotosByDate;