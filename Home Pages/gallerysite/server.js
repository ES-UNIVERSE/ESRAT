const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = file.mimetype.startsWith('image') ? 'images' : 'videos';
        cb(null, `./media/${dir}`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Serve static files (images and videos)
app.use('/media', express.static(path.join(__dirname, 'media')));

// Serve the HTML, CSS, and JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// Route for uploading files
app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ success: true });
});

// Route to list files in a directory (to fetch images and videos)
app.get('/media/images', (req, res) => {
    const imagesDir = path.join(__dirname, 'media/images');
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        res.send(files.map(file => `<a href="images/${file}">${file}</a><br>`).join(''));
    });
});

app.get('/media/videos', (req, res) => {
    const videosDir = path.join(__dirname, 'media/videos');
    fs.readdir(videosDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        res.send(files.map(file => `<a href="videos/${file}">${file}</a><br>`).join(''));
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
