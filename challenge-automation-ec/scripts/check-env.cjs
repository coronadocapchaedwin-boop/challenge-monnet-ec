const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { parse } = require('dotenv');

// Hashes públicos del challenge entregado. Nunca almacenar ni mostrar los secretos.
const expected = {
  qa: 'b1f6f75ee234cf15ac2683c12e331d87cc1122aa8530605851eb27d968feef1d',
  cert: 'e4a50c349060415034d16b4a8ea578f0e7e4f4f4894d9781f4c7a517dc88332b',
};

for (const [environment, hash] of Object.entries(expected)) {
  const file = path.resolve(__dirname, '..', `.env.${environment}`);
  const values = existsSync(file) ? parse(readFileSync(file)) : {};
  const secret = process.env.SECRET_KEY ?? values.SECRET_KEY;
  const matches = Boolean(secret) && createHash('sha256').update(secret).digest('hex') === hash;
  console.log(`${environment.toUpperCase()}: ${matches ? 'matches challenge' : 'missing or different from challenge'}`);
  if (!matches) process.exitCode = 1;
}
