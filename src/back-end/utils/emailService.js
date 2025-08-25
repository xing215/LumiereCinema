const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

/**
 * Email Service for sending ticket confirmation emails
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize nodemailer transporter
     */
    initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    /**
     * Generate QR code HTTP URL (email-compatible)
     * @param {string} ticketCode - The ticket code to encode
     * @returns {Promise<string>} HTTP URL to QR code image
     */
    async generateQRCode(ticketCode) {
        try {
            // Use the backend API URL to serve QR codes
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            const qrUrl = `${backendUrl}/api/qr?code=${encodeURIComponent(ticketCode)}&size=256`;

            console.log('QR code URL generated successfully for:', ticketCode);
            console.log('QR code URL:', qrUrl);
            return qrUrl;
        } catch (error) {
            console.error('Error generating QR code URL:', error);
            // Return a fallback QR code URL
            const fallbackUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/qr?code=${encodeURIComponent(ticketCode)}&size=256`;
            console.log('Using fallback QR URL:', fallbackUrl);
            return fallbackUrl;
        }
    }

    /**
     * Send movie ticket confirmation email
     * @param {Object} params - Email parameters
     * @param {string} params.email - Recipient email
     * @param {string} params.fullname - Customer name
     * @param {string} params.movie - Movie title
     * @param {string} params.datetime - Show date and time
     * @param {string} params.seat - Seat numbers
     * @param {string} params.screen - Screen name
     * @param {string} params.cinema - Cinema branch name
     * @param {string} params.cinemaAddress - Cinema address
     * @param {string} params.ticketCode - Ticket code
     * @returns {Promise<boolean>} Success status
     */
    async sendMovieTicketEmail(params) {
        try {
            const { email, fullname, movie, datetime, seat, screen, cinema, cinemaAddress, ticketCode } = params;

            console.log('Generating QR code for movie ticket:', ticketCode);
            // Generate QR code
            const ticketQr = await this.generateQRCode(ticketCode);
            console.log('QR code URL generated:', ticketQr);

            // Read and populate email template
            const templatePath = path.join(__dirname, '../templates/ticketMovie.html');
            let emailHtml = fs.readFileSync(templatePath, 'utf8');

            // Replace template variables
            emailHtml = emailHtml.replace(/\{\{fullname\}\}/g, fullname);
            emailHtml = emailHtml.replace(/\{\{movie\}\}/g, movie);
            emailHtml = emailHtml.replace(/\{\{datetime\}\}/g, datetime);
            emailHtml = emailHtml.replace(/\{\{seat\}\}/g, seat);
            emailHtml = emailHtml.replace(/\{\{screen\}\}/g, screen);
            emailHtml = emailHtml.replace(/\{\{cinema\}\}/g, cinema);
            emailHtml = emailHtml.replace(/\{\{cinemaAddress\}\}/g, cinemaAddress);
            emailHtml = emailHtml.replace(/\{\{ticketCode\}\}/g, ticketCode);
            emailHtml = emailHtml.replace(/\{\{ticketQr\}\}/g, ticketQr);

            console.log('Template variables replaced. QR code in HTML:', emailHtml.includes(ticketQr) ? 'YES' : 'NO');

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Movie Ticket Confirmation - ${movie} | Lumiere Cinema`,
                html: emailHtml,
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Movie ticket email sent successfully to ${email}`);
            return true;
        } catch (error) {
            console.error('Error sending movie ticket email:', error);
            throw new Error('Failed to send movie ticket email');
        }
    }

    /**
     * Send snack ticket confirmation email
     * @param {Object} params - Email parameters
     * @param {string} params.email - Recipient email
     * @param {string} params.fullname - Customer name
     * @param {string} params.snackList - Formatted snack list
     * @param {string} params.cinema - Cinema branch name
     * @param {string} params.cinemaAddress - Cinema address
     * @param {string} params.ticketCode - Snack ticket code
     * @returns {Promise<boolean>} Success status
     */
    async sendSnackTicketEmail(params) {
        try {
            const { email, fullname, snackList, cinema, cinemaAddress, ticketCode } = params;

            console.log('Generating QR code for snack ticket:', ticketCode);
            // Generate QR code
            const ticketQr = await this.generateQRCode(ticketCode);
            console.log('QR code URL generated:', ticketQr);

            // Read and populate email template
            const templatePath = path.join(__dirname, '../templates/ticketSnack.html');
            let emailHtml = fs.readFileSync(templatePath, 'utf8');

            // Replace template variables
            emailHtml = emailHtml.replace(/\{\{fullname\}\}/g, fullname);
            emailHtml = emailHtml.replace(/\{\{snackList\}\}/g, snackList);
            emailHtml = emailHtml.replace(/\{\{cinema\}\}/g, cinema);
            emailHtml = emailHtml.replace(/\{\{cinemaAddress\}\}/g, cinemaAddress);
            emailHtml = emailHtml.replace(/\{\{ticketCode\}\}/g, ticketCode);
            emailHtml = emailHtml.replace(/\{\{ticketQr\}\}/g, ticketQr);

            console.log('Template variables replaced. QR code in HTML:', emailHtml.includes(ticketQr) ? 'YES' : 'NO');

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Snack Order Confirmation - ${ticketCode} | Lumiere Cinema`,
                html: emailHtml,
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Snack ticket email sent successfully to ${email}`);
            return true;
        } catch (error) {
            console.error('Error sending snack ticket email:', error);
            throw new Error('Failed to send snack ticket email');
        }
    }

    /**
     * Format snack list for email display
     * @param {Array} snackList - Array of snack objects
     * @returns {string} Formatted snack list HTML
     */
    formatSnackList(snackList) {
        if (!snackList || snackList.length === 0) {
            return 'No snacks ordered';
        }

        return snackList
            .map(item => {
                const snackName = item.snack?.name || item.name || 'Unknown Snack';
                const quantity = item.quantity || 1;
                return `${snackName} x${quantity}`;
            })
            .join(', ');
    }

    /**
     * Format seat numbers for email display
     * @param {Array} seats - Array of seat strings
     * @returns {string} Formatted seat list
     */
    formatSeatList(seats) {
        if (!seats || seats.length === 0) {
            return 'No seats assigned';
        }
        return seats.join(', ');
    }

    /**
     * Format date and time for email display
     * @param {Date} startTime - Schedule start time
     * @returns {string} Formatted date and time
     */
    formatDateTime(startTime) {
        if (!startTime) return 'Time not specified';

        const date = new Date(startTime);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh',
        };

        return date.toLocaleDateString('en-US', options);
    }
}

module.exports = EmailService;
