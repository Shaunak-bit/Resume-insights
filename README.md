# AI-Powered Document Insight Tool

## Overview
This project is an AI-powered document insight tool that allows users to upload PDF documents (primarily resumes) and receive concise summaries or key insights. It maintains a historical record of uploaded documents and their analyses, providing a seamless user experience.  

The project integrates a **Python backend** with a **responsive frontend**, demonstrating skills in API development, PDF processing, AI integration, and data management.

---

## Features

- **Document Upload**: Upload PDF files through a user-friendly web interface.
- **AI-Powered Summarization**: Generates document summaries using [Sarvam AI](https://sarvam.ai/) for advanced insights.
- **Fallback Analysis**: Returns top 5 most frequent words from the document if AI service is unavailable.
- **History Tracking**: Maintains a historical record of uploaded documents and insights.
- **Dynamic Display**: Clearly displays AI-generated or fallback insights on the frontend.

---

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React.js (or your choice)
- **Database**: MongoDB 
- **AI Integration**: Sarvam AI API
- **PDF Processing**: PyMuPDF / pdfminer

---

## Architecture Overview

### Upload Page
<img width="949" height="460" alt="image" src="https://github.com/user-attachments/assets/4da7e618-03c2-43c9-a5fd-ea1803503d49" />
<img width="949" height="442" alt="image" src="https://github.com/user-attachments/assets/ba7b8718-1767-46db-9e3f-81cb4d366f0e" />
<img width="935" height="470" alt="image" src="https://github.com/user-attachments/assets/295280dc-bd01-4b54-80f4-3cbfb8ea7b55" />

### History Page
<img width="959" height="443" alt="image" src="https://github.com/user-attachments/assets/bd6ade8e-52dc-45ea-841a-f2b7076af52a" />
<img width="953" height="458" alt="image" src="https://github.com/user-attachments/assets/f06f12d6-59e1-46d7-95de-3d659e9d867d" />

User (Frontend)
|
v
[Upload PDF] --> [FastAPI Backend] --> [PDF Processing + AI]
|
v
[Insights / Fallback Analysis]
|
v
[History Storage] <--> [Database]


- **Backend** handles file uploads, processes PDFs, calls Sarvam AI for summaries, and stores insights.
- **Frontend** allows users to upload documents, view results, and browse history.
- **Database** persists uploaded PDFs and their corresponding insights.




