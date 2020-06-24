const { Router } = require('express')
const router = Router()

const { pool } = require('./../dbConfig')

router.get('/categories', async (req, res) => {
	const { rows } = await pool.query('SELECT * FROM categories')
	const { rows: rowsProduct } = await pool.query('SELECT * FROM products')

	const arr = []
	for (let product of rowsProduct){
		arr.push(product.category_id)
	}

	for (let category of rows) {
		category.products_count = arr.filter(function(x){return x==category.id}).length
	}

	res.send({
		message: 'here are categories',
		data: rows
	})
})


router.get('/', async (req, res) => {
	const {category_id} = req.body
	if (category_id){
		const { rows } = await pool.query('SELECT * FROM products WHERE category_id = $1',[category_id])
		res.send({
			message: 'here are products of category_id '+category_id,
			data: rows
		})
	} else {
		const { rows } = await pool.query('SELECT * FROM products')
		res.send({
			message: 'here are all products',
			data: rows
		})
	}
	
})

router.post('/', async (req, res) => {
	const { name, category_id } = req.body

	const {rows} = await pool.query(`INSERT INTO products (name, category_id) VALUES ($1, $2) RETURNING id, name, category_id`, [name, category_id])


	res.send({
		message: 'created new product',
		product: rows[0]
	})
})

router.delete('/', async(req, res) => {
	const { id } = req.body

	const {rows} = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING id, name, category_id`,[id])


	res.send({
		message: 'deleted product',
		product: rows[0]
	})
})

router.post('/addToFavorites', async(req, res) => {
	const {user_id, product_id} = req.body

	const {rows} = await pool.query(`INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING user_id, product_id`, [user_id, product_id])
	res.send({
		message: `product with and id of ${product_id} is added to favorites of user with and id ${user_id}`,
		data: rows[0]
	})
})

router.post('/favorites', async(req, res) => {
	const { user_id } = req.body

	const { rows } = await pool.query('SELECT * FROM favorites WHERE user_id = $1',[user_id])

	res.send({
		message: 'here are all favorite products of user with and id of ' + user_id,
		data: rows
	})
})











module.exports = router