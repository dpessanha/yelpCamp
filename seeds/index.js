const mongoose = require('mongoose')
const Campground = require('../models/campground')
const { places, descriptors } = require('./seedHelpers')
const cities = require('./cities')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log("Database connected.");
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let x = 0; x <= 50; x++){
    const rand1000 = Math.floor(Math.random() * 1000)
    const precision = 100; // 2 decimals
    const randomNum = Math.floor(Math.random() * (100 * precision - 1 * precision) + 1 * precision) / (1*precision);
    const camp = new Campground({
      location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit quisquam, ipsa ea cum impedit magni non dolores vero qui unde porro? Maiores, modi minus doloribus magni a unde eligendi eveniet.',
      price: randomNum
    })
    await camp.save()
  }
}

seedDB().then(() => {
  console.log('Connection Closed.')
  mongoose.connection.close()
})