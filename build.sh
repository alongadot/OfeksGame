#!/bin/bash

# Build script for Ofek's Game
# Creates a production build that needs to be served via HTTP

echo "🎮 Building Ofek's Game..."

# Build the project
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Game files are in the 'dist' directory"
    echo ""
    echo "⚠️  Note: Due to browser security (CORS), you cannot open index.html directly."
    echo "🌐 You need to serve the files via HTTP. Choose one of these options:"
    echo ""
    echo "Option 1 - Using Python (if installed):"
    echo "  cd dist && python3 -m http.server 8000"
    echo "  Then open: http://localhost:8000"
    echo ""
    echo "Option 2 - Using Node.js serve package:"
    echo "  npx serve dist"
    echo "  Then open the URL shown in the terminal"
    echo ""
    echo "Option 3 - Using PHP (if installed):"
    echo "  cd dist && php -S localhost:8000"
    echo "  Then open: http://localhost:8000"
    echo ""
    echo "🎮 After serving, enjoy playing Ofek's Game! 🌊"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
