const express = require('express');
const app = express();
 
const port = process.env.PORT || 4000;

app.use(express.urlencoded({ extended :false }))
app.use(express.json())

const users = require('./routes/users.js')
const products = require('./routes/products.js')
app.use('/users', users)
app.use('/products', products)

  
app.listen(port, ()=>{
	console.log('app listening to port ' + port)
})