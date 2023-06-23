import express from 'express';
import bodyParser from 'body-parser';
import { apiKeyMiddleware } from './middleware.js';

import actorRoutes from './routes/actors.js';
import filmRoutes from './routes/films.js';
import genreRoutes from './routes/genres.js';


const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(apiKeyMiddleware);

app.use('/api/actor', actorRoutes);
app.use('/api/genre', genreRoutes);
app.use('/api/film', filmRoutes);

app.listen(PORT, () => console.log(`[Server running on port: http://localhost:${PORT}]`));