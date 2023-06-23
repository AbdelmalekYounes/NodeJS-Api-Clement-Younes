import express from 'express';
import db from '../database.js';
import generateEtag from '../generateEtag.js';

const router = express.Router();

//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- GET ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------

router.get('/', (req, res) => {
    const query = `
      SELECT f.id, f.name, f.synopsis, f.release_year, g.name AS genre, 
             GROUP_CONCAT(a.first_name || ' ' || a.last_name) AS actors
      FROM films f
      INNER JOIN genres g ON f.genre_id = g.id
      LEFT JOIN films_actors fa ON f.id = fa.film_id
      LEFT JOIN actors a ON fa.actor_id = a.id
      GROUP BY f.id
    `;
  
    db.all(query, [], (err, films) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const etag=generateEtag(JSON.stringify(films));
      res.status(200).json({films, etag});
    });
  });



  router.get('/:id', (req, res) => {
    const filmId = req.params.id;
  
    const query = `
      SELECT f.id, f.name, f.synopsis, f.release_year, g.name AS genre, 
             GROUP_CONCAT(a.first_name || ' ' || a.last_name) AS actors
      FROM films f
      INNER JOIN genres g ON f.genre_id = g.id
      LEFT JOIN films_actors fa ON f.id = fa.film_id
      LEFT JOIN actors a ON fa.actor_id = a.id
      WHERE f.id = ?
      GROUP BY f.id
    `;
  
    db.get(query, [filmId], (err, film) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (!row) {
        return res.status(404).json({ error: 'Film not found' });
      }
      const etag=generateEtag(JSON.stringify(film));
      res.status(200).json({actor,etag});
    });
  });

//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- POST ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------

router.post('/', (req, res) => {
    const { name, synopsis, release_year, genre_id, actor_ids } = req.body;
    const etag=generateEtag(`${name}${synopsis}${release_year}${genre_id}`);
  


    // ------------------------------------ Vérifier si le genre existe ------------------------------------

    const checkGenreQuery = 'SELECT COUNT(*) AS count FROM genres WHERE id = ?';
    db.get(checkGenreQuery, [genre_id], (err, genreRow) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (genreRow.count === 0) {
        return res.status(400).json({ error: 'Invalid genre_id' });
      }
  




      // --------------------------------------------- Vérifier si les acteurs existent ---------------------------------------

      const placeholders = actor_ids.map(() => '?').join(',');
      const checkActorsQuery = `SELECT COUNT(*) AS count FROM actors WHERE id IN (${placeholders})`;
      db.get(checkActorsQuery, actor_ids, (err, actorsRow) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        if (actorsRow.count !== actor_ids.length) {
          return res.status(400).json({ error: 'Invalid actor_ids' });
        }
  




        // ------------------------------ Insérer le film dans la table films -------------------------------------------------

        const insertFilmQuery = 'INSERT INTO films (name, synopsis, release_year, genre_id, etag) VALUES (?, ?, ?, ?, ?)';
        const filmParams = [name, synopsis, release_year, genre_id, etag];
        db.run(insertFilmQuery, filmParams, function (err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          const filmId = this.lastID;
          console.log(`[New film added with ID: ${filmId}]`);
  





          // --------------------------------- Insérer les associations entre le film et les acteurs dans la table films_actors ---------------

          const insertAssociationsQuery = 'INSERT INTO films_actors (film_id, actor_id) VALUES (?, ?)';
          const insertPromises = actor_ids.map((actorId) => {
            const associationsParams = [filmId, actorId];
            return new Promise((resolve, reject) => {
              db.run(insertAssociationsQuery, associationsParams, function (err) {
                if (err) {
                  console.error(err.message);
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          });
  
          Promise.all(insertPromises)
            .then(() => {
              res.status(200).json({ success: true, message: 'Film created', filmId });
            })
            .catch((error) => {
              res.status(500).json({ error: 'Internal Server Error' });
            });
        });
      });
    });
  });



//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- PUT ROUTES ------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------

router.put('/:id', (req, res) => {
    const filmId = req.params.id;
    const { name, synopsis, release_year, genre_id, actor_ids } = req.body;
    const ifMatch=req.headers['if-match'];

  // Récupération de l'ETag dans la BDD

  const getEtagQuery='SELECT etag FROM films WHERE id = ?';
  db.get(getEtagQuery,[filmId],(err,row)=>{
    if(err){
      console.error(err.message);
      return res.status(500).json({error: 'Internal Server Error'});
    }
    
  });

  const currentEtag = row.etag;

  if (currentEtag !== ifMatch){
    return res.status(412).json({error:'Predondition Failed'});
  }

    // -------------------------------------------------- Vérifier si le film existe ------------------------------------------

    const checkFilmQuery = 'SELECT COUNT(*) AS count FROM films WHERE id = ?';
    db.get(checkFilmQuery, [filmId], (err, filmRow) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (filmRow.count === 0) {
        return res.status(404).json({ error: 'Film not found' });
      }
  



      // -------------------------------------------- Vérifier si le genre existe -----------------------------------------------

      const checkGenreQuery = 'SELECT COUNT(*) AS count FROM genres WHERE id = ?';
      db.get(checkGenreQuery, [genre_id], (err, genreRow) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        if (genreRow.count === 0) {
          return res.status(400).json({ error: 'Invalid genre_id' });
        }
  



        // ------------------------------------ Vérifier si les acteurs existent ---------------------------------------------------

        const placeholders = actor_ids.map(() => '?').join(',');
      const checkActorsQuery = `SELECT COUNT(*) AS count FROM actors WHERE id IN (${placeholders})`;
      db.get(checkActorsQuery, actor_ids, (err, actorsRow) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        if (actorsRow.count !== actor_ids.length) {
          return res.status(400).json({ error: 'Invalid actor_ids' });
        }



          // ---------------------------- Supprimer les anciennes associations entre le film et les acteurs ------------------------

          const deleteAssociationsQuery = 'DELETE FROM films_actors WHERE film_id = ?';
          db.run(deleteAssociationsQuery, [filmId], (err) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
  



            // ----------------- Insérer les nouvelles associations entre le film et les acteurs ------------------------------

            const insertAssociationsQuery = 'INSERT INTO films_actors (film_id, actor_id) VALUES (?, ?)';
            actor_ids.forEach((actorId) => {
              db.run(insertAssociationsQuery, [filmId, actorId], (err) => {
                if (err) {
                  console.error(err.message);
                  return res.status(500).json({ error: 'Internal Server Error' });
                }
                 
              });
            });
  



            // ------------------- Mettre à jour les informations du film dans la table films -------------------------------

            const updateFilmQuery = `
              UPDATE films 
              SET name = ?, synopsis = ?, release_year = ?, genre_id = ?
              WHERE id = ?`;
            db.run(updateFilmQuery, [name, synopsis, release_year, genre_id, filmId], function (err) {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
              // Mise a jour de l'etag
        
              const newEtag=generateEtag(`${name}${synopsis}${release_year}${actor_ids}`);

              const updateEtagQuery='UPDATE films SET etag = ? WHERE id = ?';
              db.run(updateEtagQuery,[newEtag, filmId], (err)=>{
                if (err){
                  console.error(err.message);
                  return res.status(500).json({error:'Internal Server Error'});
                }
              })
              console.log(`Film updated: ${filmId}`);
  
              res.json({ success: true, message: 'Film updated', filmId });
            });
          });
        });
      });
    });
  });


//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- DELETE ROUTES ------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------


router.delete('/:id', (req, res) => {
    const filmId = req.params.id;
    const ifMatch=req.headers['if-match'];
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
  


      // Supprimer les entrées de la table 'films_actors' pour le film donné

      const deleteAssociationsQuery = 'DELETE FROM films_actors WHERE film_id = ?';
      db.run(deleteAssociationsQuery, [filmId], (err) => {
        if (err) {
          console.error(err.message);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  

        


        // Supprimer le film de la table 'films'

        const deleteFilmQuery = 'DELETE FROM films WHERE id = ?';
        db.run(deleteFilmQuery, [filmId], function (err) {
          if (err) {
            console.error(err.message);
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          console.log(`Film deleted: ${filmId}`);
          db.run('COMMIT');
  
          res.status(200).json({ success: true, message: 'Film deleted', filmId });
        });
      });
    });
  });



export default router;