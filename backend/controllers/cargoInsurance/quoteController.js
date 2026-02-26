import { Quote } from '../../models/cargo/quote.js';

// Get quotes for shipment
export const getQuotesForShipment = async (req, res) => {
  try {
    const quotes = await Quote.find({
      shipmentId: req.params.shipmentId,
    })
      .populate('companyId', 'name rating email phone')
      .populate('userId', 'name email')
      .exec();

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create quote
export const createQuote = async (req, res) => {
  try {
    const {
      shipmentId,
      companyId,
      premiumAmount,
      coverageAmount,
      deductible,
      validUntil,
      termsAndConditions,
    } = req.body;

    const quote = await Quote.create({
      shipmentId,
      companyId,
      userId: req.user._id,
      premium: {
        amount: premiumAmount,
        currency: 'INR',
      },
      coverage: {
        amount: coverageAmount,
      },
      deductible,
      validUntil,
      termsAndConditions,
      status: 'pending',
    });

    // Increment company quotes count
    await Company.findByIdAndUpdate(companyId, {
      $inc: { quotesGenerated: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Accept quote
export const acceptQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quote accepted successfully',
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject quote
export const rejectQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quote rejected successfully',
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};