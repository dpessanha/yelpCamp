const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const { campgroundSchema } = require('../joi/schemas')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')

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

// =====================
//   ROUTES
// =====================

// ===================== INDEX ROUTE
router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {
      title: 'YelpCamp | Campgrounds',
      campgrounds,
    })
  })
)

// ===================== CREATE ROUTE
router.get('/new', (req, res) => {
  res.render('campgrounds/new', { title: 'YelpCamp | New Campground' })
})
router.post(
  '/',
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError(400, 'Invalid campground Data.')
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully created the new campground!')
    res.redirect(`campgrounds/${campground._id}`)
  })
)

// ===================== DETAILS ROUTE
router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      'reviews'
    )
    if (!campground) {
      req.flash('error', 'Campground not found.')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/details', {
      title: `YelpCamp | ${campground.title}`,
      campground,
    })
  })
)

// ===================== EDIT ROUTE
router.get(
  '/:id/edit',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
      req.flash('error', 'Campground not found.')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {
      title: `YelpCamp | Edit ${campground.title}`,
      campground,
    })
  })
)
router.put(
  '/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    req.flash('success', 'Successfully upgraded campground.')
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

// ===================== DELETE ROUTE
router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
  })
)

module.exports = router
