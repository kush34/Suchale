#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Generating env..."
node scripts/generate-env.js

echo "Starting Docker..."
docker compose up -d

echo "Waiting a few seconds..."
sleep 5

echo "Running backend..."
npm run dev