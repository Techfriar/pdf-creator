# PDF Generation Microservice

This microservice handles PDF generation using Puppeteer. It provides a REST API for generating PDFs from HTML content with a professional, modular architecture.

## Features

- Proper microservice architecture with separation of concerns
- Environment-based configuration using dotenv
- Structured logging system
- Error handling middleware
- API versioning with backward compatibility
- Health check endpoints
- Graceful shutdown handling

## Project Structure

```
pdf-service/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.js        # Application entry point
├── .env.example        # Example environment variables
├── .env                # Environment variables (not in version control)
├── package.json        # Project dependencies and scripts
└── README.md          # Project documentation
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# PDF Service Configuration
PDF_OUTPUT_DIR=public/pdfs
PDF_ASSESSMENT_DIR=public/assessments

# Logging Configuration
LOG_LEVEL=debug
```

## Running the Service

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Linting:

```bash
npm run lint
```

## API Endpoints

### Generate PDF

- **URL**: `/api/pdf/generate`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "html": "<html>...</html>"
  }
  ```
  
  Alternatively, you can provide HTML content as an object with separate header, body, and footer sections:
  ```json
  {
    "html": {
      "header": "<div style='text-align: center;'>My Header</div>",
      "body": "<div>Main content goes here</div>",
      "footer": "<div style='text-align: center;'>Page <span class='pageNumber'></span> of <span class='totalPages'></span></div>"
    }
  }
  ```
  
  Notes:
  - The `body` property is required when using the object format
  - `header` and `footer` are optional
  - When a custom header is provided, a top margin of 50px is automatically added
  - You can use Puppeteer's special classes like `pageNumber` and `totalPages` in your footer
  - PDF files are automatically named with timestamps (e.g., `Assessment_2025-05-14T06-22-38-226Z.pdf`)
- **Response**:
  ```json
  {
    "status": true,
    "pdfPath": "/path/to/generated/pdf",
    "message": "PDF generated successfully"
  }
  ```

### Health Check

- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "pdf-service",
    "timestamp": "2025-05-14T06:22:38.226Z",
    "pdfTest": {
      "generated": true,
      "path": "/path/to/generated/pdf",
      "exists": true
    }
  }
  ```
  
  Note: The health check endpoint now tests PDF generation functionality and verifies that the generated file exists.

## Integration with Main Application

To use this service from your main application, you'll need to:

1. Make HTTP requests to the PDF service endpoint
2. Handle the response which contains the path to the generated PDF
3. Update your main application's code to use this service

Example integration code:

```javascript
const axios = require("axios");

async function generatePdf(htmlContent) {
  try {
    const response = await axios.post("http://localhost:3001/api/pdf/generate", {
      html: htmlContent
    });
    return response.data;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
```
