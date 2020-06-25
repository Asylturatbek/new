const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('./dbConfig')


module.exports = function(passport) {
  passport.use(
    new LocalStrategy( (username, password, done) => {
      // Match user
      pool.query('SELECT * FROM users WHERE username = $1',[username], (err, result) => {
        if (err) {
          console.log(err)
        }
        console.log('user:', result.rows)

        if(result.rows.length>0){
          //user exists
          const user = result.rows[0]

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });

        } else {
          return done(null, false, { message: 'That email is not registered' });
        }
      })
      // 
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {

    pool.query('SELECT * FROM users WHERE id = $1',[id], (err, result) => {
      if (err) {
        console.log(err)
      } 
      console.log('in desearilize===========')
      return done(null, result.rows[0]);
    })
  });
};






// require('./passportConfig.js')(passport)
// 
// 
// // app.use(passport.initialize());
// app.use(passport.session());
