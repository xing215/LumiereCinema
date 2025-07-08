const Snack = require('../models/Snack.js');

/**
 * @desc    Thêm một snack hoàn toàn mới
 * @route   POST /api/admin/snacks
 * @access  Administrator
 */
const addSnack = async (req, res) => {
    try {
        const { shortname, name, description, imageURL, price, discountedPrice, stock, isHidden } = req.body;

        // Kiểm tra shortname đã tồn tại chưa (unique)
        const existing = await Snack.findOne({ shortname: shortname.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: 'Shortname đã tồn tại.' });
        }

        const newSnack = new Snack({
            shortname: shortname.toUpperCase(),
            name,
            description,
            imageURL,
            price,
            discountedPrice,
            stock,
            isHidden
        });

        await newSnack.save();

        res.status(201).json({ message: 'Thêm snack thành công.', snack: newSnack });
    } catch (error) {
        console.error('Add Snack Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

/**
 * @desc    Cập nhật thông tin snack
 * @route   PATCH /api/admin/snacks/:snackId
 * @access  Administrator
 */
const updateSnack = async (req, res) => {
    try {
        const { snackId } = req.params;
        const updateData = req.body;

        if (updateData.shortname) {
        updateData.shortname = updateData.shortname.toUpperCase();
        }

        const updated = await Snack.findByIdAndUpdate(snackId, { $set: updateData }, { new: true, runValidators: true });

        if (!updated) {
            return res.status(404).json({ message: 'Không tìm thấy snack.' });
        }

        res.status(200).json({ message: 'Cập nhật snack thành công.', snack: updated });
    } catch (error) {
        console.error('Update Snack Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

/**
 * @desc    Xóa một snack khỏi hệ thống
 * @route   DELETE /api/admin/snacks/:snackId
 * @access  Administrator
 */
const deleteSnack = async (req, res) => {
    try {
        const { snackId } = req.params;

        const deleted = await Snack.findByIdAndDelete(snackId);
        if (!deleted) {
            return res.status(404).json({ message: 'Không tìm thấy snack để xoá.' });
        }

        res.status(200).json({ message: 'Snack đã được xoá.', snack: deleted });
    } catch (error) {
        console.error('Delete Snack Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

module.exports = {
  addSnack,
  updateSnack,
  deleteSnack
};
