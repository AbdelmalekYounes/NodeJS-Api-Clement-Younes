import express from 'express';
import db from '../database.js';
import generateEtag from '../generateEtag.js';
const router = express.Router();

//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- GET ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------

router.get('/', (req, res) => {
    const query = 'SELECT * FROM actors';
  
    db.all(query, [], (err, actors) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const etag=generateEtag(JSON.stringify(actors));
      res.json({actors, etag});
    });
  });




  router.get('/:id', (req, res) => {
    const actorId = req.params.id;
  

    // Vérifier si l'acteur existe

    const checkActorQuery = 'SELECT * FROM actors WHERE id = ?';
    db.get(checkActorQuery, [actorId], (err, actor) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (!actor) {
        return res.status(404).json({ error: 'Actor not found' });
      }
      const etag=generateEtag(JSON.stringify(actor));
      res.json({actor, etag});
    });
  });


//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- POST ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------

router.post('/', (req, res) => {
    const { first_name, last_name, date_of_birth, date_of_death } = req.body;
    const etag=generateEtag(`${first_name}${last_name}${date_of_birth}${date_of_death}`);
 
    
  
    // Insérer l'acteur dans la table actors

    const insertActorQuery = 'INSERT INTO actors (first_name, last_name, date_of_birth, date_of_death, etag) VALUES (?, ?, ?, ?, ?)';
    db.run(insertActorQuery, [first_name, last_name, date_of_birth, date_of_death,etag], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const actorId = this.lastID;
      console.log(`[New actor added with ID: ${actorId}]`);
  
      res.json({ success: true, message: 'Actor created', actorId });
    });
  });


//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- PUT ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------

router.put('/:id', (req, res) => {
    const actorId = req.params.id;
    const { first_name, last_name, date_of_birth, date_of_death } = req.body;
    const ifMatch=req.headers['if-match'];


    // Récupération de l'ETag dans la BDD

    const getEtagQuery='SELECT etag FROM actors WHERE id = ?';
    db.get(getEtagQuery,[actorId],(err,row)=>{
      if(err){
        console.error(err.message);
        return res.status(500).json({error: 'Internal Server Error'});
      }
      
    });

    const currentEtag = row.etag;
    
    if (currentEtag !== ifMatch){
      return res.status(412).json({error:'Predondition Failed'});
    }



    // Vérifier si l'acteur existe

    const checkActorQuery = 'SELECT * FROM actors WHERE id = ?';
    db.get(checkActorQuery, [actorId], (err, actorRow) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (!actorRow) {
        return res.status(404).json({ error: 'Actor not found' });
      }
  


      // Mettre à jour les informations de l'acteur

      const updateActorQuery = 'UPDATE actors SET first_name = ?, last_name = ?, date_of_birth = ?, date_of_death = ? WHERE id = ?';
      db.run(updateActorQuery, [first_name, last_name, date_of_birth, date_of_death, actorId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Mise a jour de l'etag
        
         const newEtag=generateEtag(`${first_name}${last_name}${date_of_birth}${date_of_death}`);

         const updateEtagQuery='UPDATE actors SET etag = ? WHERE id = ?';
         db.run(updateEtagQuery,[newEtag, actorId], (err)=>{
          if (err){
            console.error(err.message);
            return res.status(500).json({error:'Internal Server Error'});
          }
         })
        console.log(`Actor updated: ${actorId}`);
  
        res.json({ success: true, message: 'Actor updated', actorId });
      });
    });
  });


//-----------------------------------------------------------------------------------------------------------------
//----------------------------------------------- DELETE ROUTES -----------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------


  router.delete('/:id', (req, res) => {
    const actorId = req.params.id;
  


    // Vérifier si l'acteur existe

    const checkActorQuery = 'SELECT * FROM actors WHERE id = ?';
    db.get(checkActorQuery, [actorId], (err, actorRow) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (!actorRow) {
        return res.status(404).json({ error: 'Actor not found' });
      }
  


      // Supprimer l'acteur de la table actors

      const deleteActorQuery = 'DELETE FROM actors WHERE id = ?';
      db.run(deleteActorQuery, [actorId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        console.log(`Actor deleted: ${actorId}`);
  
        res.json({ success: true, message: 'Actor deleted', actorId });
      });
    });
  });


export default router;
