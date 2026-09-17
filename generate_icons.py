import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color = '#0f172a')
    d = ImageDraw.Draw(img)
    
    # Draw simple design (blue square in middle)
    margin = size // 6
    d.rectangle([margin, margin, size - margin, size - margin], fill='#38bdf8')
    
    img.save(filename)

os.makedirs('/home/ki/.gemini/antigravity/scratch/carintel-inspector/icons', exist_ok=True)
create_icon(16, '/home/ki/.gemini/antigravity/scratch/carintel-inspector/icons/icon16.png')
create_icon(48, '/home/ki/.gemini/antigravity/scratch/carintel-inspector/icons/icon48.png')
create_icon(128, '/home/ki/.gemini/antigravity/scratch/carintel-inspector/icons/icon128.png')

print("Icons generated successfully.")
