CREATE DATABASE podfolio;
USE podfolio;

CREATE TABLE user(
    username VARCHAR(255) NOT NULL PRIMARY KEY,
    userid varchar(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token VARCHAR(255) DEFAULT NULL
);

CREATE TABLE folder(
    folderid VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public boolean DEFAULT false,
    advertize boolean DEFAULT false,
    parent VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (parent) REFERENCES folder(folderid),
    FOREIGN KEY (userid) REFERENCES user(userid)
);

CREATE TABLE file(
    fileid VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fileKey VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    mimetype VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public boolean DEFAULT false,
    advertize boolean DEFAULT false,
    parent VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (parent) REFERENCES folder(folderid)
);

