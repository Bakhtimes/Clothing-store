const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const methodOverride = require('method-override');
require('dotenv').config()

const app = express();
const port = process.env.PORT
const db = process.env.URI

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride('_method'));

app.set('view engine', 'ejs')

mongoose.connect(db)
.then((res) => {console.log('Connected to DB')})
.catch((err) => {console.log(err)})

const priceSchema = new mongoose.Schema({
    amount: mongoose.Types.Decimal128,
    _id: false
})

const nameSchema = new mongoose.Schema({
    first: String,
    last: String,
    middle: String,
    _id: false
})

const contactSchema = new mongoose.Schema({
    email: String,
    phone: String,
    location: String,
    _id: false
})

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: priceSchema,
    categories: [String],
    brands: [String],
})
const Product = mongoose.model('Products', productSchema);

const cartItemSchema = new mongoose.Schema({
    product: productSchema,
    quantity: Number,
    _id: false
})

const accountSchema = new mongoose.Schema({
    name: nameSchema,
    contact: contactSchema,
    balance: mongoose.Types.Decimal128,
    cart: [cartItemSchema]
})

const Account = mongoose.model('Accounts', accountSchema);

const inventoryItemSchema = new mongoose.Schema({
    product: productSchema,
    quantity: Number,
    _id: false
})

const staffSchema = new mongoose.Schema({
    name: nameSchema,
    contact: contactSchema,
    salary: Number
})

const storeSchema = new mongoose.Schema({
    name: nameSchema,
    contact: contactSchema,
    inventory_item: [inventoryItemSchema],
    staff: [staffSchema]
})

const Store = mongoose.model('Stores', storeSchema);


// const PostSchema = new mongoose.Schema({
//     title: String,
//     body: String,
//     author: String,
//     timestamps: timestampsSchema
// })
// const Post = mongoose.model('Post', PostSchema)

app.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        const accounts = await Account.find({});
        const stores = await Store.find({});
        res.render('home', {products:products, accounts:accounts, stores:stores})
    } catch (err) {
        res.send(err)
    }
})
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.render('products', {products:products})
    } catch (err) {
        res.send(err)
    } 
})
app.get('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({_id:id});
        console.log(product)
        if (!product) {
            res.redirect('/products');
            return;
        }
        res.render('product', {product:product})
    } catch (err) {
        res.send(err)
    } 
})
app.post('/products/:id/delete', async (req, res) => {
    try {
        const id = req.body.resourceId;
        const product = await Product.deleteOne({_id:id});
        res.redirect('/products')
    } catch (err) {
        res.send(err)
    } 
})
app.post('/products/:id/put', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({_id:id});
        data = req.body;
        data.price = {amount: data.price}
        if (!data.name) {
            data.name = product.name
        }
        if (!data.description) {
            data.description = product.description
        }
        if (!data.price) {
            data.price = product.price;
        }
        await Product.updateOne({_id:id}, data);
        res.redirect('/products')
    } catch (err) {
        console.log(err)
        res.send(err)
    } 
})
app.get('/accounts', async (req, res) => {
    try {
        const accounts = await Account.find({});
        res.render('accounts', {accounts:accounts})
    } catch (err) {
        res.send(err)
    } 
})
app.get('/accounts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const account = await Account.findOne({_id:id});
        console.log(account)
        if (!account) {
            res.redirect('/accounts');
            return;
        }
        res.render('account', {account:account})
    } catch (err) {
        res.send(err)
    } 
})
app.post('/accounts/:id/delete', async (req, res) => {
    try {
        const id = req.body.resourceId;
        const account = await Account.deleteOne({_id:id});
        res.redirect('/accounts')
    } catch (err) {
        res.send(err)
    } 
})
app.post('/accounts/:id/put', async (req, res) => {
    try {
        const id = req.params.id;
        const account = Account.findOne({_id:id});
        data = req.body;
        if (!data.name) {
            data.name = account.name
        }
        await Account.updateOne({_id:id}, data);
        res.redirect('/accounts')
    } catch (err) {
        console.log(err)
        res.send(err)
    } 
})
app.get('/stores', async (req, res) => {
    try {
        const stores = await Store.find({});
        res.render('stores', {stores:stores})
    } catch (err) {
        res.send(err)
    } 
})
app.post('/insert_product', async (req,res) => {
    data = req.body;
    data.price = {amount: data.price}
    try {
        if (data.name && data.description) {
            await Product.collection.insertOne(data)
            res.redirect(req.get('referer'))
        } else {
            res.send({message: 'Name and/or description of the post should be filled'})
        }
    } catch (err) {
        console.error(err)
        res.redirect('/products')
    }

    //res.redirect(req.get('referer'));
})
app.listen(port, () => console.log(`Server started on port http://localhost:${port}.`))