# Progetto_RetiDiCalcolatori

![schema](./fotoschema.png)

## Progetto pratico per l'esame di Reti di calcolatori

---
### Svolto da Rosapia Laudati, Lorenzo Mastrandrea e Lorenzo Frangella

Il nostro progetto consiste in una web app utilizzabile tramite browser che fornisce anche delle api REST.



## Guida all uso

Per iniziare bisogna scaricare il codice sorgente del nostro progetto tramite il comando

```
git clone https://github.com/RosapiaL/Progetto_RetiDiCalcolatori.git
```
Ora ci dobbiamo spostare all'interno della directory Progetto_RetiDiCalcolatori tramite il comando:
```
cd Progetto_RetiDiCalcolatori
```
All'interno di questa cartella bisogna creare un file .env in cui bisognerà copiare i dati qui sotto elencati.
```
DBUSER = "admin"
DBPASS = "admin"
CLIENTID = "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com"
CLIENTSECRET = "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"
RABBITUSER = "user"
RABBITPASS = "password"
MAILUSER = 'rdcbookmaster@gmail.com'
MAILPASS = 'zxhr xxbq tbdw xidj'
COUCHDB_USER=admin
COUCHDB_PASSWORD=admin
RABBITMQ_DEFAULT_USER=user
RABBITMQ_DEFAULT_PASS=password
API_KEY="AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs"
```
Poi successivamente se si dispone di Docker si può avviare il progetto tramite il comando

```
docker-compose up
```

A questo punto verranno creati 7 container in docker

* Nginx

* NodeJS (Vengono generati 3 container identici)

* CouchDB

* NodeMailer

* RabbitMQ

Per poter accedere al servizio tramite browser basterà visitare la pagina 

https://localhost:443

## Descrizione del progetto

Bookmaster è un sito web dove, eseguendo l'accesso tramite oauth di google è possibile gestire la propria raccolta di libri, aggiungendoli alle proprie raccolte 'da leggere', 'letti' e 'preferiti'.

Per ogni libro è possibile lasciare una recensione che verrà poi salvata all' interno del database CouchDB e successivamente si potrà accedere alle recensioni di ogni libro tramite la pagina dedicata.

---

## API

La nostra applicazione supporta delle api REST

---

```
GET https://localhost:443/status
````
Ci restituisce lo stato del servizio, questa chiamata è utile soprattutto in fase di test dell applicazione

---

```
GET https://localhost:443/api/getreview/bytitle?title=titolo+del+libro
````

Tramite questa chiamata è possibile ottenere le recensioni relative al libro di cui si specifica il titolo come parametro title. Le recensioni verranno restituite sotto forma di array in un file JSON contenente anche titolo del libro, numero di recensioni e identificativo del libro.

---

```
GET https://localhost:443/api/getreview/byid?id=id_del_libro
````

Analogamente alla chiamata sopra, questa get ci restituisce le recensioni relative al libro il cui identificativo (preso da google book) è uguale a quello specificato con l'attributo id

