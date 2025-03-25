const Booking = require('../models/Booking');
const Company = require('../models/Company');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Public
exports.getBookings = async (req,res,next) => {
    let query;
    // General users can see only their bookings
    if (req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id })
            .populate("company")
            .populate("user", "name email tel"); 

    } else {
        // If you are an admin, you can see all
        if (req.params.companyId) {
            console.log(req.params.companyId);
            query = Booking.find({company:req.params.companyId})
                .populate("company")
                .populate("user", "name email tel"); // ✅ เพิ่ม populate user
        } else {
            query = Booking.find()
                .populate("company")
                .populate("user", "name email tel"); // ✅ เพิ่ม populate user

        }
    }

    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch(err) {
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot find Booking"});
    }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Public
exports.getBooking = async (req,res,next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'company',
            // select: 'name description tel'
        });

        if (!booking) {
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }

        res.status(200).json({success:true, data:booking});
    } catch(err) {
        console.log(err);
        return res.status(500).json({success:false, message:'Cannot find Booking'});
    }
};

// @desc    Add booking
// @route   POST /api/v1/companies/:companyId/booking
// @access  Private
exports.addBooking = async (req,res,next) => {
    try {
        req.body.company = req.params.companyId;

        const company = await Company.findById(req.params.companyId);

        if (!company) {
            return res.status(404).json({success:false, message:`No company with the id of ${req.params.companyId}`});
        }
        console.log(req.body);

        // Add user id to req.body
        req.body.user = req.user.id;

        if (!req.body.bookingDate) {
            return res.status(400).json({ success: false, message: "Booking date is required" });
        }

        const bookingDate = new Date(req.body.bookingDate);
        const startDate = new Date("2022-05-10T00:00:00.000Z");
        const endDate = new Date("2022-05-13T23:59:59.999Z");

        if (bookingDate < startDate || bookingDate > endDate) {
            return res.status(400).json({ success: false, message: "Booking is only allowed between May 10 - 13, 2022" });
        }

        // Check for existed booking
        const existedBookings = await Booking.find({user:req.user.id});

        // If the user is not an admin, they can only create 3 booking
        if (existedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success:false, message:`The user with id ${req.user.id} has already made 3 bookings`});
        }

        // Check for duplicate booking (same user, same company, same date+time)
        const duplicateBooking = await Booking.findOne({
            user: req.user.id,
            company: req.params.companyId,
            bookingDate: req.body.bookingDate,
        });
        
        if (duplicateBooking) {
            return res.status(400).json({
            success: false,
            message: "You already booked this company at the selected time.",
            });
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({success:true, data:booking});
    } catch(err) {
        console.log(err);
        return res.status(500).json({success:false, message:'Cannot create Booking'});
    }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req,res,next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }

        // Make sure user is the booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to update this booking`});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success:true, data:booking});
    } catch(err) {
        console.log(err);
        return res.status(500).json({success:false, message:'Cannot update Booking'});
    }
};

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = async (req,res,next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({success:false, message:`No booking with the id of ${req.params.id}`});
        }

        // Make sure user is the booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to delete this booking`});
        }

        await booking.deleteOne();

        res.status(200).json({success:true, data:{}});
    } catch(err) {
        console.log(err);
        return res.status(500).json({success:false, message:'Cannot delete booking'});
    }
};