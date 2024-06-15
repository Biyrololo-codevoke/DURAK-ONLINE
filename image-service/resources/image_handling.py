from io import BytesIO
from PIL import Image
import base64


def handle_image(image: str, id: int) -> str:
    try:
        base64_to_jpg(image, '/images/%d.jpg' % id)
        return '/images/%d.jpg' % id
    
    except Exception:
        raise ValueError    


def base64_to_jpg(base64_text, output_file, width=100, height=100):
    image_data = base64.b64decode(base64_text)

    image_bytes = BytesIO(image_data)

    image = Image.open(image_bytes)

    image = image.resize((width, height))

    image.save(output_file, format='JPEG')