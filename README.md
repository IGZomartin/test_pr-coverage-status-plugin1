## Portal de descargas IGZ

Módulo de backend para la gestión de peticiones provenientes desde la aplicación de AngularJS perteneciente al Portal de Descargas IGZ.


### AWS

Para usar S3 como cloud storage, hay que exportar las credenciales correspondientes 

```sh
 $> export AWS_ACCESS_KEY_ID='STRING_PARA_ACCESS_KEY'
 $> export AWS_SECRET_ACCESS_KEY='STRING_PARA_SECRET_ACCESS_KEY'
 
 // para probar que sean correctas
 $> npm test
```

### GCS

```sh
$> export GCS_PROJECT_ID=1234
$> export GCS_KEY_FILENAME=keyfilename.json // debe estar en la raiz del projecto

 // para probar que sean correctas
 $> npm test
```
