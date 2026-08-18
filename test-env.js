const key = process.env.GOOGLE_PAGESPEED_API_KEY;
console.log('API Key exists:', !!key);
console.log('API Key length:', key ? key.length : 0);
console.log('First 10 chars:', key ? key.substring(0, 10) : 'none');
