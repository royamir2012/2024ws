#!/bin/bash

# Exit on any error
set -e

echo "Running pre-deployment checks..."

# Install test dependencies
pip install packaging

# Run the dependency tests
python -m unittest tests/test_dependencies.py -v

# If we get here, all tests passed
echo "✅ All pre-deployment checks passed!"
