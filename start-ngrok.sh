#!/bin/bash

# CIMS External Access via ngrok

echo "🌐 CIMS - External Access Setup"
echo "==============================="

# Kill any existing ngrok processes
echo "Stopping any existing ngrok processes..."
pkill -f ngrok || true
sleep 2

# Clean up old files
rm -f .ngrok_* ngrok_*.log

# Start backend and database
echo "Starting backend and database..."
docker-compose --env-file .env.dev -f docker-compose.dev.yml up -d postgres backend

# Wait for backend
echo "Waiting for backend to be ready..."
sleep 15

# Test backend
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend not responding. Check logs:"
    docker-compose --env-file .env.dev -f docker-compose.dev.yml logs backend
    exit 1
fi

echo "✅ Backend is running on http://localhost:8000"

# Start ngrok with multiple tunnels using config file
echo "Starting ngrok with multiple tunnels..."
ngrok start --config=ngrok.yml --all --log=stdout > ngrok_combined.log 2>&1 &
NGROK_PID=$!
echo $NGROK_PID > .ngrok_pid

# Wait for ngrok to start
echo "Waiting for ngrok tunnels to establish..."
sleep 8

# Function to get tunnel URL by name
get_tunnel_url() {
    local tunnel_name=$1
    local url=""
    
    for i in {1..15}; do
        # Get tunnels and extract URL for specific tunnel name
        url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | \
              grep -A 10 "\"name\":\"$tunnel_name\"" | \
              grep -o 'https://[^"]*\.ngrok-free\.app' | \
              head -1)
        
        if [ -n "$url" ]; then
            echo "$url"
            return 0
        fi
        sleep 1
    done
    
    return 1
}

# Get backend URL
BACKEND_URL=$(get_tunnel_url "backend")
if [ -z "$BACKEND_URL" ]; then
    echo "❌ Failed to get backend tunnel URL"
    echo "ngrok logs:"
    tail -20 ngrok_combined.log
    exit 1
fi

echo "✅ Backend tunnel: $BACKEND_URL"
echo $BACKEND_URL > .ngrok_backend_url

# Update frontend environment
echo "Updating frontend to use ngrok backend..."
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > .env.local

# Start frontend with ngrok backend URL
echo "Starting frontend..."
NEXT_PUBLIC_API_URL=$BACKEND_URL docker-compose --env-file .env.dev -f docker-compose.dev.yml up -d frontend

# Wait for frontend
sleep 10

# Test frontend
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Frontend might still be starting up..."
fi

# Get frontend URL
FRONTEND_URL=$(get_tunnel_url "frontend")
if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Failed to get frontend tunnel URL"
    echo "Available tunnels:"
    curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app' || echo "No tunnels found"
    exit 1
fi

echo "✅ Frontend tunnel: $FRONTEND_URL"
echo $FRONTEND_URL > .ngrok_frontend_url

echo ""
echo "🎉 External access ready!"
echo "========================="
echo ""
echo "📱 Share this URL with others:"
echo "   $FRONTEND_URL"
echo ""
echo "🔧 Technical URLs:"
echo "   Frontend:  $FRONTEND_URL"
echo "   Backend:   $BACKEND_URL"
echo "   API Docs:  $BACKEND_URL/docs"
echo ""
echo "💡 Tell external users:"
echo "   1. Click 'Visit Site' on the ngrok warning page"
echo "   2. If login issues occur, try incognito mode"
echo "   3. Clear browser cache if needed (Ctrl+Shift+R)"
echo ""
echo "📊 Monitor traffic: http://localhost:4040"
echo "🛑 Stop everything: ./stop-ngrok.sh"
echo ""
echo "✨ Ready for external access! Share the frontend URL above."
