import os
import sys
from bs4 import BeautifulSoup
import requests

# הגדר את הבסיס של האתר כאילו מריצים אותו מתוך root
BASE_PATH = "index.html"
BASE_URL = "http://localhost/"  # נשתמש בנתיב מקומי

# תייק את כל הלינקים בתוך הקובץ
def extract_links_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    links = []
    buttons = soup.select('button[onclick^="openLinkWithConfetti"]')
    for button in buttons:
        onclick = button.get('onclick')
        if onclick:
            # דוגמה: openLinkWithConfetti('ClassA/core-1.html')
            link = onclick.split("openLinkWithConfetti('")[1].split("')")[0]
            links.append(link)
    return links

# בדיקת סטטוס של כל לינק
def check_links(links):
    all_ok = True
    for link in links:
        print(f"🔍 בודק את הקובץ: {link}")
        if not os.path.exists(link):
            print(f"❌ הקובץ לא קיים: {link}")
            all_ok = False
        else:
            print(f"✅ הקובץ תקין: {link}")
    return all_ok

if __name__ == "__main__":
    links = extract_links_from_html(BASE_PATH)
    print(f"\n📄 נמצאו {len(links)} קישורים לבדיקה.\n")
    if not links:
        print("⚠️ לא נמצאו קישורים לבדיקה.")
        sys.exit(1)

    success = check_links(links)
    if not success:
        print("\n🚫 ישנם קישורים שבורים. נא לתקן אותם.")
        sys.exit(1)
    else:
        print("\n🎉 כל הקישורים תקינים!")
