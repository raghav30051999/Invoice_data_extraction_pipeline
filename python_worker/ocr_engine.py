import sys
import pdfplumber
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter


def preprocess_for_telugu(image):

    # Convert to grayscale
    image = image.convert("L")

    # Resize image
    width, height = image.size
    image = image.resize((width * 2, height * 2))

    # Increase contrast
    image = ImageEnhance.Contrast(image).enhance(3)

    # Increase sharpness
    image = ImageEnhance.Sharpness(image).enhance(2)

    # Remove noise
    image = image.filter(ImageFilter.MedianFilter())

    # Thresholding
    image = image.point(lambda x: 0 if x < 140 else 255, '1')

    return image


def extract_with_ocr(pdf_path, dpi=450):

    all_text = []

    try:

        with pdfplumber.open(pdf_path) as pdf:

            total_pages = len(pdf.pages)

            for page_number, page in enumerate(pdf.pages, start=1):

                print(f"Processing Page {page_number}/{total_pages}...", file=sys.stderr)

                # Convert PDF page to image
                page_image = page.to_image(resolution=dpi)

                pil_image = page_image.original

                # Preprocess image
                processed_image = preprocess_for_telugu(pil_image)

                # OCR
                ocr_text = pytesseract.image_to_string(
                    processed_image,
                    lang='tel+eng',
                    config='--oem 3 --psm 4'
                )

                all_text.append(ocr_text)

        return "\n\n".join(all_text)

    except Exception as e:
        return f"ERROR: {str(e)}"


# MAIN — runs ONLY when executed directly (python ocr_engine.py file.pdf)
# NOT when imported by FastAPI (main.py)
if __name__ == "__main__":
    file_path = sys.argv[1]
    result = extract_with_ocr(file_path, dpi=450)
    print(result)