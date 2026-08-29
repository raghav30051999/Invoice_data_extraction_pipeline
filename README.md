# 📄 AI-Driven Municipal Receipt Extraction Pipeline

> An automated, AI-powered document processing pipeline that extracts structured
> financial and entity data from municipal lease & rent receipts — featuring smart
> OCR fallback, Telugu language support, and Excel-ready output.

![Workflow Automation](https://img.shields.io/badge/n8n-Workflow_Automation-EA4B71?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI_Extraction-4285F4?style=flat-square)
![Tesseract](https://img.shields.io/badge/Tesseract-OCR_Engine-00C853?style=flat-square)

---

## 🌟 Overview

This project is an automated, AI-driven document processing pipeline designed to
extract structured financial and entity data from the Invoices.
Built on **n8n**, the workflow features a smart hybrid text extraction engine that
dynamically routes corrupted or scanned documents to a dedicated **Python-based OCR
microservice**, while natively processing clean files to optimize compute resources.

It leverages **Google Gemini AI** (can be replaced with any AI model) with deterministic prompting and strict schema
enforcement to accurately parse complex receipt layouts, including multi-receipt
splitting and processing. The system processes documents
in memory-efficient batches and outputs the extracted data into a highly optimized,
Excel-ready CSV format seamlessly appending new records
vertically to daily logs without disrupting existing headers.

---

## 🔄 Pipeline Architecture

```text
┌───────────────────┐
│  Manual Trigger   │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│  Read Invoices    │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│  Split Batches    │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Scanned /         │
│ Handwritten?      │
└──────────────┬───┘
 YES│           │NO
    ▼           ▼
┌───────┐  ┌──────────┐
│  OCR  │  │ Direct   │
│       │  │ Text     │
└───┬───┘  └────┬─────
    └──────────┘
          ▼
┌───────────────────┐
│ AI Agent Data     │
│ Extraction        │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Loop Whole Batch  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Aggregate Output  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Store CSV at      │
│ Desired Path      │
└───────────────────┘

```

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **n8n** | Workflow orchestration, batching, conditional routing |
| **Google Gemini** | Deterministic AI data extraction with structured output |
| **Python (FastAPI)** | OCR microservice for scanned / handwritten documents |
| **pdfplumber** | PDF parsing and high-resolution (450 DPI) page rendering |
| **pytesseract + Tesseract** | OCR engine for processing english text and also one of the regional language (Telugu) |
| **Pillow** | Image preprocessing (grayscale, contrast, sharpness, thresholding) |

---

## ✨ Key Features

- 🔀 **Hybrid Extraction Engine** – Direct text extraction with automatic OCR fallback
- 🧠 **Corrupted Text Detection** – The extracted data contains any character other than english or any other language, the code passes it to the OCR engine.
- 🤖 **Deterministic AI Extraction** – Strict "no-guessing" prompting with JSON schema enforcement
- 📄 **Multi-Receipt Splitting** – Automatically splits files containing multiple receipts
- 🌐 **English and Telugu Language Support** – UTF-8 BOM encoding for correct Excel rendering
- 🔢 **Excel-Safe Formatting** – Preserves leading zeros (shop numbers, asset codes)
- 📚 **Batch Processing** – Memory-efficient 5-document batches
- 📈 **Vertical CSV Append** – Headers written once; data appended to the last empty row

---


## 📁 Repository Structure

```
├── README.md
├── docker-compose.yml
├── workflow/
│   └── receipt_processing_pipeline.json  
├── python_worker/
│   ├── Dockerfile                         
│   ├── main.py                           
│   ├── ocr_engine.py                     
│   └── requirements.txt
└── code_nodes
│   ├── Corrupted_text_detector.js
│   ├── CSV_formatter.js
│   ├── Parse_OCR_response.js
│   ├── Use_direct_text.js
```

---

## ⚙️ Requirements

### Prerequisites
- **Docker & Docker Compose** (Recommended)
- **n8n** instance
- **Google Gemini API key/any other AI Model's API key**

### 🐳 Run with Docker (One-Command Setup)

1. Clone this repository.
2. Ensure Docker Desktop is running.
3. Run the following command in the project root:

```bash
docker compose up -d --build
```

This will automatically spin up both the **n8n** orchestration engine and the **Python OCR Worker** (complete with Tesseract and Telugu language packs).

### 🛠️ Manual Setup (Without Docker)

1. **System dependencies (Tesseract + language packs):**
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-tel
```

2. **Python dependencies:**
```bash
cd python-worker
pip install -r requirements.txt
```

3. **Start the worker:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📤 Sample Output

```csv
Column headers are derived directly from the parameters defined in the structured extraction schema.

Corresponding extracted values are appended vertically to the last empty row, preserving all previously stored records.

Output storage is configurable — either a dedicated file per execution or a single cumulative file updated on every run.
```

---

## 🔒 Privacy & Security Note

- No real personal or financial data is included in this repository.
- API keys are stored only in n8n credentials / environment variables — never in code.
- The exported workflow JSON contains no secrets.

---

## 📝 License

MIT License — free to use, modify, and distribute.

---