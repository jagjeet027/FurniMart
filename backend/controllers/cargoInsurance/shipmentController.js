import { Shipment } from '../../models/cargo/Shipment.js';

// Search shipments
export const searchShipments = async (req, res) => {
  try {
    const {
      departureCountry,
      departurePort,
      arrivalCountry,
      arrivalPort,
      cargoType,
      transportMode,
    } = req.query;

    let filter = {};

    if (departurePort) {
      filter['departureLocation.port'] = departurePort;
      filter['departureLocation.country'] = departureCountry;
    }

    if (arrivalPort) {
      filter['arrivalLocation.port'] = arrivalPort;
      filter['arrivalLocation.country'] = arrivalCountry;
    }

    if (cargoType) filter.cargoType = cargoType;
    if (transportMode) filter.transportMode = transportMode;

    filter.status = { $in: ['active', 'quoted'] };

    const shipments = await Shipment.find(filter)
      .populate('userId', 'name email phone')
      .exec();

    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create shipment
export const createShipment = async (req, res) => {
  try {
    const {
      departureCountry,
      departurePort,
      arrivalCountry,
      arrivalPort,
      cargoType,
      cargoValue,
      weight,
      transportMode,
      expectedDeparture,
      expectedArrival,
      insuranceType,
      description,
    } = req.body;

    const shipment = await Shipment.create({
      userId: req.user._id,
      departureLocation: {
        country: departureCountry,
        port: departurePort,
      },
      arrivalLocation: {
        country: arrivalCountry,
        port: arrivalPort,
      },
      cargoType,
      cargoValue,
      weight,
      transportMode,
      expectedDeparture,
      expectedArrival,
      insuranceType,
      description,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get shipment by ID
export const getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).populate(
      'userId',
      'name email phone'
    );

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
