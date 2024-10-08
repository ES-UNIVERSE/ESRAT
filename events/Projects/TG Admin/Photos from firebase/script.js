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

// Function to format date and return a string with the format "Date Month (short) Year, Day Name"
function formatDateWithDay(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
    return date.toLocaleDateString(undefined, options);
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
                const formattedDate = formatDateWithDay(timestamp);

                if (!photosByDate[formattedDate]) {
                    photosByDate[formattedDate] = [];
                }

                const userLocation = {
                    latitude: metadata.customMetadata ? metadata.customMetadata.latitude : null,
                    longitude: metadata.customMetadata ? metadata.customMetadata.longitude : null
                };

                photosByDate[formattedDate].push({
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
            sortedDates.forEach((date) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                dateItem.textContent = date; // Display formatted date
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
        const mapUrl = `https://www.google.com/maps/@${latitude},${longitude},15z`;
        window.open(mapUrl, '_blank'); // Open map in new tab
    } else {
        alert('No coordinates available for this photo.');
    }
}

// Call the display function on page load
window.onload = displayPhotosByDate;