import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const apiKey=process.env.API_KEY;


const { Database } = sqlite3;
const DBSOURCE = 'database.sqlite'

const db = new sqlite3.Database(DBSOURCE, (errConnect) => {

  if (errConnect) {

    // Cannot open database
    console.error(errConnect.message);
    throw errConnect;

  } else {

    console.log('Connected to the SQLite database.');

    db.run(`
        
        CREATE TABLE IF NOT EXISTS 'genres' (
            'id' INTEGER PRIMARY KEY AUTOINCREMENT,
            'name' varchar(255) NOT NULL,
            'etag' varchar(255) 
          );
        `)

    db.run(`
        CREATE TABLE IF NOT EXISTS 'actors' (
          'id' INTEGER PRIMARY KEY AUTOINCREMENT,
          'first_name' varchar(255) NOT NULL,
          'last_name' varchar(255) NOT NULL,
          'date_of_birth' date NOT NULL,
          'date_of_death' date,
          'etag' varchar(255) 
        );
        `)

    db.run(`
          CREATE TABLE IF NOT EXISTS 'films' (
          'id' INTEGER PRIMARY KEY AUTOINCREMENT,
          'name' varchar(255) NOT NULL,
          'synopsis' text NOT NULL,
          'release_year' int,
          'genre_id' int NOT NULL,
          'etag' varchar(255) 
        );
        `)

    db.run(` 
        CREATE TABLE IF NOT EXISTS 'films_actors' (
          'film_id' INTEGER,
          'actor_id' INTEGER,
          FOREIGN KEY (film_id) REFERENCES films(id),
          FOREIGN KEY (actor_id) REFERENCES actors(id),
          PRIMARY KEY ('film_id', 'actor_id')
        );
        `)

  }

});

export default db;