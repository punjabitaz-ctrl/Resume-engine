# Start here: Resume Engine on your own computer

Thanks for testing. This takes about 20 minutes the first time. You need:

- A Windows or Mac computer with Chrome, Edge, Firefox or Safari
- Python 3 (free, step 1)
- Your own Anthropic API key with a little prepaid credit (step 3). This is what lets the app use Claude.

Everything you add stays on your computer. The only thing that leaves it is the text you ask the app to work on, which goes straight to Anthropic under your own key.

Read **TESTER-KIT.md** (in the `docs` folder) after this. It has the test script and the short form to fill in after each session.

## 1. Install Python (once)

**Windows**

1. Go to python.org, open Downloads and download the latest Python 3 for Windows.
2. Run the installer. On the first screen, tick **Add python.exe to PATH**, then choose **Install Now**.

**Mac**

1. Open Terminal and type `python3 --version`. If it prints a version number, you already have it.
2. If not, download the latest Python 3 for macOS from python.org and run the installer.

## 2. Start the app

1. Unzip the folder somewhere you will keep it, such as Documents. Do not run it from inside the zip.
2. Start it:
   - **Windows:** double-click `start-windows.bat`. If Windows shows "Windows protected your PC", choose **More info**, then **Run anyway**.
   - **Mac:** right-click `start-mac.command`, choose **Open**, then **Open** again. You only have to do this the first time. If your Mac only offers **Done** or **Move to Bin**, choose **Done**, open **System Settings**, then **Privacy & Security**, scroll down and choose **Open Anyway**.
   - **Either, if the start file will not run:** open Terminal (Mac) or Command Prompt (Windows), type `cd ` followed by a space, drag the app folder into the window, press Enter, then type `python3 serve.py` (Mac) or `py serve.py` (Windows) and press Enter.
3. A small window opens and your browser opens the app at `http://localhost:8000`. Keep the small window open while you use the app. Close it when you are done.

Three rules that keep your data safe:

- **Always start the app with the start file.** Your data is stored under the address `localhost:8000`. Double-clicking `index.html` opens a different, empty copy, and PDF upload does not work there.
- **Use the same browser every time.** Data in Chrome is not visible in Safari, and the other way round.
- **Use one tab.** Two tabs of the app at once can overwrite each other's changes.

## 3. Get your Claude API key

The app talks to Claude through Anthropic's API. A Claude.ai subscription (Pro) does not include API use, so you set up a separate pay-as-you-go account. You only pay for what you use.

1. Go to **platform.claude.com** and sign up or log in.
2. Add credit: open **Billing**, choose **Buy credits** and buy the smallest amount it offers. Leave **auto-reload** off. That way your prepaid credit is your spending limit, and the key can never spend more.
3. Create a key: open **API keys** (under Settings), choose **Create key**, name it `Resume Engine` and copy it. It is shown only once, so paste it somewhere safe for a minute. Menu names can move, so look around if a label is slightly different.

Treat the key like a password. Do not email it or paste it into a problem report.

## 4. Connect the app (Setup tab)

The first time you open the app, a guided tour starts by itself and points at each of these fields. You can follow it instead of this list, and bring it back any time with **Guided tour** at the top of the page.

1. Open the **Setup** tab.
2. Under **AI engine**, set **Provider** to **Anthropic**.
3. Paste your key into **API key**.
4. Choose **Load models**, then pick a model in the **Model** list. A mid-sized model (the Sonnet family) is a good balance of quality and cost. The largest models cost more.
5. Choose **Test connection**. You should see "Connected" and a short reply.
6. **Remember the key on this device:** on means you do not paste it again next time. Off means it is forgotten when the tab closes. Either is fine on your own computer.

## 5. Use it

The **Sources** tab opens with a **Start here** list of seven steps. Each step ticks itself when it is done. The test script in TESTER-KIT.md walks through the same steps in more detail.

## 6. Back up at the end of every session

Browsers can clear stored data on their own, for example when the disk is nearly full. A backup is your safety net.

1. Open **Setup**, under **Your data**.
2. Type a backup password twice and choose where it goes:
   - **Download locked backup** saves the file to this computer.
   - **Back up to Google Drive** or **Back up to OneDrive** (Chrome or Edge) saves it into the folder that the Google Drive for desktop app or OneDrive keeps in sync, and that app uploads it. The first time, choose that folder; after that it is one tap. The file is locked before it is written, so Google and Microsoft cannot read it.
3. Keep the password. A forgotten password cannot be recovered, and no backup opens without it.
4. To restore on another computer, choose the backup file under **Restore from backup**, from your Downloads or from your Google Drive or OneDrive folder.

The app shows a reminder until you have a backup, and again when changes are more than 20 minutes newer than your last one. To restore, use **Restore from backup** on the same tab.

## If something goes wrong

- **The app is empty but you had data:** check that you used the start file, the same browser and the address `localhost:8000`. If it is still empty, restore your last backup.
- **"Port 8000 is used by another program":** close other programs that run a local server, or restart the computer.
- **Windows says Python is not installed:** run the Python installer again and tick **Add python.exe to PATH**.
- **The AI step fails:** Setup shows what went wrong. Most often the credit has run out or the key was pasted with a missing character. Choose **Test connection** to check.
- **A step fails or the data looks wrong:** choose **Run health check** on Setup. It can repair what it finds, and every repair can be undone.
- **Anything else:** write down what you did and what you saw, and send it privately (see TESTER-KIT.md). The **Report a problem** box on Setup builds a report with the app version and error codes, but none of your resume content and no key. If you post it as a GitHub issue, it is public, so keep personal details out of it.
