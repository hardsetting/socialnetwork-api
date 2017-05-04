## SocialNetwork API
This is the server-side part of the application "SocialNetwork"
written for the Distributed Web Applications course.

### Overview

The main parts of the application are situated in
"models", "routes" and "conf" folders.

#### [models](models/README.md)
Contains the models of the servers side application, each associated with
a database table. The ORM [Objection.js](https://github.com/Vincit/objection.js/) was used to define the models and access the
underlying tables.

#### [routes](routes/README.md)
Contains the resources, grouped by category, that define the API.
The name of each group identifies the first path element.

#### [conf](conf/README.md)
Contains the configuration files for the project, including database and
authentication configuration through [passport.js](http://passportjs.org).

### Architecture
The application is written in javascript using Node.js and
is accessible through "$HOST_NAME/api" location configured as reverse proxy
on a nginx web server.