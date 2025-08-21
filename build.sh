
#!/bin/bash

echo "Building React frontend..."
npm run build

echo "Moving to FastAPI backend directory..."
cd Backend-Narrisia

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Starting FastAPI server..."
python main.py
