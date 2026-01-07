// netlify/functions/update-llamados.js
// Función serverless para guardar llamados en llamados.json

const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const llamados = body.data;
    const filePath = path.join(__dirname, '../../data/llamados.json');
    fs.writeFileSync(filePath, JSON.stringify(llamados, null, 2), 'utf8');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
