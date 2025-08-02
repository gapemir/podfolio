# podfolio
Podfolio and new ui framework

### it is still in DEV stage which means passwords are stored in plain text, nothing is done with the email and that API could change

# setup

for downloading folders, zip extension needs to be enabled in php, if you run docker this is the command
```
RUN apt-get update && apt-get install -y libzip-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install mysqli pdo_mysql zip \
    && docker-php-ext-enable mysqli
```
make `env.php` file in php folder
example:
```php
<?php
$host="localhost";
$user="root";
$password="";
$db="podfolio";
$port="3306";
```

make sure that `./data/`
folder has correct permission so php can write and read to them (needs to make a folder for user and add files to that folder).

# API
location is `./php/`
we have four categories:

Description of API assumes nothing went wrong, in case that it did, JSON with status and sometimes value is returned.

On success all responces are JSON exept for `./php/folder/createZip.php` witch returns zip file.

For statuses returned check `./php/inc.php` file, also do not call this file as it does nothing when called.

### user `./php/user/`
`login.php`
    
    -parameters
        - username
        - password
    returns JSON
        - status
        - userid
        - token
        
`getContent.php`

    - parameters
        - userid
        - token
    - returns JSON
        - encoded 
        - status
        - files
        - folders
        - notes

`register.php`

    - parameters
        - username
        - password (stored as plain text!!)
        - email (nothing is done with the email, no email sending shit, for fure use)
    -returns JSON
        - status
        - userid
        - token
`vertify.php`

    - parameters
        - userid
        - token
    - returns JSON
        - status

### file `./php/file/`

all take `userid` and `token` and return JSON encoded status + additional data

`upload.php`

    - parameters
        - fileName
        - token
        in $_FILES there sould be a file record, check privateFile.js > PTileContainer > _uploadFile() for more details
    - returns JSON
        -file record

`rename.php`

    - parameters
        - storeid
        - newname //: TODO SHOULD BE MADE SAME AS FOR UPLAODING A FILE

`changeMeta.php`

    - parameters
        - data: array ["advertize"|"public", true|false]

`delete.php`

    - parameters
        - storeid

### file `./php/folder/`

all take `userid` and `token` and return JSON encoded status + additional data
except creteZip witch on succsess returns ZIP blob

`create.php`

    - parameters
        - parent
    - returns JSON
        - folder record

`rename.php` same as `./php/file/remane.php` <br/>
`changeMeta.php` same as `./php/file/changeMeta.php` <br/>

`createZip.php`

    - parameters
        - storeid
    - returns 
        - on succsess ZIP blob1
        - on faliure JSON status

`delete.php` same as `./php/file/delete.php` <br/>

### file `./php/note/`

all take `userid` and `token` and return JSON encoded status + additional data

`create.php` same as `./php/folder/create.php` <br/>

`change.php` 

    - parameters
        - storeid
        - content (string that is note)

`rename.php` same as `./php/file/remane.php` <br/>
`changeMeta.php` same as `./php/file/changeMeta.php` <br/>
`delete.php` same as `./php/file/delete.php` <br/>


