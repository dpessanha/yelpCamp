const express = require('express')
const router = express.Router({ mergeParams: true })
const { reviewSchema } = require('../joi/schemas')
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')

// =====================
//   MIDDLEWARES
// =====================

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

/*################
 ROUTES
#################*/
//====================================== CREATE ROUTE
router.post(
  '/',
  validateReview,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const { review } = req.body
    const campground = await Campground.findById(id)
    const newReview = new Review(review)
    campground.reviews.push(newReview)
    await newReview.save()
    await campground.save()
    req.flash('success', 'Review created!')
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

//====================================== DELETE ROUTE
router.delete(
  '/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review deleted.')
    res.redirect(`/campgrounds/${id}`)
  })
)

module.exports = router
