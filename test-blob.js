process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_BRZyXemiVTzUTUar_hynsbgmvQwxvEtWo4Q8q2tEsHmTTTb';
const { put } = require('@vercel/blob');

async function test() {
  try {
    const { url } = await put('test.txt', 'Hello World!', { access: 'public' });
    console.log('Uploaded to:', url);
    const res = await fetch(url);
    console.log('Fetch status:', res.status);
    console.log('Fetch text:', await res.text());
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
