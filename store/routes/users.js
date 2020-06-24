const { Router } = require('express')
const router = Router()

const { pool } = require('./../dbConfig')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');

const {registerValidate} = require('./../util/helpers.js')

router.get('/register', (req, res) => {
	res.render('register')
})

router.get('/login', (req, res) => {
	res.send(req.headers)
})

router.get('/check', (req, res) => {
	if(req.headers['authorization']){
		res.send({
			message: 'there is a key',
			src: req.headers
		})
	} else {
		res.send({
			message: 'there is no key',
			src: req.headers
		})
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
	const errors = registerValidate(username, password, password2)

	if(errors.length > 0) {
		res.send({errors})
	} else {
		//hashing the password
		const hashedPassword = await bcrypt.hash(password, 10)

		//check if username already exists in db
		const { rows } = await pool.query('SELECT * FROM users WHERE username = $1',[username])
		if (rows.length>0){
			res.send('user already exists')
		} else {
			const result = await pool.query(`INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, password`, [username, hashedPassword])
			res.send({
				message: 'user created',
				user: result.rows[0]
			})
		}

	}
})


router.post('/login', async (req, res) => {
	try {
		  const password = req.body.password
		  const username = req.body.username

		  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1',[username])
		  if (rows.length>0) {
		  	const user = rows[0]
		  	const isMatch = await bcrypt.compare(password, user.password)
		  	if(isMatch){
		  		const session_key = uuidv4();

		  		const result = await pool.query(`INSERT INTO sessions (userid, session_key) VALUES ($1, $2) RETURNING userid, session_key`, [user.id, session_key])
		  		const ses = result.rows[0]

		  		res.send({
		  			message: 'user logged in',
		  			user:user,
		  			key: session_key,
		  			ses: ses
		  		})
		  	} else {
		  		res.send('the passwords do not match')
		  	}
		  } else {
		  	res.send('email is not registered')
		  }
	} catch (err) {
		console.log('something went wrong')
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