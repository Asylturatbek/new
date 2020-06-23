const { Router } = require('express')
const router = Router()

const { pool } = require('./../dbConfig')
const bcrypt = require('bcrypt')

router.get('/register', (req, res) => {
	res.render('register')
})

router.get('/login', (req, res) => {
	console.log(req.user)
	res.render('login')
})

router.get('/check', (req, res) => {
	if(req.session.user){
		res.send(req.session.user)
	} else {
		res.send('not logged in')
	}
})

router.get('/dashboard', (req, res) => {
	console.log(req)
	console.log(req.session)
	console.log(req.sessionID)
	res.render('dashboard', {user: req.session.user})
})

router.post('/register', async (req, res) => {

	let { username, password, password2 } = req.body

	let errors = [];

	if(!username || !password || !password2){
		errors.push({message: "Please enter all fields."})
	}
	if(password.length < 6){
		errors.push({message: 'Password should be at lease 6 characters.'})
	}
	if(password != password2){
		errors.push({message: 'Passwords do not match.'})
	}
	if(errors.length > 0) {
		res.render('register', {errors})
	} else {
		//hashing the password
		const hashedPassword = await bcrypt.hash(password, 10)
		console.log(hashedPassword)

		//check if username already exists in db
		pool.query('SELECT * FROM users WHERE username = $1',[username], (err, result) => {
		  if (err) {
		    console.log(err)
		  }
		  console.log('user:', result.rows)
		  console.log('in register route')
		  if(result.rows.length>0){
		  	console.log('user already exists')
		  	errors.push({message: 'User already exists with this username'})
		  	res.render('register', { errors })
		  } else {
		  	pool.query(
		  		`INSERT INTO users (username, password)
		  		VALUES ($1, $2)
		  		RETURNING id, password`, [username, hashedPassword],
		  		(err, results) => {
		  			if (err) {
		  				console.log(err)
		  				throw err;
		  			}
		  			console.log(results.rows);
		  			req.flash("success_msg", 'You are now registered. Please log in!')
		  			res.redirect('/users/login')
		  		}
		  		)
		  	console.log('successfully created user')
		  }
		})

	}
})


router.post('/login', (req, res) => {
	try {
		  const password = req.body.password
		  const username = req.body.username
	      pool.query('SELECT * FROM users WHERE username = $1',[username], (err, result) => {
	        if (err) {
	          console.log(err)
	        }
	        console.log('we are in login route')

	        if(result.rows.length>0){
	          //user exists
	          const user = result.rows[0]

	          bcrypt.compare(password, user.password, (err, isMatch) => {
	            if (err) throw err;
	            if (isMatch) {
	              req.session.user = {
	              	userId: user.id,
	              	username: user.username
	              }
	              const session_id = req.sessionID
	              res.send(user)
	            } else {
	              res.send('the password does not match')
	            }
	          });

	        } else {
	          res.send('email is not registered')
	        }
	      })		
	} catch (err) {
		console.log('something went wrong')
		console.log(err)
	}
})



router.get('/logout', (req, res) => {
	try{
		const user = req.session.user
		if(user) {
			req.session.destroy( err=> {
				if (err) throw (err);

				res.clearCookie(process.env.SESS_NAME);
				res.send(`${user.username} has logged out`)
			})
		}
	} catch (err) {
		res.status(422).send(parseError(err));
	}
    // req.flash('info', 'You are logged out! Consider loggin in')
    // res.redirect('/');
})

module.exports = router