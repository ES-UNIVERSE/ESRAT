function keylogger() {
    fetchAllKeylogs().then(keylogs => {
        const newWindow = window.open("", "Keylogs", "width=600,height=400");

        if (!newWindow) {
            alert('Failed to open a new window. Please check your browser settings.');
            return;
        }

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Keylogs</title>
            </head>
            <body>
                <h1>Keylogs</h1>
                <pre>${keylogs.reverse().join('\\n')}</pre>
                <a id="downloadLink" href="#">Download Keylogs</a>
                <script>
                    const keylogs = ${JSON.stringify(keylogs.reverse())};
                    const blob = new Blob([keylogs.join('\\n')], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    document.getElementById('downloadLink').href = url;
                    document.getElementById('downloadLink').download = 'keylogs.txt';
                    document.getElementById('downloadLink').addEventListener('click', () => {
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    });
                </script>
            </body>
            </html>
        `;

        newWindow.document.open();
        newWindow.document.write(content);
        newWindow.document.close();
    }).catch(error => {
        console.error('Error fetching keylogs:', error);
    });
}
