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

// Function to retrieve and display photos grouped by date
async function displayPhotosByDate() {
    const storageRef = storage.ref('users');
    const dateList = document.getElementById('dateList');
    dateList.innerHTML = ''; // Clear existing list

    try {
        const result = await storageRef.listAll();
        const photosByDate = {};

        // Group photos by date
        await Promise.all(result.items.map(async (imageRef) => {
            const metadata = await imageRef.getMetadata();
            const timestamp = metadata.timeCreated;
            const date = new Date(timestamp);
            const formattedDate = date.toLocaleDateString(); // Date in format: MM/DD/YYYY
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Get the abbreviated day name (e.g., "Sun")

            if (!photosByDate[formattedDate]) {
                photosByDate[formattedDate] = {
                    day: dayName,
                    photos: []
                };
            }
            photosByDate[formattedDate].photos.push({
                name: imageRef.name,
                fullPath: imageRef.fullPath,
                time: new Date(timestamp).toLocaleTimeString(),
                latitude: metadata.customMetadata ? parseFloat(metadata.customMetadata.latitude) : 0,
                longitude: metadata.customMetadata ? parseFloat(metadata.customMetadata.longitude) : 0
            });
        }));

        // Sort dates in descending order
        const sortedDates = Object.keys(photosByDate).sort((a, b) => new Date(b) - new Date(a));

        // Display date list after grouping photos
        sortedDates.forEach(date => {
            const dateItem = document.createElement('div');
            dateItem.className = 'date-item';
            dateItem.textContent = `${photosByDate[date].day} ${date}`; // Display day name before the date
            dateItem.onclick = () => displayPhotosForDate(photosByDate[date].photos);

            dateList.appendChild(dateItem);
        });
    } catch (error) {
        console.error('Error listing images:', error);
    }
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
            <button onclick="openMap(${photo.latitude}, ${photo.longitude})">Map</button>
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

// Function to open the map with coordinates
function openMap(latitude, longitude) {
    if (latitude && longitude) {
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(mapUrl, '_blank'); // Opens map in a new tab
    } else {
        alert('No coordinates available for this photo.');
    }
}

// Call the display function on page load
window.onload = displayPhotosByDate;
