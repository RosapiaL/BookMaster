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

Poi successivamente se si dispone di Docker si può avviare il progetto trovandosi all interno della cartella principale tramite il comando

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




