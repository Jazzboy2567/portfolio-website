// Test script to verify Node.js setup
console.log('🔍 Testing Node.js Setup...\n');

// Test 1: Node.js version
console.log('✅ Node.js version:', process.version);

// Test 2: Check if dotenv can load
try {
    require('dotenv').config();
    console.log('✅ dotenv loaded successfully');
} catch (error) {
    console.log('❌ dotenv failed to load:', error.message);
}

// Test 3: Check environment variables
console.log('\n📧 Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
console.log('PORT:', process.env.PORT || '3000 (default)');

// Test 4: Check if dependencies are installed
console.log('\n📦 Dependencies:');
const dependencies = ['express', 'nodemailer', 'cors', 'helmet', 'dotenv'];
dependencies.forEach(dep => {
    try {
        require(dep);
        console.log(`✅ ${dep}: installed`);
    } catch (error) {
        console.log(`❌ ${dep}: not installed`);
    }
});

console.log('\n🎉 Setup test complete!');
console.log('\nNext steps:');
console.log('1. If any dependencies are missing, run: npm install');
console.log('2. If .env variables are missing, create .env file');
console.log('3. Start server with: npm start');
