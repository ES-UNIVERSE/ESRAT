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

let photosByDate = {};

// Function to format date to IST (Indian Standard Time)
function formatToIST(dateString) {
    // Convert the date string to a Date object
    const utcDate = new Date(dateString);

    // Adjust to Indian Standard Time (UTC +5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30 in milliseconds
    const istDate = new Date(utcDate.getTime() + istOffset);

    // Format date as DD-MMM-YYYY
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return istDate.toLocaleDateString('en-US', options);
}

function displayPhotosByDate() {
    const storageRef = storage.ref('users');
    const dateList = document.getElementById('dateList');
    const photoList = document.getElementById('photoList');

    storageRef.listAll().then((result) => {
        const photos = result.items;

        const promises = photos.map((imageRef) => {
            return imageRef.getMetadata().then((metadata) => {
                const timestamp = metadata.timeCreated;
                const formattedDate = formatToIST(timestamp);

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
                    time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    location: userLocation
                });
            });
        });

        Promise.all(promises).then(() => {
            const sortedDates = Object.keys(photosByDate).sort((a, b) => new Date(b) - new Date(a));
            dateList.innerHTML = '';

            sortedDates.forEach((date) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                dateItem.textContent = date; // Using the formatted date without the day name
                dateItem.onclick = () => displayPhotosForDate(photosByDate[date]);

                dateList.appendChild(dateItem);
            });

            if (sortedDates.length === 0) {
                dateList.textContent = 'No photos found for any date.';
            }
        });
    }).catch((error) => {
        console.error('Error listing images:', error);
        document.getElementById('dateList').textContent = 'Error loading photos. Please try again later.';
    });
}

function displayPhotosForDate(photos) {
    const photoList = document.getElementById('photoList');
    photoList.innerHTML = '';

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
            <button onclick="downloadMap(${photo.location.latitude}, ${photo.location.longitude})">DL Map</button>
        `;
        photoList.appendChild(photoItem);
    });
}

function viewPhoto(photoPath) {
    const storageRef = storage.ref(photoPath);
    storageRef.getDownloadURL().then((url) => {
        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.style.maxWidth = '100%';
        imgElement.style.height = 'auto';
        const photoList = document.getElementById('photoList');
        photoList.innerHTML = '';
        photoList.appendChild(imgElement);
    }).catch((error) => {
        console.error('Error retrieving image URL:', error);
    });
}

function showMap(latitude, longitude) {
    if (latitude && longitude) {
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;
        window.open(mapUrl, '_blank');
    } else {
        alert('No coordinates available for this photo.');
    }
}

function downloadMap(latitude, longitude) {
    const apiKey = '6706339e20b94127377139nyudb9267'; // Your API key
    const reverseGeocodingUrl = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=${apiKey}`;

    // Open the reverse geocoding URL in a new tab
    window.open(reverseGeocodingUrl, '_blank');
}

window.onload = displayPhotosByDate;
