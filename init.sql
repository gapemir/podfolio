CREATE DATABASE IF NOT EXISTS podfolio;
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
    storeid VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fileKey VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public boolean DEFAULT false,
    advertise boolean DEFAULT false,
    parent VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (parent) REFERENCES folder(storeid),
    FOREIGN KEY (userid) REFERENCES user(userid)
);

CREATE TABLE file(
    storeid VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fileKey VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    mimetype VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public boolean DEFAULT false,
    advertise boolean DEFAULT false,
    parent VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (parent) REFERENCES folder(storeid)
);

CREATE TABLE note(
    storeid VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT,
    fileKey VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public boolean DEFAULT false,
    advertise boolean DEFAULT false,
    parent VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (parent) REFERENCES folder(storeid)
);
