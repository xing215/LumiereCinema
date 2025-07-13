const SnackTicket = require('../models/SnackTicket');
const Snack = require('../models/Snack');
const Promotion = require('../models/Promotion');
const User = require('../models/User'); 
const Branch = require('../models/Branch'); 


// ======= SUB FUNCTIONS =======

// Kiểm tra dữ liệu đầu vào
const validateRequestData = async ({ customer, noLoginCustomerInfo, branch, snackList, seller }) => {
  let user = null;

  if (customer) {
    user = await User.findById(customer);
    if (!user) throw { status: 404, message: 'Customer not found.' };
    if (user.isLocked) throw { status: 403, message: 'Customer account is locked.' };
  }

  if (!customer && !noLoginCustomerInfo) {
    throw { status: 400, message: 'Customer information is required.' };
  }

  if (!branch || !snackList || snackList.length === 0) {
    throw { status: 400, message: 'Missing required fields.' };
  }

  const branchData = await Branch.findById(branch);
  if (!branchData) throw { status: 404, message: 'Branch not found.' };

  if (seller) {
    const staff = await User.findById(seller);
    if (!staff || !staff.roles.includes('cashier')) {
      throw { status: 400, message: 'Invalid seller.' };
    }
  }

  return { user, branchData };
};

// Tính tổng tiền và cập nhật tồn kho
const calculateTotalAndUpdateStock = async (snackList, branchId) => {
  let total = 0;
  const validatedSnackList = [];

  for (const item of snackList) {
    const snack = await Snack.findOne({ _id: item.snack, branch: branchId });
    if (!snack || snack.isHidden) {
      throw { status: 404, message: `Snack ${item.snack} not found or hidden.` };
    }

    if (snack.stock < item.quantity) {
      throw { status: 400, message: `Not enough stock for snack: ${snack.name}` };
    }

    const price = snack.discountedPrice || snack.price;
    total += price * item.quantity;

    validatedSnackList.push({
      snack: snack._id,
      quantity: item.quantity,
      priceAtPurchase: price,
    });

    snack.stock -= item.quantity;
    await snack.save();
  }

  return { total, validatedSnackList };
};

// Áp dụng khuyến mãi và điểm thành viên
const applyDiscounts = async ({ user, promotionCode, total }) => {
  let updatedTotal = total;
  let appliedPromotion = null;

  if (user && user.loyaltyRank?.defaultDiscountRate) {
    updatedTotal -= user.loyaltyRank.defaultDiscountRate / 100 * updatedTotal;
  }

  if (promotionCode) {
    const promo = await Promotion.findOne({ promotionCode: promotionCode, isActive: true });
    const now = new Date();

    if (
      !promo || promo.startDate > now || promo.endDate < now ||
      promo.appliedProduct !== 'Snack' || updatedTotal < promo.minimumSpend
    ) {
      throw { status: 400, message: 'Invalid or inapplicable promotion.' };
    }

    if (promo.remainingUse !== null && promo.remainingUse <= 0) {
      throw { status: 400, message: 'Promotion has no remaining uses.' };
    }

    if (promo.appliedLoyaltyRank && !user) {
      throw { status: 400, message: 'Promotion requires a customer.' };
    }

    if (promo.appliedLoyaltyRank && user.loyaltyRank.rank !== promo.appliedLoyaltyRank) {
      throw { status: 400, message: 'Promotion not applicable for your loyalty rank.' };
    }

    const discount = Math.min(updatedTotal * promo.discountRate / 100.0, promo.maximumDiscount);
    updatedTotal -= discount;

    if (promo.remainingUse !== null) {
      promo.remainingUse -= 1;
      await promo.save();
    }

    appliedPromotion = promo._id;
  }

  return { total: updatedTotal, appliedPromotion };
};

const createTicket = async (req, res) => {
  try {
    const isSnack = req.baseUrl.includes('/snacks');
    const isMovie = req.baseUrl.includes('/movies');

    if (isSnack) {
      const { branch, customer, noLoginCustomerInfo, snackList, promotionCode, seller } = req.body;

      // ===== Kiểm tra dữ liệu =====
      const { user, branchData } = await validateRequestData({ customer, noLoginCustomerInfo, branch, snackList, seller });

      // ===== Tính tổng tiền và cập nhật kho =====
      const { total: baseTotal, validatedSnackList } = await calculateTotalAndUpdateStock(snackList, branchData._id);

      // ===== Giảm giá =====
      const { total: finalTotal, appliedPromotion } = await applyDiscounts({ user, promotionCode: promotionCode, total: baseTotal });

      // ===== Cộng điểm nếu có login =====
      if (user) {
        user.addLunarPointsFromPurchase(finalTotal);
        await user.save();
      }

      // ===== Lưu vé =====
      const ticket = new SnackTicket({
        branch,
        snackList: validatedSnackList,
        promotion: appliedPromotion,
        total: finalTotal,
        ...(seller && { seller }),
        ...(customer ? { customer } : { noLoginCustomerInfo }),
      });

      await ticket.save();
      return res.status(201).json({ message: 'Snack ticket created successfully.', ticket });
    }

    if (isMovie) {
      return res.status(501).json({ message: 'MovieTicket creation not implemented yet.' });
    }

    return res.status(400).json({ message: 'Unknown ticket type in URL.' });
  } catch (error) {
    console.error('Create Ticket Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Failed to create ticket.';
    return res.status(status).json({ message });
  }
};



// ======= GET TICKET BY CODE =======
const getTicketByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const isSnack = req.baseUrl.includes('/snacks');
    const isMovie = req.baseUrl.includes('/movies');

    if (isSnack) {
      const ticket = await SnackTicket.findOne({ snackTicketCode: code })
        .populate('customer')
        .populate('branch')
        .populate('snackList.snack')
        .populate('promotion');
      if (!ticket) {
        return res.status(404).json({ message: 'Snack ticket not found.' });
      }

      return res.status(200).json(ticket);
    }

    if (isMovie) {
      // TODO: Thêm xử lý cho MovieTicket nếu có
      return res.status(501).json({ message: 'Movie ticket fetching not implemented yet.' });
    }

    return res.status(400).json({ message: 'Unknown ticket type in URL.' });
  } catch (error) {
    console.error('Get Ticket By Code Error:', error);
    return res.status(500).json({ message: 'Failed to fetch ticket by code.' });
  }
};

// ======= GET TICKET LIST BY TIME =======
// const getTicketListByTime = async (req, res) => {
//   try {
//     const { from, to, ticketType } = req.query;

//     if (ticketType === 'Snack') {
//       const tickets = await SnackTicket.find({
//         createdAt: { $gte: new Date(from), $lte: new Date(to) },
//         ticketType: 'Snack',
//       });

//       return res.status(200).json(tickets);
//     }

//     if (ticketType === 'Movie') {
//       // TODO: Query from MovieTicket collection
//       return res.status(501).json({ message: 'MovieTicket query not implemented yet.' });
//     }

//     return res.status(400).json({ message: 'Invalid or missing ticketType.' });
//   } catch (error) {
//     console.error('Get Ticket List Error:', error);
//     return res.status(500).json({ message: 'Failed to fetch tickets.' });
//   }
// };

// ======= GET ALL TICKET =======
const getAllTickets = async (req, res) => {
  try {
    const isSnack = req.baseUrl.includes('/snacks');
    const isMovie = req.baseUrl.includes('/movies');
    if (isSnack) {
      const tickets = await SnackTicket.find()
        .populate('customer')
        .populate('branch')
        .populate('snackList.snack')
        .populate('promotion');
      return res.status(200).json(tickets);
    }
    if (isMovie) {
      // TODO: Thêm xử lý cho MovieTicket nếu có
      return res.status(501).json({ message: 'Movie ticket fetching not implemented yet.' });
    }
    return res.status(400).json({ message: 'Unknown ticket type in URL.' });

  } catch (error) {
    console.error('Get All Tickets Error:', error);
    return res.status(500).json({ message: 'Failed to fetch all tickets.' });
  }
};


// // ======= CHECK-IN TICKET =======
// const checkInTicket = async (req, res) => {
//   try {
//     const { ticketId } = req.params;

//     const ticket = await SnackTicket.findById(ticketId);
//     if (!ticket || ticket.ticketType !== 'Snack') {
//       // TODO: Check in MovieTicket
//       return res.status(404).json({ message: 'Snack ticket not found.' });
//     }

//     if (ticket.status === 'CheckedIn') {
//       return res.status(400).json({ message: 'Ticket already checked in.' });
//     }

//     if (ticket.status === 'Cancelled') {
//       return res.status(400).json({ message: 'Cannot check-in a cancelled ticket.' });
//     }

//     ticket.status = 'CheckedIn';
//     await ticket.save();

//     return res.status(200).json({ message: 'Ticket checked in successfully.', ticket });
//   } catch (error) {
//     console.error('Check-in Error:', error);
//     return res.status(500).json({ message: 'Failed to check-in ticket.' });
//   }
// };


// // ======= MAKE TICKET VALID AGAIN =======
// const makeTicketValid = async (req, res) => {
//   try {
//     const { ticketId } = req.params;

//     const ticket = await SnackTicket.findById(ticketId);
//     if (!ticket || ticket.ticketType !== 'Snack') {
//       return res.status(404).json({ message: 'Snack ticket not found.' });
//     }

//     if (ticket.status !== 'Cancelled') {
//       return res.status(400).json({ message: 'Only cancelled tickets can be made valid.' });
//     }

//     ticket.status = 'Confirmed';
//     await ticket.save();

//     return res.status(200).json({ message: 'Ticket revalidated successfully.', ticket });
//   } catch (error) {
//     console.error('Make Valid Error:', error);
//     return res.status(500).json({ message: 'Failed to revalidate ticket.' });
//   }
// };


// // ======= UPDATE TICKET =======
// const updateTicket = async (req, res) => {
//   try {
//     const { ticketId } = req.params;

//     const ticket = await SnackTicket.findByIdAndUpdate(
//       ticketId,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     if (!ticket || ticket.ticketType !== 'Snack') {
//       return res.status(404).json({ message: 'Snack ticket not found.' });
//     }

//     return res.status(200).json({ message: 'Ticket updated successfully.', ticket });
//   } catch (error) {
//     console.error('Update Error:', error);
//     return res.status(500).json({ message: 'Failed to update ticket.' });
//   }
// };


module.exports = {
  createTicket,
  getTicketByCode,
  getAllTickets,
  // getTicketListByTime,
  // checkInTicket,
  // makeTicketValid,
  // updateTicket
};
