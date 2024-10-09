from flask import Flask, send_file, request
import urllib.request
from PIL import Image
import os
import math

app = Flask(__name__)

class GoogleMapDownloader:
    def __init__(self, lat, lng, zoom=18):
        self._lat = lat
        self._lng = lng
        self._zoom = zoom

    def getXY(self):
        tile_size = 256
        numTiles = 1 << self._zoom
        point_x = (tile_size / 2 + self._lng * tile_size / 360.0) * numTiles // tile_size
        sin_y = math.sin(self._lat * (math.pi / 180.0))
        point_y = ((tile_size / 2) + 0.5 * math.log((1 + sin_y) / (1 - sin_y)) * -(tile_size / (2 * math.pi))) * numTiles // tile_size
        return int(point_x), int(point_y)

    def generateImage(self, start_x=None, start_y=None, tile_width=5, tile_height=5):
        if start_x is None or start_y is None:
            start_x, start_y = self.getXY()
        width, height = 256 * tile_width, 256 * tile_height
        map_img = Image.new('RGB', (width, height))

        for x in range(tile_width):
            for y in range(tile_height):
                try:
                    url = f'https://mt0.google.com/vt?lyrs=s&x={start_x + x}&y={start_y + y}&z={self._zoom}'
                    current_tile = f'{x}-{y}.png'
                    print(f"Downloading tile {x}-{y} from {url}")
                    urllib.request.urlretrieve(url, current_tile)

                    im = Image.open(current_tile)
                    map_img.paste(im, (x * 256, y * 256))
                    os.remove(current_tile)
                except Exception as e:
                    print(f"Failed to download tile {x}-{y}: {e}")

        return map_img

@app.route('/download_map/<float:lat>/<float:lng>')
def download_map(lat, lng):
    gmd = GoogleMapDownloader(lat, lng)
    try:
        img = gmd.generateImage()
        # Save to a temporary location
        temp_file_path = 'satellite_image_zoom18.png'
        img.save(temp_file_path)
        return send_file(temp_file_path, as_attachment=True)
    except Exception as e:
        print(f"Error generating map: {e}")
        return "Error generating map", 500

if __name__ == '__main__':
    app.run(debug=True)
