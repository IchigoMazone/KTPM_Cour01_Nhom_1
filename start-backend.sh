#!/bin/bash
echo "Đang khởi động FastAPI Backend..."
cd "$(dirname "$0")/backend"
./venv/bin/python start.py
