import * as dotenv from 'dotenv'
dotenv.config()

console.log('CWD =', process.cwd())
console.log('DATABASE_URL =', process.env.DATABASE_URL)