const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate')
const override = require('method-override')
const Campground = require('./models/campground')
const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')
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

app.engine('ejs', ejsMate)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(override('_method'))

// =====================
//   LANDING PAGE ROUTE
// =====================  
app.get('/', (req, res) => {
  res.render('home')
})

// =====================
//   INDEX ROUTE
// =====================  
app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { title: 'YelpCamp | Campgrounds', campgrounds })
})

// =====================
//   CREATE ROUTE
// =====================  
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new', { title: 'YelpCamp | New Campground' })
})
app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
})

// =====================
//   DETAILS ROUTE
// =====================  
app.get('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/details', { title: `YelpCamp | ${campground.title}`, campground })
})

// =====================
//   EDIT ROUTE
// =====================  
app.get('/campgrounds/:id/edit', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/edit', { title: `YelpCamp | Edit ${campground.title}`, campground })
})
app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
  res.redirect(`/campgrounds/${campground._id}`)
})

// =====================
//   EDIT ROUTE
// =====================
app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
})

// Error handling
app.use((err, req, res, next)=> {
  res.send(`There is an error in the request.`)
})

/////////// Server Start
app.listen(3000, () => {
  console.log('Server running at port 3000.');
})