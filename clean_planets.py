import os
import math
from PIL import Image

folder = r'c:\Planetary_weight\public\planets'
for filename in os.listdir(folder):
    if not filename.endswith('.png'):
        continue
    filepath = os.path.join(folder, filename)
    img = Image.open(filepath).convert('RGBA')
    width, height = img.size
    cx, cy = width / 2, height / 2
    
    data = img.load()
    
    if filename == 'saturn.png':
        # Satun uses luminance thresholding because of rings
        for y in range(height):
            for x in range(width):
                r, g, b, a = data[x, y]
                lum = 0.299*r + 0.587*g + 0.114*b
                if lum < 10:
                    data[x, y] = (r, g, b, 0)
                elif lum < 35:
                    alpha = int((lum - 10) / 25.0 * 255)
                    data[x, y] = (r, g, b, alpha)
    else:
        # All others are spheres. Approximate 80% diameter => 40% radius
        # We'll use 42% radius to be safe and include atmospheric glow
        max_dist = width * 0.42
        fade_dist = width * 0.40
        
        for y in range(height):
            for x in range(width):
                dist = math.sqrt((x - cx)**2 + (y - cy)**2)
                r, g, b, a = data[x, y]
                
                # Also apply a mild luminance threshold for pure black deep space corners
                lum = 0.299*r + 0.587*g + 0.114*b
                
                if dist > max_dist:
                    data[x, y] = (r, g, b, 0)
                elif dist > fade_dist:
                    # Fade out at the edge of the circle
                    alpha_factor = 1.0 - ((dist - fade_dist) / (max_dist - fade_dist))
                    # If it's pure black, fade it faster
                    if lum < 20:
                        alpha_factor *= (lum / 20.0)
                    data[x, y] = (r, g, b, int(255 * alpha_factor))
                else:
                    # Inside the planet
                    if lum < 5:
                        # Very dark space inside the boundary (just in case)
                        pass

    img.save(filepath, 'PNG')
    print('Cleaned ' + filename)
