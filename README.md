# API NodeJS- Express Sqlite3

API permettant la creation,modification,affichage et suppression de films,genres,acteurs en tout genre

## Installation

1. Clonez ce dépôt sur votre machine locale.
2. Assurez-vous d'avoir Node.js installé sur votre machine.
3. Exécutez la commande `npm install` pour installer les dépendances.



## Utilisation

1. Exécutez la commande `npm start` pour démarrer l'application.
2. Accédez à l'URL `http://localhost:8000` dans votre navigateur pour accéder à l'application.

## Routes disponibles
Testez l'API avec POSTMAN

- `GET /api/film` : Récupère la liste des films avec les informations de genre et les fiches acteurs associées.
- `GET /api/film/{id}` : Récupère la fiche d'un film spécifique avec les informations de genre et les fiches acteurs associées.
- `POST /api/film` : Crée un nouveau film avec les informations fournies dans le corps de la requête.
- `PUT /api/film/{id}` : Modifie un film existant avec les informations fournies dans le corps de la requête.
- `DELETE /api/film/{id}` : Supprime un film spécifique.


- `GET /api/actor` : Récupère la liste des acteurs.
- `GET /api/actor/{id}` : Récupère la fiche d'un acteur spécifique.
- `POST /api/actor` : Crée un nouvel acteur avec les informations fournies dans le corps de la requête.
- `PUT /api/actor/{id}` : Modifie un acteur existant avec les informations fournies dans le corps de la requête.
- `DELETE /api/actor/{id}` : Supprime un acteur spécifique.


- `GET /api/genre` : Récupère la liste des genres.
- `POST /api/genre` : Crée un nouveau genre avec les informations fournies dans le corps de la requête.
- `DELETE /api/genre/{id}` : Supprime un genre spécifique (si non utilisé dans un ou plusieurs films).

## By
ABDELMALEK Younes
DEGAT Clément
  



   
 
