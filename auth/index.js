const express = require('express');
const app = express();

const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended :false }))
app.use(express.json())

const auth = require('./routes/auth.js')
app.use('/auth', auth)

app.listen(port, ()=>{
	console.log('app listening to port ' + port)
})