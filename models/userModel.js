var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');


var countrySchema = new Schema({
    "country": String, 
    "color": String,
    "description": String
});

var userSchema = new Schema({
    "name": String, 
    "email": String,
    "username": String, 
    "password": String,
    "countries": [countrySchema]
});

userSchema.statics.authenticate = (function(username, password, callback) {
    User.findOne({'username': username}, 'password', function(err, user) {
        if(err) return callback(err);
        if(bcrypt.compare(password, user.password)) {
            return callback(null, user);
        } else {
            return callback();
        }
    })
})


userSchema.pre('save', function(next) {
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if(err) throw err;
        user.password = hash;
        next();
    })
})

var User = mongoose.model('User', userSchema);
var Country = mongoose.model('Country', countrySchema);

module.exports = {
    'User': User,
    'Country': Country
}