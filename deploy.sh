#!/bin/bash

# Build the project
npm run build

# Create a test directory structure
mkdir -p test-server/games/stargame

# Copy build files to test directory
cp -r build/* test-server/games/stargame/

# Print instructions
echo ""
echo "Deployment files prepared in test-server/games/stargame/"
echo ""
echo "To test locally, you can run:"
echo "npx serve test-server"
echo ""
echo "Then open http://localhost:3000/games/stargame in your browser"
echo ""
echo "For actual deployment, upload the contents of the build folder to your server's /games/stargame/ directory" 