/**
 * SweetAlert Usage Examples for TicketPurchase Component
 *
 * This file demonstrates the different types of SweetAlert popups
 * used in the enhanced TicketPurchase component
 */

import { showError, showWarning, showInfo, showSuccess, showConfirmation } from '@utils/sweetalert.js';

// ================================
// CURRENT USAGE IN TICKETPURCHASE
// ================================

// 1. Information Messages - showInfo()
const showInfoExample = () => {
    showInfo('Information Required', 'Please fill in your information before proceeding.');
};

// 2. Warning Messages - showWarning()
const showWarningExamples = () => {
    // Session expiration
    showWarning('Session Expired', 'Your session has expired. Please select your seats again.');

    // Stock adjustments
    showWarning('Stock Adjustment', 'Some snacks in your selection exceed available stock and have been adjusted.');
};

// 3. Error Messages - showError()
const showErrorExamples = () => {
    // Seat unavailability
    showError('Seats Unavailable', 'Your seat selection has been occupied by other customers. Please adjust your selection.');

    // Hold session error
    showError('Hold Session Error', 'An error occurred while holding your seats. Please try again.');

    // Stock unavailable
    showError('Stock Unavailable', 'Your snack selection exceeds available stock. Please adjust your order.');

    // General ticket creation error
    showError('Ticket Creation Failed', 'An error occurred while creating your ticket. Please try again.');
};

// ================================
// POTENTIAL FUTURE ENHANCEMENTS
// ================================

// Success notifications (for completed actions)
const showSuccessExamples = () => {
    showSuccess(
        'Seats Selected',
        'Your seats have been successfully selected.',
        3000, // Auto-close after 3 seconds
    );

    showSuccess('Ticket Created', 'Your ticket has been successfully created!');
};

// Confirmation dialogs (for critical actions)
const showConfirmationExamples = async () => {
    // Confirm leaving the purchase process
    const result = await showConfirmation('Leave Ticket Purchase?', 'Are you sure you want to leave? Your selection will be lost.', 'Yes, Leave', 'Stay');

    if (result.isConfirmed) {
        // User confirmed - navigate away
        console.log('User confirmed leaving');
    }

    // Confirm clearing selection
    const clearResult = await showConfirmation('Clear Selection?', 'This will clear all your selected seats and snacks.', 'Clear All', 'Cancel');

    if (clearResult.isConfirmed) {
        // Clear all selections
        console.log('Clearing all selections');
    }
};

// ================================
// COMPARISON: OLD VS NEW
// ================================

// OLD WAY (Browser Alert)
const oldAlertExample = () => {
    alert('Your session has expired. Please select your seats again.');
    // Problems:
    // - Blocks the entire page
    // - No styling customization
    // - Poor mobile experience
    // - No categorization
    // - Inconsistent with app design
};

// NEW WAY (SweetAlert)
const newAlertExample = () => {
    showWarning('Session Expired', 'Your session has expired. Please select your seats again.');
    // Benefits:
    // - Non-blocking modal
    // - Professional styling
    // - Mobile responsive
    // - Clear categorization
    // - Consistent with app theme
    // - Better accessibility
};

// ================================
// USAGE GUIDELINES
// ================================

/*
WHEN TO USE EACH TYPE:

showInfo():
- User guidance messages
- Information requirements
- Process explanations
- Non-critical notifications

showWarning():
- Session timeouts
- Automatic adjustments
- Potential issues that aren't errors
- Data modifications

showError():
- Failed operations
- Unavailable resources
- System errors
- Critical failures

showSuccess():
- Completed operations
- Successful submissions
- Confirmations of actions

showConfirmation():
- Before destructive actions
- Process confirmation
- User choice dialogs
*/

export { showInfoExample, showWarningExamples, showErrorExamples, showSuccessExamples, showConfirmationExamples, oldAlertExample, newAlertExample };
