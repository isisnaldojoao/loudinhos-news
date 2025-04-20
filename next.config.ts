module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    images: {
      allowFutureImage: true
    }
  }
}