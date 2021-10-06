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

// =====================
//   INDEX ROUTE
// =====================  
app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { title: 'Campgrounds', campgrounds })
})

// =====================
//   DETAILS ROUTE
// =====================  
app.get('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/details', { title: `${campground.title}`, campground })
})




app.listen(3000, () => {
  console.log('Server running at port 3000.');
})