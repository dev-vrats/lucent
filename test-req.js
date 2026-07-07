const req = new Request('http://localhost', { method: 'POST', body: '{"a": 1}' });
async function test() {
  await req.json(); // consumes body
  try {
    const p = req.json(); // does it throw here?
    console.log("Returned promise", p);
    await p.catch(e => console.log("Caught in promise:", e.message));
  } catch (e) {
    console.log("Caught synchronously:", e.message);
  }
}
test();
