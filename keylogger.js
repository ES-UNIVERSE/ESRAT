// Function to fetch all keylogs (replace with your actual keylogs fetching logic)
function fetchAllKeylogs() {
    return new Promise(resolve => {
        // Example keylogs data, replace this with actual fetching logic
        let keylogs = [
            'User pressed A',
            'User pressed B',
            'User pressed C',
            // Add more keylogs here or fetch from Firebase
        ];
        resolve(keylogs);
    });
}

// Function to handle keylogger action
function keylogger() {
    fetchAllKeylogs().then(keylogs => {
        // Open a new window
        const newWindow = window.open("", "Keylogs", "width=600,height=400");

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

        // Write the HTML content to the new window
        newWindow.document.open();
        newWindow.document.write(content);
        newWindow.document.close();
    }).catch(error => {
        console.error('Error fetching keylogs:', error);
    });
}
