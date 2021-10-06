const express = require('express')
const path = require('path')
const Campground = require('./models/campground')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Database connected.')
})
const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/mkcampground', async (req, res) => {
  const camp = new Campground({ title: 'My Backyard', price: '15.99', location: 'My Home', description: 'Cheap camp!' })
  await camp.save()
  res.send(camp)
})

app.listen(3000, () => {
  console.log('Server running at port 3000.');
})