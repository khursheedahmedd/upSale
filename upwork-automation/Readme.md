# Upwork Automation Backend

## Prerequisites

- **Python 3.11+** (Required for IBM watsonx packages)
- PostgreSQL database

## Setup Instructions

### 1. Install Python 3.11 (if not already installed)

```bash
# macOS (using Homebrew)
brew install python@3.11

# Ubuntu/Debian
sudo apt install python3.11 python3.11-venv

# Windows
# Download from https://www.python.org/downloads/
```

### 2. Create Virtual Environment with Python 3.11

```bash
# Create virtual environment
/usr/local/bin/python3.11 -m venv venv311

# Activate virtual environment
source venv311/bin/activate  # macOS/Linux
# OR
venv311\Scripts\activate  # Windows
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file with your IBM watsonx credentials:

```env
# IBM watsonx Configuration
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here  # OR use WATSONX_SPACE_ID
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/upwork_db
```

### 5. Run the Application

```bash
# Make sure virtual environment is activated
source venv311/bin/activate

# Run with Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Quick Start Script

```bash
# Use the activation script (includes version info)
source activate_venv.sh
```

## IBM watsonx Integration

This project uses IBM watsonx.ai for AI-powered features:

- **Job Matching Agent**: Analyzes job relevance using IBM Granite models
- **Proposal Generation**: Creates personalized proposals with watsonx.ai
- **Governance**: Tracks model usage and compliance

For detailed documentation, see:

- `IBM_WATSONX_HACKATHON_README.md`
- `HACKATHON_QUICK_START.md`
- `IBM_WATSONX_AUTH_GUIDE.md`
