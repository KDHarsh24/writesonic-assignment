/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },
}

module.exports = nextConfig
