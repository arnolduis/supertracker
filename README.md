supertracker
============


### <span style="color:red">*Please dont install this, it's in a very early stage of developement!!*</span>

supertracker is an npm package for NodeJS, which came to life with the mission to ease tracking the traffic of your webservice. 
The Federation needs you!! 

## Local and global usage

The package can be used as a local, or a global package. The local install defines routes to track events on, and to view the apps usage statistics. 

### Local usage

The local package lets you define a route, on which the package features become accessible.

```javascript

/*
* Initialise the package, passing the app to it, and defining the route for 
* package features. Leaving it blank will make the features accessible on the 
* base route of the app.
*/  
st=require('supertracker')(app, "/tracking"); 

```

### Global usage

The global install adds a command "supertracker" in your path. Running the command will fire up a server listening to tracking events, saving them into a database upon receiving.

```javascript
$ supertracker
```

### Features

#### track
Receives ajax messages saving them to database

#### dashboard
Monitoring and visualizing app usage.
