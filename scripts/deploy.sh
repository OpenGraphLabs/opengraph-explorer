#!/bin/bash

# Move to the contract directory
cd ../contracts/tensorflowsui

# Build the contract
echo "Building contract..."
sui client switch --env devnet
sui move build

# Deploy the contract
echo "Deploying contract..."
DEPLOY_OUTPUT=$(sui client publish --gas-budget 300000000)

# Extract only the first package ID using grep, head, and sed
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep -o "PackageID: 0x[a-fA-F0-9]\{64\}" | head -n 1 | sed 's/PackageID: //')

if [ -z "$PACKAGE_ID" ]; then
    echo "Failed to extract package ID"
    exit 1
fi

echo "Extracted Package ID: $PACKAGE_ID"

# Get the existing private key from contract.json
PRIVATE_KEY=$(cat ../../config/contract.json | grep -o '"private_key": *"[^"]*"' | cut -d'"' -f4)

# Update the contract configuration while preserving the private key
echo "Updating contract configuration..."
cat > ../../config/contract.json << EOF
{
  "network": "devnet",
  "contract": {
    "package_id": "$PACKAGE_ID",
    "module_name": "model"
  },
  "account": {
    "private_key": "$PRIVATE_KEY"
  }
}
EOF

# Run extract_test_samples.py
echo "Extracting test samples..."
cd ../../scripts/data
python3 extract_test_samples.py

echo "Deployment completed successfully!"
echo "Contract configuration has been updated and test samples have been extracted." 