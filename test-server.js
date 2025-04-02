import fetch from 'node-fetch';

async function testServer() {
  try {
    const response = await fetch('http://localhost:3001/api/proxy/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://example.com'
      })
    });
    
    const data = await response.json();
    console.log('Server response:', data);
  } catch (error) {
    console.error('Error connecting to server:', error);
  }
}

testServer();
