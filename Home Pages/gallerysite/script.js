const mediaData = {
    images: [],
    videos: []
};

// Function to fetch images from the images folder
function fetchImages() {
    fetch('/media/images')
        .then(response => response.text())
        .then(data => {
            const imageFiles = extractFiles(data, 'images');
            imageFiles.forEach(file => {
                mediaData.images.push(`media/images/${file}`);
            });
            displayMedia('images');
        });
}

// Function to fetch videos from the videos folder
function fetchVideos() {
    fetch('/media/videos')
        .then(response => response.text())
        .then(data => {
            const videoFiles = extractFiles(data, 'videos');
            videoFiles.forEach(file => {
                mediaData.videos.push(`media/videos/${file}`);
            });
            displayMedia('videos');
        });
}

// Extract file names from the folder listing
function extractFiles(data, type) {
    const regex = /<a href="([^"]+\.(jpg|jpeg|png|gif|webp|mp4|webm|avi|mov|mkv))">/g;
    let files = [];
    let match;
    while ((match = regex.exec(data)) !== null) {
        files.push(match[1]);
    }
    return files;
}

// Function to display images or videos based on the category
function displayMedia(category) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear previous content

    let mediaList = category === 'images' ? mediaData.images : mediaData.videos;
    mediaList.forEach(item => {
        const mediaElement = document.createElement('div');
        mediaElement.classList.add('thumbnail');

        if (item.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            const img = document.createElement('img');
            img.src = item;
            img.alt = 'Image';
            img.onclick = () => openLightbox(item, 'image');
            mediaElement.appendChild(img);
        } else if (item.match(/\.(mp4|webm|avi|mov|mkv)$/)) {
            const video = document.createElement('video');
            video.src = item;
            video.controls = true;
            video.onclick = () => openLightbox(item, 'video');
            mediaElement.appendChild(video);
        }

        gallery.appendChild(mediaElement);
    });
}

// Handle category switching
function showCategory(category) {
    if (category === 'all') {
        displayMedia('images');
        displayMedia('videos');
    } else {
        displayMedia(category);
    }
}

// Search functionality
function searchMedia() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    let mediaList = [...mediaData.images, ...mediaData.videos];

    mediaList = mediaList.filter(item => item.toLowerCase().includes(searchInput));
    mediaList.forEach(item => {
        const mediaElement = document.createElement('div');
        mediaElement.classList.add('thumbnail');

        if (item.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            const img = document.createElement('img');
            img.src = item;
            img.alt = 'Image';
            img.onclick = () => openLightbox(item, 'image');
            mediaElement.appendChild(img);
        } else if (item.match(/\.(mp4|webm|avi|mov|mkv)$/)) {
            const video = document.createElement('video');
            video.src = item;
            video.controls = true;
            video.onclick = () => openLightbox(item, 'video');
            mediaElement.appendChild(video);
        }

        gallery.appendChild(mediaElement);
    });
}

// Open Lightbox for images or videos
function openLightbox(item, type) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImage');
    const video = document.getElementById('lightboxVideo');

    if (type === 'image') {
        img.src = item;
        img.style.display = 'block';
        video.style.display = 'none';
    } else if (type === 'video') {
        video.src = item;
        video.style.display = 'block';
        img.style.display = 'none';
    }

    modal.style.display = 'flex';
}

// Close the lightbox
function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    modal.style.display = 'none';
}

// Upload media (temporary localStorage solution)
function uploadMedia() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaType = file.type.startsWith('image') ? 'image' : 'video';
            const mediaData = { src: e.target.result, type: mediaType };
            localStorage.setItem(file.name, JSON.stringify(mediaData));
        };
        reader.readAsDataURL(file);
    }
}

fetchImages();
fetchVideos();
