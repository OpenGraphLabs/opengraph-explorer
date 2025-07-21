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

# Update the contract configuration
echo "Updating contract configuration..."
cat > ../../config/contract.json << EOF
{
  "network": "devnet",
  "contract": {
    "package_id": "$PACKAGE_ID",
    "module_name": "model"
  }
}
EOF

echo "Deployment completed successfully!"
echo "Contract configuration has been updated." 