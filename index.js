const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate')
const override = require('method-override')
const mongoose = require('mongoose')
const { campgroundSchema, reviewSchema } = require('./joi/schemas')
const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
//   MIDDLEWARES
// =====================
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

// =====================
//   LANDING PAGE ROUTE
// =====================
app.get('/', (req, res) => {
  res.render('home')
})

// =====================
//   INDEX ROUTE
// =====================
app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {
      title: 'YelpCamp | Campgrounds',
      campgrounds,
    })
  })
)

// =====================
//   CREATE ROUTE
// =====================
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new', { title: 'YelpCamp | New Campground' })
})
app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req, res) => {
    // if(!req.body.campground) throw new ExpressError(400, 'Invalid campground Data.')
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

// =====================
//   DETAILS ROUTE
// =====================
app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/details', {
      title: `YelpCamp | ${campground.title}`,
      campground,
    })
  })
)

// =====================
//   EDIT ROUTE
// =====================
app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', {
      title: `YelpCamp | Edit ${campground.title}`,
      campground,
    })
  })
)
app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

// =====================
//   DELETE ROUTE
// =====================
app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
  })
)

//====================================== POSTS
app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  catchAsync(async (req, res) => {
    const { id, review } = req.params
    const campground = await Campground.findById(id)
    const newReview = new Review(review)
    campground.reviews.push(newReview)
    await newReview.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

// =====================
//   ERROR HANDLING
// =====================
app.all('*', (re, res, next) => {
  next(new ExpressError('Page Not Found.', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = 'Something went wrong...'
  res.status(statusCode).render('error', { err, title: 'Error!' })
})

/////////// Server Start
app.listen(3000, () => {
  console.log('Server running at port 3000.')
})
