# import PyPDF2
import sys
pdf_path = sys.argv[1]
import PyPDF2
import re

def extract_account_number(pdf_path):
    account_number = None

    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        first_page = reader.pages[0].extract_text()

        # Search for patterns to identify the account number
        # Adjust the pattern based on the format of the account number in the PDF
        # print(first_page)
        # lines = first_page.split("\n")
        account_number = None


        # account_number = None
        pattern = r'Account\s+Number:\s*([\d\s-]+)'

        match = re.search(pattern, first_page)
        if match:
            account_number = match.group(1).strip()
        return account_number

# Provide the path to your PDF file
# pdf_path = "/path/to/your/pdf/file.pdf"

account_number = extract_account_number(pdf_path)
print("Account Number:", account_number)
