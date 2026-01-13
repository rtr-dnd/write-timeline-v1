export default function (req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Vercel-Buffering', 'no');
  res.setHeader('Transfer-Encoding', 'chunked');

  res.write('Streaming started...\n');

  let count = 0;
  const interval = setInterval(() => {
    res.write(`Chunk ${count++}: ${new Date().toLocaleTimeString()}\n`);
    if (count >= 10) {
      clearInterval(interval);
      res.end('Streaming finished.\n');
    }
  }, 1000);

  // Handle client disconnection
  req.on('close', () => {
    clearInterval(interval);
  });
}
