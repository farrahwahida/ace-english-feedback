# Ace English — Parent Feedback Studio

Automated post-class parent feedback report generator synced with your Google Sheet (`Ace English Tutor Log (Responses)`) and aligned with Malaysian MOE PBD **Tahap Penguasaan (TP1–TP6)**.

## Features

- **Live Google Sheet Sync**: Pulls rows directly from your Google Sheet (`Timestamp`, `Student Name`, `Year/Form`, `Topic`, `Skill Focus Today`, `Strengths & Gaps`, `Homework`, `Report Language`, `TP`).
- **Quick Class Entry**: Enter bullet points right after class to generate a report immediately without opening the spreadsheet.
- **TP1–TP6 Pedagogical Engine**: Tailors class observations, next steps, and practical home support tips to the student's TP level in **English**, **Bahasa Melayu**, or **Bilingual (EN + BM)**.
- **AI + Free Fallback**: Supports **Google Gemini** or **OpenAI-compatible** APIs (configured via Settings or `.env`), with automatic fallback to the built-in zero-cost TP1–TP6 Template Engine.
- **WhatsApp-Ready Preview & Actions**: Renders authentic `*bold*` and `_italic_` formatting in a WhatsApp chat bubble, with 1-click **Copy for WhatsApp**, **Open in WhatsApp**, **Manual Edit**, and **Sent ✓** tracking.

## Quick Start

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser at:
   `http://localhost:3456`
3. (Optional) Click **Settings** in the top bar to add a Gemini or OpenAI API key, set your Tutor signature, or enable **Auto-generate on sync**.

## Run Tests

```bash
npm test
```
