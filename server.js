var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var User = require(__dirname + '/models/userModel.js').User;
var Country = require(__dirname + '/models/userModel.js').Country;

var port = process.env.PORT || 3000;

var mongoDB = ####;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(session({
    secret: 'work hard', 
    resave: true,
    saveUninitialized: false,
    cookie: { secure: !true },
    store: new MongoStore({
        mongooseConnection: db
    })
}))

var searchUser;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/assets', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});

app.post('/', function(req, res, next) {
    if(req.body.name && req.body.email && req.body.username && req.body.password) {
        var newUser = new User({
            'name': req.body.name,
            'email': req.body.email,
            'username': req.body.username,
            'password': req.body.password
        });
        User.create(newUser, function(err, user) {
            if(err) return next(err);
            req.session.userId = user._id;
            return res.redirect('/profile'); 
        })
    } else if(req.body.logusername && req.body.logpassword) {
        User.authenticate(req.body.logusername, req.body.logpassword, function(err, user) {
            if(err || !user) return next(err);
            req.session.userId = user._id;
            return res.redirect('/profile')
        })
    } else {

    }
});

app.get('/profile', function(req, res, next) {
    User.findById({"_id": req.session.userId}, 'name email username password countries', function(err, user){
        res.render('home', {'name': user.name, 'email': user.email, 'countries': user.countries});
    })
})

app.post('/add', function(req, res) {
    var newCountry = new Country({
        "country": req.body.country,
        "color": req.body.color,
        "description": req.body.description
    });

    User.findByIdAndUpdate({"_id": req.session.userId}, {$push: {"countries": newCountry}}, { "new": true, "upsert": true }, function(err, user){
       if(err) throw err;
        User.findById({"_id": req.session.userId}, "name email countries", function(err, user1) {
            if(err) throw err;
            res.render('home', {'name': user1.name, 'email': user1.email, 'countries': user1.countries});
        });
    });
});

app.get('/delete/:id', function(req, res) {

    User.findByIdAndUpdate({'_id': req.session.userId}, {$pull: {"countries": {"_id": req.params.id}}}, function(err, data){
        if(err) throw err;
        User.findById({"_id": req.session.userId}, "name email countries", function(err, user1) {
            if(err) throw err;
            res.render('home', {'name': user1.name, 'email': user1.email, 'countries': user1.countries});
        }); 
    }) 
})

app.get('/senddata', function(req, res) {
    User.findById({"_id": req.session.userId}, "countries", function(err, user1){
        res.send(user1.countries);
    })
})

app.post('/search', function(req, res) {
    User.find({'name': req.body.search}, 'name username', function(err, user) {
        if(err) throw err;
        res.render('search', {'name': req.body.search, 'results': user});
    })
})


app.get('/searchUser', function(req, res) {
    User.findOne({'username': searchUser}, 'name username countries', function(err, user) {
        if(err) throw err;
        res.send(user.countries);
    })
})

app.get('/:username', function(req, res) {
    if(req.session.userId) {
        User.findOne({'username': req.params.username}, 'name username countries', function(err, user) {
            if(err) throw err;
            searchUser = req.params.username;
            res.render('publicProfile', {'name': searchUser});
        })
    } else {
        res.send('nah');
    }
})

app.get('/profile/logout', function(req, res) {
    if(req.session) {
        req.session.destroy(function(err) {
            if(err) throw err;
            //searchUser = null;
            res.redirect('/');
        })
    }
})

app.listen(port);
