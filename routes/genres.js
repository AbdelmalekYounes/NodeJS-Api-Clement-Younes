import express from 'express';
import db from '../database.js';
import generateEtag from '../generateEtag.js';

const router = express.Router();

//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- GET ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------
router.get('/', (req, res) => {

    // Récupérer la liste des genres depuis la table 'genres'

    const selectGenresQuery = 'SELECT * FROM genres';
    db.all(selectGenresQuery, (err, genres) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const etag=generateEtag(JSON.stringify(genres));
      res.json({genres, etag});
    });
  });
//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- POST ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------

router.post('/', (req, res) => {
    const { name } = req.body;
    const etag=generateEtag(`${name}`);
    

    // Vérifier si le genre existe déjà

    const checkGenreQuery = 'SELECT * FROM genres WHERE name = ?';
    db.get(checkGenreQuery, [name], (err, genreRow) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (genreRow) {
        return res.status(400).json({ error: 'Genre already exists' });
      }
  


      // Insérer le genre dans la table 'genres'

      const insertGenreQuery = 'INSERT INTO genres (name, etag) VALUES (?, ?)';
      db.run(insertGenreQuery, [name],etag, function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        const genreId = this.lastID;
        console.log(`Genre created: ${genreId}`);
  
        res.json({ success: true, message: 'Genre created', genreId });
      });
    });
  });

//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- DELETE ROUTES ------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------


router.delete('/:id', (req, res) => {
  const genreId = req.params.id;
  


  // Vérifier si le genre est utilisé dans un ou plusieurs films

  const checkFilmsQuery = 'SELECT COUNT(*) AS count FROM films WHERE genre_id = ?';
  db.get(checkFilmsQuery, [genreId], (err, filmsRow) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (filmsRow.count > 0) {
      return res.status(400).json({ error: 'Genre is used in one or more films' });
    }

   
    // Supprimer le genre de la table 'genres'

    const deleteGenreQuery = 'DELETE FROM genres WHERE id = ?';
    db.run(deleteGenreQuery, [genreId], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      console.log(`Genre deleted: ${genreId}`);

      res.json({ success: true, message: 'Genre deleted', genreId });
    });
  });
});




export default router;