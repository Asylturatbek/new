const { Router } = require('express')
const router = Router()

const { pool } = require('./../dbConfig')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');
const needle = require('needle');


const {registerValidate} = require('./../util/helpers.js')

router.get('/check', async (req, res) => {
	if(req.headers['authorization']){
		const data = { session_key: req.headers['authorization'] };
		const respond = await needle('post', 'http://auth_part:5000/auth/check', data, {json: true})
		
		if(respond.body.userid){
			res.send({ message: 'you can access now everything'})
		} else {
			res.send({ data: respond.body })
		}

	} else {
		res.send({
			message: 'Please write session_key',
		})
	}
})


router.post('/register', async (req, res) => {
	const data = req.body
	const respond = await needle('post', 'http://auth_part:5000/auth/register', data, {json: true})
	res.send({
		data: respond.body
	})
})


router.post('/login', async (req, res) => {
	const data = req.body
	const respond = await needle('post', 'http://auth_part:5000/auth/login', data, {json: true})
	res.send({
		data: respond.body
	})
})

module.exports = router