// netlify/functions/update-llamados.js
// Función serverless para guardar llamados en llamados.json


const fetch = require('node-fetch');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'FABIOR1981/llamadosControl'; // Cambia por tu repo si es diferente
const FILE_PATH = 'data/llamados.json'; // Ruta relativa en el repo
const BRANCH = 'main'; // Cambia si usas otra rama

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const nuevosDatos = JSON.stringify(body.data, null, 2);

    // 1. Obtener el SHA actual del archivo
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const getResp = await fetch(getUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const getData = await getResp.json();
    const sha = getData.sha;

    // 2. Actualizar el archivo
    const updateUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const updateResp = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Actualización de llamados.json desde Netlify',
        content: Buffer.from(nuevosDatos).toString('base64'),
        sha,
        branch: BRANCH
      })
    });

    if (!updateResp.ok) {
      const error = await updateResp.text();
      return { statusCode: updateResp.status, body: error };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
