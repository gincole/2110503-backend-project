const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image link (Google Drive URL)'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location (Google Maps link)'],
    },
    website: {
      type: String,
      required: [true, 'Please add a website link'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    district: {
      type: String,
      required: [true, 'Please add a district'],
    },
    province: {
      type: String,
      required: [true, 'Please add a province'],
    },
    postalcode: {
      type: String,
      required: [true, 'Please add a postalcode'],
      maxlength: [5, 'Postal Code can not be more than 5 digits'],
    },
    tel: {
      type: String,
      required: [true, 'Please add a telephone number'],
    },
    region: {
      type: String,
      required: [true, 'Please add a region'],
    },
    salary: {
      type: String,
      required: [true, 'Please add a salary'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Reverse populate with virtuals
CompanySchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'company',
  justOne: false,
});

module.exports = mongoose.model('Company', CompanySchema);
