const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('--- DIAGNOSTIC START ---');
console.log('CWD:', process.cwd());

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('.env file found.');
    const result = dotenv.config();
    if (result.error) {
        console.error('Error parsing .env:', result.error);
    } else {
        console.log('DATABASE_URL:', process.env.DATABASE_URL);
    }
} else {
    console.log('.env file NOT found at', envPath);
}

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
    console.log('schema.prisma found.');
    const content = fs.readFileSync(schemaPath, 'utf8');
    console.log('Schema Provider Line:', content.split('\n').find(l => l.includes('provider')));
} else {
    console.log('schema.prisma NOT found at', schemaPath);
}
console.log('--- DIAGNOSTIC END ---');
