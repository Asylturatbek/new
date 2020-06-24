const needle = require('needle');

module.exports = async function (req, res, next) {
	if(req.headers['authorization']){
		const data = { session_key: req.headers['authorization'] };
		const respond = await needle('post', 'http://localhost:5000/auth/check', data, {json: true})
		
		if(respond.body.userid){
			next()
		} else {
			res.send({ data: respond.body })
		}

	} else {
		res.send({
			message: 'Please write session_key',
		})
	}
}