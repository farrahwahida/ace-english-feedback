# Live Dashboard (100% Free)

The dashboard is deployed live on **GitHub Pages** at:

**https://farrahwahida.github.io/ace-english-feedback/**

## How it works

- **Frontend:** GitHub Pages serves `public/` (HTML/CSS/JS) for free.
- **Backend:** A Google Apps Script Web App (deployed from the user's Google account, "Execute as: Me", "Who has access: Anyone") reads/writes the Ace English Google Sheet and stores generated reports in a `FeedbackReports` tab.
- **Data flow:** The website calls the Web App with JSONP (`action=getData`, `action=saveReport`, `action=deleteReport`) because `script.google.com` does not allow cross-origin fetch.
- **Generation:** Reports are created in the browser by the built-in TP1–TP6 template engine (`public/tp-engine.js`), so no API key or server is needed. Report text and "Sent" status are saved back into the Google Sheet.

## Web App URL

```
https://script.google.com/macros/s/AKfycbwLTA-bzKVPFFof5X-mwMcX9Txt1HkpKW01Da3Dcveh6KTFqlTPblOl5Hl1wnpciAI0/exec
```

Apps Script source: `apps-script/Code.gs`. Script ID: `1INU8O4zoNHRwhTKfjlXsLd8L5DtDKZ0BG6tsou5CYWabC7BqttXoL7Qw`.

## Updating the live website

Push to `main`. The GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) redeploys automatically.

## Local development

`npm start` still runs the full local Node.js server with optional Gemini/OpenAI AI reports at `http://localhost:3456`. Add `?static=1` to test the GitHub Pages mode locally.
