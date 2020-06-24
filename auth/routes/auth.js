const { Router } = require('express')
const router = Router()

const { pool } = require('./../dbConfig')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');

const {registerValidate} = require('./../util/helpers.js')

router.post('/check', async (req, res) => {
	const {session_key} = req.body

	esult = await pool.query("DELETE FROM sessions WHERE created_date < NOW() - INTERVAL '10 minutes'")
	const { rows } = await pool.query('SELECT * FROM sessions WHERE session_key = $1',[session_key])
	
	if (rows.length>0){
		res.send(rows[0])
	} else {
		res.send({
			message: 'You have to login'
		})
	}
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
		  const { username, password } = req.body

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




module.exports = router