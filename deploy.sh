#!/bin/bash
set -e

SERVER="nishant@38.242.136.167"
SSH_KEY="$HOME/.ssh/zosouq"
REMOTE_DIR="/home/zosouq/htdocs/www.zosouq.com"

echo ">>> Pulling latest code..."
git pull

echo ">>> Building frontend..."
cd frontend && npm run build && cd ..

echo ">>> Syncing frontend..."
rsync -avz \
  --exclude='__pycache__' --exclude='*.pyc' --exclude='venv' --exclude='.env' \
  -e "ssh -i $SSH_KEY" \
  frontend/dist/ "$SERVER:$REMOTE_DIR/"

echo ">>> Syncing backend..."
rsync -avz \
  --exclude='__pycache__' --exclude='*.pyc' --exclude='venv' --exclude='.env' \
  -e "ssh -i $SSH_KEY" \
  backend/ "$SERVER:$REMOTE_DIR/backend/"

echo ">>> Syncing server.js..."
rsync -avz -e "ssh -i $SSH_KEY" server.js "$SERVER:$REMOTE_DIR/server.js"

echo ">>> Restarting services..."
ssh -i "$SSH_KEY" "$SERVER" "pm2 restart zosouq-api zosouq-web && pm2 list"

echo ">>> Done! Site is live."
