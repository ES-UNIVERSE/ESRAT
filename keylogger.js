// Function to fetch all keylogs (replace this with your actual keylogs fetching logic)
function fetchAllKeylogs() {
    return new Promise(resolve => {
        // Replace with real data fetching
        let keylogs = [
            'User pressed A',
            'User pressed B',
            'User pressed C',
        ];
        console.log('Fetched keylogs:', keylogs); // Debugging statement
        resolve(keylogs);
    });
}


// Function to handle keylogger action
function keylogger() {
    fetchAllKeylogs().then(keylogs => {
        console.log('Keylogs to be shown/downloaded:', keylogs);

        // Create the HTML content for the new window
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Keylogs</title>
            </head>
            <body>
                <h1>Keylogs</h1>
                <pre id="keylogsContent">${keylogs.reverse().join('\\n')}</pre>
                <a id="downloadLink" href="#">Download Keylogs</a>
                <script>
                    // Create a blob from keylogs
                    const keylogs = ${JSON.stringify(keylogs.reverse())};
                    const blob = new Blob([keylogs.join('\\n')], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    
                    // Set up the download link
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = url;
                    downloadLink.download = 'keylogs.txt';
                    
                    // Clean up URL object after download
                    downloadLink.addEventListener('click', () => {
                        setTimeout(() => URL.revokeObjectURL(url), 1000); // Clean up URL object after download
                    });
                </script>
            </body>
            </html>
        `;

    }).catch(error => {
        console.error('Error fetching keylogs:', error);
    });
}

