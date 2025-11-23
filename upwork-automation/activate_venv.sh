#!/bin/bash
# Activate Python 3.11 virtual environment
source venv311/bin/activate
echo "✅ Python 3.11 virtual environment activated!"
echo "Python version: $(python --version)"
echo "IBM watsonx.ai version: $(python -c 'import ibm_watsonx_ai; print(ibm_watsonx_ai.__version__)')"

