from io import BytesIO
from PIL import Image
import base64
import logging


logger = logging.getLogger("image service logger")


def handle_image(image: str, id: int) -> str:
    try:
        photo_file_path = 'images/%d.jpg' % id

        if "base64," in image[:50]:
            image = image.split("base64,")[-1]

        base64_to_jpg(image, photo_file_path)
        return photo_file_path

    except Exception as e:
        logger.error(e)
        raise ValueError    


def base64_to_jpg(base64_text, output_file, width=100, height=100):
    image_data = base64.b64decode(base64_text)
    image_bytes = BytesIO(image_data)
    image = Image.open(image_bytes)
    image = image.convert('RGB')
    image = image.resize((width, height))
    
    with open(output_file, 'w+') as photo_file:
        photo_file.close()

    image.save(output_file, format='JPG')
