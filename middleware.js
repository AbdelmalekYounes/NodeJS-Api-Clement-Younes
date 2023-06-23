// middleware.js
// const key='8f94826adab8ffebbeadb4f9e161b2dc';
import api_key from './config.js';
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['api-key'];
  
    // Vérification de la présence de la clé API
    if (!apiKey) {
      return res.status(401).json({ error: 'Api Key missing.' });
    }
  
    // Vérification de la validité de la clé API
    if (apiKey !== api_key) {
      return res.status(403).json({ error: 'Invalid Api Key.' });
    }
  
    // Clé API valide, poursuivre vers la prochaine étape de la requête
    next();
  };
  
  export { apiKeyMiddleware };