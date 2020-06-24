const express = require('express');
const app = express();
const { pool } = require('./dbConfig')
const session = require('express-session')

const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();
 
const port = process.env.PORT || 4000;

// app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended :false }))
app.use(express.json())
app.use(session({
  	name: process.env.SESS_NAME,
  	secret: process.env.SESS_SECRET,
  	resave: false,
  	saveUninitialized: false,
  	store: new pgSession({
	    pool : pool,                // Connection pool
	    tableName : 'user_sessions'  // Use another table-name than the default "session" one
	}),
  	cookie: {
  	    secure: process.env.NODE_ENV === 'production',
  	    maxAge: 60*1000*10
  	}
}))



const users = require('./routes/users.js')
const products = require('./routes/products.js')
app.use('/users', users)
app.use('/products', products)

  
app.listen(port, ()=>{
	console.log('app listening to port ' + port)
})