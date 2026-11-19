# Spec Delta

## Purpose

Lire et écrire des valeurs JSON dans le stockage du navigateur sans jamais faire échouer
l'application, même quand le stockage est bloqué, plein ou corrompu.

## ADDED Requirements

### Requirement: Lecture protégée

`readJson(key)` SHALL renvoyer la valeur JSON enregistrée, ou `undefined` si la clé est absente,
si la valeur n'est pas du JSON valide ou si le stockage est indisponible. Il SHALL NOT lever
d'erreur.

#### Scenario: Valeur enregistrée

- **WHEN** la clé `pacmac:sound` contient `{"muted":true}`
- **THEN** `readJson('pacmac:sound')` renvoie `{ muted: true }`

#### Scenario: Valeur corrompue

- **WHEN** la clé contient `{muted`
- **THEN** `readJson` renvoie `undefined`

#### Scenario: Stockage bloqué

- **WHEN** l'accès à `localStorage` lève une erreur
- **THEN** `readJson` renvoie `undefined`

### Requirement: Écriture protégée

`writeJson(key, value)` SHALL enregistrer la valeur en JSON et renvoyer `true`, ou renvoyer
`false` sans lever d'erreur si le stockage est indisponible ou plein.

#### Scenario: Écriture réussie

- **WHEN** on écrit `{ muted: false }` sous `pacmac:sound`
- **THEN** `writeJson` renvoie `true` et la clé contient `{"muted":false}`

#### Scenario: Stockage plein

- **WHEN** `setItem` lève une erreur de quota
- **THEN** `writeJson` renvoie `false`

### Requirement: Stockage bloqué au démarrage

Au démarrage, un `localStorage` dont le simple accès lève une erreur SHALL être remplacé par
`null`, et `isStorageAvailable()` SHALL indiquer si le stockage accepte une écriture, pour que
l'interface puisse avertir le joueur que rien ne sera conservé.

#### Scenario: Données de site bloquées

- **WHEN** lire `globalThis.localStorage` lève une erreur et qu'on neutralise le stockage
- **THEN** `globalThis.localStorage` vaut `null` et `isStorageAvailable()` renvoie `false`

#### Scenario: Stockage disponible

- **WHEN** le stockage accepte l'écriture et la suppression d'une clé de test
- **THEN** `isStorageAvailable()` renvoie `true` et la clé de test a disparu
