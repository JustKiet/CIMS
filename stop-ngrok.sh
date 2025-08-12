#!/bin/bash

# Stop ngrok tunnels and clean up

echo "🛑 Stopping CIMS ngrok setup..."

# Stop ngrok process
if [ -f ".ngrok_pid" ]; then
    ngrok_pid=$(cat .ngrok_pid)
    if kill -0 $ngrok_pid 2>/dev/null; then
        kill $ngrok_pid
        echo "✅ Stopped ngrok session"
    fi
    rm -f .ngrok_pid
fi

# Legacy cleanup for old separate processes
if [ -f ".ngrok_backend_pid" ]; then
    backend_pid=$(cat .ngrok_backend_pid)
    if kill -0 $backend_pid 2>/dev/null; then
        kill $backend_pid
        echo "✅ Stopped backend ngrok tunnel"
    fi
    rm -f .ngrok_backend_pid
fi

if [ -f ".ngrok_frontend_pid" ]; then
    frontend_pid=$(cat .ngrok_frontend_pid)
    if kill -0 $frontend_pid 2>/dev/null; then
        kill $frontend_pid
        echo "✅ Stopped frontend ngrok tunnel"
    fi
    rm -f .ngrok_frontend_pid
fi

# Kill any remaining ngrok processes
pkill -f ngrok && echo "✅ Killed any remaining ngrok processes"

# Clean up URL files
rm -f .ngrok_*_url .env.local

# Stop docker containers
echo "Stopping docker containers..."
docker-compose --env-file .env.dev -f docker-compose.dev.yml down

# Clean up log files
rm -f ngrok_*.log

echo "✅ Cleanup complete!"
