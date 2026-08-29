const localtunnel = require('localtunnel');
(async () => {
  const tunnel = await localtunnel({ port: 8080 });
  const url = tunnel.url;
  require('fs').writeFileSync('tunnel_url.txt', url + '\n');
  console.log('TUNNEL URL:', url);
  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
