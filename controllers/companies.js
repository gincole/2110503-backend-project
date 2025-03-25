const Company = require('../models/Company.js');
const Booking = require('../models/Booking.js');

// @desc    Get all companies
// @route   GET /api/v1/companies
// @access  Public
exports.getCompanies = async (req,res,next) => {
    let query;

    // Copy req.query
    const reqQuery = {...req.query};

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    // Create query string
    let queryStr = JSON.stringify(req.query);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

    // Finding resource
    query = Company.find(JSON.parse(queryStr)).populate('bookings');

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;

    try {
        const total = await Company.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // Executing query
        const companies = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page+1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page-1,
                limit
            }
        }

        res.status(200).json({success:true, count:companies.length, pagination, data:companies});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

// @desc    Get single company
// @route   GET /api/v1/companies/:id
// @access  Public
exports.getCompany = async (req,res,next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data:company});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

// @desc    Create new company
// @route   POST /api/v1/companies
// @access  Private
exports.createCompany = async (req,res,next) => {
    try {
        console.log(req.body)
        const company = await Company.create(req.body);
        console.log("ffef")
        res.status(201).json({success:true, data:company}); 
    } catch (error) {
        console.log(error.message)
    }
    
};

// @desc    Update new company
// @route   PUT /api/v1/companies/:id
// @access  Private
exports.updateCompany = async (req,res,next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!company) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data:company});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

// @desc    Delete new company
// @route   DELETE /api/v1/companies/:id
// @access  Private
exports.deleteCompany = async (req,res,next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({success:false, message:`Company not found with id of ${req.params.id}`});
        }

        await Booking.deleteMany({company:req.params.id});
        await Company.deleteOne({_id:req.params.id});

        res.status(200).json({success:true, data:{}});
    } catch(err) {
        res.status(400).json({success:false});
    }
};