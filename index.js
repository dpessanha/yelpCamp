const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const override = require('method-override')
const host = '127.0.0.1'
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

mongoose.connect(`mongodb://${host}:27017/yelp-camp`, {
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
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
  secret: 'abacaxi',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
  },
}
app.use(session(sessionConfig))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  next()
})
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// =====================
//   LANDING PAGE ROUTE
// =====================
app.get('/', (req, res) => {
  res.render('home')
})

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
