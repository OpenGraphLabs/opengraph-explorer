#!/bin/bash

# Configuration
TO_ADDRESS="0xf1d044cc7a005d086cfc7105596154c8b60734b532eaf35efbd8bc82a3af8edc"
FAUCET_COUNT=121  # Total number of faucets (1 for gas + 20 to transfer)
GAS_BUDGET=1000000000 # 2 SUI

# Function to get latest coin ID
get_latest_coin() {
    sui client gas | grep -o "0x[a-fA-F0-9]\{64\}" | tail -n 1
}

# Function to wait for new coin
wait_for_coin() {
    local max_attempts=20
    local attempt=1
    local prev_coins="$1"
    
    while [ $attempt -le $max_attempts ]; do
        echo "Waiting for new coin (attempt $attempt/$max_attempts)..." >&2
        sleep 3
        
        local current_coins=$(sui client gas | grep -o "0x[a-fA-F0-9]\{64\}")
        local new_coin=""
        
        # Find coin that wasn't in previous list
        while read -r coin; do
            if ! echo "$prev_coins" | grep -q "$coin"; then
                new_coin="$coin"
                break
            fi
        done <<< "$current_coins"
        
        if [ ! -z "$new_coin" ]; then
            echo "Found new coin: $new_coin" >&2
            echo "$new_coin"
            return 0
        fi
        
        ((attempt++))
    done
    
    return 1
}

# Function to transfer coin
transfer_coin() {
    local coin_id=$1
    echo "Transferring coin $coin_id to $TO_ADDRESS..."
    
    if ! sui client transfer-sui \
        --amount 9000000000 \
        --gas-budget $GAS_BUDGET \
        --sui-coin-object-id "$coin_id" \
        --to "$TO_ADDRESS"; then
        echo "Transfer failed"
        return 1
    fi
    
    echo "Transfer successful"
    return 0
}

echo "Starting Faucet and Transfer script..."
echo "Target Address: $TO_ADDRESS"
echo "Total Faucet Count: $FAUCET_COUNT (1 for gas + $((FAUCET_COUNT-1)) to transfer)"
echo "Gas Budget: $GAS_BUDGET MIST"
echo "-------------------"

# Get initial coin list
initial_coins=$(sui client gas | grep -o "0x[a-fA-F0-9]\{64\}")
echo "Initial coins:"
echo "$initial_coins"
echo "-------------------"

# Get first faucet for gas
echo "Requesting initial gas faucet..."
if ! sui client faucet; then
    echo "Initial gas faucet request failed!"
    exit 1
fi

# Wait for gas faucet
echo "Waiting for gas faucet..."
if ! wait_for_coin "$initial_coins" > /dev/null; then
    echo "Failed to detect gas faucet"
    exit 1
fi

echo "Gas faucet received successfully"
echo "-------------------"

# Process remaining faucets
success_count=0
for ((i=2; i<=FAUCET_COUNT; i++)); do
    echo "Processing faucet $i/$FAUCET_COUNT"
    
    # Get current coin list before faucet
    current_coins=$(sui client gas | grep -o "0x[a-fA-F0-9]\{64\}")
    
    # Request faucet
    echo "Requesting faucet..."
    if ! sui client faucet; then
        echo "Faucet request failed!"
        continue
    fi
    
    # Wait for new coin
    echo "Waiting for coin to arrive..."
    new_coin=$(wait_for_coin "$current_coins")
    if [ -z "$new_coin" ]; then
        echo "Failed to detect new coin"
        continue
    fi
    
    # Transfer the coin
    echo "Attempting to transfer coin $new_coin..."
    if transfer_coin "$new_coin"; then
        ((success_count++))
    fi
    
    echo "-------------------"
    sleep 2
done

echo "Operations completed!"
echo "Successfully transferred: $success_count/$((FAUCET_COUNT-1)) coins" 