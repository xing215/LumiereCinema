const mongoose = require('mongoose');
const Ticket = require('../models/Ticket'); 
const Branch = require('../models/Branch');
const { redisClient } = require('../config/redis.config');

exports.getTotalRevenue = async (req, res) => {
  const { startDate, endDate, branchId } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required.' });
  }

  if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
    return res.status(400).json({ message: 'Invalid date format.' });
  }

  if (branchId && !mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json({ message: 'Invalid branch ID.' });
  }

  const matchStage = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  if (branchId) {
    matchStage.branch = new mongoose.Types.ObjectId(branchId);
  }

  try {
    const result = await Ticket.aggregate([
      {
        $match: matchStage,
      },
      {
        $facet: {
          chartData: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$total' },
              },
            },
            { $sort: { _id: 1 } },
          ],
          summary: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalTickets: { $sum: 1 },
              },
            },
          ],
          totalMovies: [
            {
              $group: {
                _id: '$movie',
              },
            },
          ],
        },
      },
    ]);

    const chartData = result[0]?.chartData || [];
    const summary = result[0]?.summary[0] || { totalRevenue: 0, totalTickets: 0 };
    const totalMovies = result[0]?.totalMovies.length || 0;

    res.status(200).json({
      totalRevenue: summary.totalRevenue,
      totalTickets: summary.totalTickets,
      totalMovies,
      chartData,
    });
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


exports.getBranches = async (req, res) => {
  try {
    const cachedBranches = await redisClient.get('branches');
    if (cachedBranches) {
      // Cache hit
      return res.status(200).json(JSON.parse(cachedBranches));
    }

    // Cache miss - fetch from database
    const branches = await Branch.find({ isActive: true }).select('name').lean();

    await redisClient.set('branches', JSON.stringify(branches), {
      EX: 24 * 60 * 60,
    });

    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller for branch manager to get their allocated branch
exports.getBranch = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = req.user;
    if (!user || !user.branch) {
      return res.status(404).json({ message: 'No branch allocated to this user.' });
    }
    // Populate branch name
    const branch = await Branch.findById(user.branch).select('name').lean();
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }
    res.status(200).json([branch]);
  } catch (error) {
    console.error('Error fetching branch for manager:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getRevenueSummary = async (req, res) => {
  const { startDate, endDate } = req.query;
  let branchId = req.query.branchId || null;
  const user = req.user;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required.' });
  }

  if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
    return res.status(400).json({ message: 'Invalid date format.' });
  }

  if (!user || !user.roles) {
    return res.status(401).json({ error: 'Unauthorized: user info missing' });
  }

  if (!user.roles.includes('administrator')) {
    branchId = user.branch;
  }

  if (branchId && !mongoose.Types.ObjectId.isValid(branchId)) {
    return res.status(400).json({ message: 'Invalid branch ID.' });
  }

  const matchStage = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  if (branchId) {
    matchStage.branch = new mongoose.Types.ObjectId(branchId);
  }

  try {
    const result = await Ticket.aggregate([
      {
        $match: matchStage,
      },
      {
        $facet: {
          // By Date Revenue
          chartData: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$total' },
              },
            },
            { $sort: { _id: 1 } },
          ],
          // Total Revenue Summary
          summary: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalTickets: { $sum: 1 },
              },
            },
          ],
          // Total Movies
          totalMovies: [
            {
              $group: {
                _id: '$movie',
              },
            },
          ],
          // Employee Revenue
          employeeRevenue: [
            {
              $group: {
                _id: '$seller', // Group by seller (cashier)
                revenue: { $sum: '$total' },
              },
            },
            {
              $lookup: {
                from: 'users', // Assuming 'users' is the collection for employees
                localField: '_id',
                foreignField: '_id',
                as: 'employee',
              },
            },
            {
              $unwind: '$employee',
            },
            {
              $project: {
                _id: 0,
                employeeName: '$employee.name',
                revenue: 1,
              },
            },
            { $sort: { revenue: -1 } }, // Sort by revenue descending
          ],
          // Movie Revenue
          movieRevenue: [
            {
              $group: {
                _id: '$movie', // Group by movie
                revenue: { $sum: '$total' },
              },
            },
            {
              $lookup: {
                from: 'movies', // Assuming 'movies' is the collection for movies
                localField: '_id',
                foreignField: '_id',
                as: 'movie',
              },
            },
            {
              $unwind: '$movie',
            },
            {
              $project: {
                _id: 0,
                movieTitle: '$movie.title',
                revenue: 1,
              },
            },
            { $sort: { revenue: -1 } }, // Sort by revenue descending
          ],
        },
      },
    ]);

    const chartData = result[0]?.chartData || [];
    const summary = result[0]?.summary[0] || { totalRevenue: 0, totalTickets: 0 };
    const totalMovies = result[0]?.totalMovies.length || 0;
    const employeeRevenue = result[0]?.employeeRevenue || [];
    const movieRevenue = result[0]?.movieRevenue || [];

    res.status(200).json({
      byDateRevenue: chartData,
      totalRevenue: summary,
      totalMovies,
      employeeRevenue,
      movieRevenue,
    });
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};