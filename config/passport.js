const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/main');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
  };
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    done(null,'asdasdqwe234wefrw4tgsdf')
  }));
};
