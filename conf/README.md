## Configuration

The configuration files for the application are stored in this
subfolder.

#### [db.js](db.js)
Contains the configuration for the database used in the application.
I chose [PostgreSQL](https://www.postgresql.org/) because it's free
and really powerful.

In the configuration file the database endpoint, name, user and password are defined.

#### [passport.js](passport.js)
This file contains the authentication configuration.
For authentication, [passport](http://passportjs.org) was used.
The application authentication methods are:
- Standard authentication through login and password, used only when logging
in for the generation of an auth_token.

- Authentication through bearer token, which has an expiration datetime and
can be refreshed with the provided refresh_token. This is what is to authenticate
each request from the client application.