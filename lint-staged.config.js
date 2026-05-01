module.exports = {
  '*.{ts,tsx,html}': ['eslint --fix', 'prettier --write'],
  '*.{js,json,md,css,scss}': 'prettier --write',
  '*.ts': () => 'npx tsc --noEmit',
};
