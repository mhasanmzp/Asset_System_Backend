import io
import pytesseract
from pdf2image import convert_from_path
import os
from pdf2image import convert_from_path
from PIL import Image
import cv2
import numpy as np
import sys
pdf_path = sys.argv[1]
def extract_text_from_pdf(pdf_path):
    # Convert PDF to images
    pages = convert_from_path(pdf_path, 500)
    print('pages:', pages)
    
    # Extract text from the first page only using Tesseract OCR
    first_page = pages[0]
    
    # Convert the image to grayscale
    first_page = first_page.convert('L')
    
    # Apply line removal preprocessing
    cleaned_image = remove_lines(first_page)
    
    # Perform OCR on the cleaned image
    text = pytesseract.image_to_string(cleaned_image)
    
    return text.strip()


import cv2
import numpy as np
from PIL import Image

def remove_lines(image):
    # Convert the image to grayscale if it's not already
    if image.mode != 'L':
        image = image.convert('L')

    # Convert the grayscale image to a NumPy array
    image_np = np.array(image)

    # Apply line removal preprocessing
    _, thresh = cv2.threshold(image_np, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Remove horizontal lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (image_np.shape[1] // 10, 1))
    horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
    cleaned = cv2.subtract(thresh, horizontal_lines)

    # Remove vertical lines
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, image_np.shape[0] // 10))
    vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel, iterations=2)
    cleaned = cv2.subtract(cleaned, vertical_lines)

 # Remove small horizontal lines
    small_horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, image_np.shape[0] // 100))
    small_horizontal_lines = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, small_horizontal_kernel, iterations=2)
    cleaned = cv2.subtract(cleaned, small_horizontal_lines)

    # Remove small vertical lines
    small_vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (image_np.shape[1] // 100, 1))
    small_vertical_lines = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, small_vertical_kernel, iterations=2)
    cleaned = cv2.subtract(cleaned, small_vertical_lines)

    # Invert the image
    cleaned = cv2.bitwise_not(cleaned)

    # Convert the cleaned image back to PIL format
    cleaned_image = Image.fromarray(cleaned)

    return cleaned_image


file_path = os.path.basename('newdata.pdf')
print('File name:', file_path)

text = extract_text_from_pdf(pdf_path)

print(text)

# Usage

