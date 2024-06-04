# import PyPDF2
import sys
pdf_path = sys.argv[1]
import PyPDF2
import re

def extract_account_number(pdf_path):
    # account_number = None

    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        first_page = reader.pages[0].extract_text()

        # Search for patterns to identify the account number
        # Adjust the pattern based on the format of the account number in the PDF
        print("firstpage__",first_page)
        # lines = first_page.split("\n")
        # account_number = None

     # Find company name
        company = None
        
        
        # account_number = None
        # pattern = r'Account\s+Number:\s*([\d\s-]+)'

    def extract_company_name(text):
        company_pattern = r"^(.+)\n"
        match = re.search(company_pattern, text)
        if match:
            company= match.group(1).strip()


    def extract_invoice_date(text):
        date_pattern = r"INVOICE DATE (\d{2}/\d{2}/\d{4})"
        match = re.search(date_pattern, text)
        if match:
            return match.group(1)

    def extract_total_amount(text):
        amount_pattern = r"T O T A L \$ ([\d,]+\.\d{2})"
        match = re.search(amount_pattern, text)
        if match:
            return match.group(1)
            

    return {
            'company': company,
            'invoice_date': invoice_date,
            'total_amount': total_amount
        }

# Provide the path to your PDF file
# pdf_path = "/path/to/your/pdf/file.pdf"

account_number = extract_account_number(pdf_path)
# print("Account Number:", account_number)
