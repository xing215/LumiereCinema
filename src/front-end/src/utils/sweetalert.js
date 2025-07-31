import Swal from 'sweetalert2';

// Custom SweetAlert2 configurations with your project's color scheme
const customSwalOptions = {
    // Custom styling to match your project theme
    customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        content: 'swal-custom-content',
        confirmButton: 'swal-custom-confirm',
        cancelButton: 'swal-custom-cancel',
        actions: 'swal-custom-actions'
    },
    // Remove the didOpen and didClose to prevent issues
    backdrop: true,
    allowOutsideClick: true,
    allowEscapeKey: true
};

// Function to hide other modals
const hideOtherModals = () => {
    const modals = document.querySelectorAll('[role="dialog"], .modal, [data-modal]');
    modals.forEach(modal => {
        if (!modal.classList.contains('swal2-container')) {
            modal.style.display = 'none';
            modal.setAttribute('data-swal-hidden', 'true');
        }
    });
};

// Function to show other modals back
const showOtherModals = () => {
    const hiddenModals = document.querySelectorAll('[data-swal-hidden="true"]');
    hiddenModals.forEach(modal => {
        modal.style.display = '';
        modal.removeAttribute('data-swal-hidden');
    });
};

// Inject custom CSS for SweetAlert2
const injectCustomCSS = () => {
    if (document.getElementById('swal-custom-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'swal-custom-styles';
    style.textContent = `
        .swal2-container {
            z-index: 9999 !important;
        }
        
        .swal-custom-popup {
            font-family: 'Unbounded', sans-serif !important;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%) !important;
            border: 2px solid rgba(139, 92, 246, 0.3) !important;
            border-radius: 16px !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 
                        inset 0 0 50px 3px rgba(155, 47, 255, 0.1) !important;
            width: 90vw !important;
            max-width: 500px !important;
            min-width: 300px !important;
            padding: 1.5rem !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .swal-custom-popup {
                width: 95vw !important;
                max-width: 350px !important;
                min-width: 280px !important;
                padding: 1rem !important;
                border-radius: 12px !important;
            }
        }
        
        /* Small mobile */
        @media (max-width: 480px) {
            .swal-custom-popup {
                width: 98vw !important;
                max-width: 320px !important;
                min-width: 260px !important;
                padding: 0.875rem !important;
                border-radius: 8px !important;
            }
        }
        
        .swal-custom-title {
            color: #475569 !important;
            font-family: 'Unbounded', sans-serif !important;
            font-weight: 600 !important;
            text-shadow: 0 0 10px rgba(139, 92, 246, 0.2) !important;
            font-size: 1.25rem !important;
            line-height: 1.4 !important;
            margin-bottom: 1rem !important;
        }
        
        /* Mobile title sizing */
        @media (max-width: 768px) {
            .swal-custom-title {
                font-size: 1.125rem !important;
                margin-bottom: 0.75rem !important;
            }
        }
        
        @media (max-width: 480px) {
            .swal-custom-title {
                font-size: 1rem !important;
                margin-bottom: 0.5rem !important;
            }
        }
        
        .swal-custom-content {
            color: #64748b !important;
            font-family: 'Unbounded', sans-serif !important;
            font-weight: 400 !important;
            font-size: 0.875rem !important;
            line-height: 1.5 !important;
            margin-bottom: 1.5rem !important;
        }
        
        /* Mobile content sizing */
        @media (max-width: 768px) {
            .swal-custom-content {
                font-size: 0.8125rem !important;
                margin-bottom: 1.25rem !important;
            }
        }
        
        @media (max-width: 480px) {
            .swal-custom-content {
                font-size: 0.75rem !important;
                margin-bottom: 1rem !important;
            }
        }
        
        .swal-custom-confirm {
            background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%) !important;
            border: none !important;
            border-radius: 8px !important;
            font-family: 'Unbounded', sans-serif !important;
            font-weight: 600 !important;
            color: #4338ca !important;
            box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.2) !important;
            transition: all 0.3s ease !important;
            padding: 0.75rem 1.5rem !important;
            font-size: 0.875rem !important;
            min-width: 100px !important;
        }
        
        /* Mobile button sizing */
        @media (max-width: 768px) {
            .swal-custom-confirm {
                padding: 0.625rem 1.25rem !important;
                font-size: 0.8125rem !important;
                min-width: 80px !important;
            }
        }
        
        @media (max-width: 480px) {
            .swal-custom-confirm {
                padding: 0.5rem 1rem !important;
                font-size: 0.75rem !important;
                min-width: 70px !important;
            }
        }
        
        .swal-custom-confirm:hover {
            background: linear-gradient(135deg, #a5b4fc 0%, #8b5cf6 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.3) !important;
        }
        
        .swal-custom-cancel {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            font-family: 'Unbounded', sans-serif !important;
            font-weight: 600 !important;
            color: #64748b !important;
            box-shadow: 0 4px 14px 0 rgba(107, 114, 128, 0.1) !important;
            transition: all 0.3s ease !important;
            padding: 0.75rem 1.5rem !important;
            font-size: 0.875rem !important;
            min-width: 100px !important;
        }
        
        /* Mobile cancel button sizing */
        @media (max-width: 768px) {
            .swal-custom-cancel {
                padding: 0.625rem 1.25rem !important;
                font-size: 0.8125rem !important;
                min-width: 80px !important;
            }
        }
        
        @media (max-width: 480px) {
            .swal-custom-cancel {
                padding: 0.5rem 1rem !important;
                font-size: 0.75rem !important;
                min-width: 70px !important;
            }
        }
        
        .swal-custom-cancel:hover {
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px 0 rgba(107, 114, 128, 0.2) !important;
        }
        
        .swal-custom-actions {
            gap: 12px !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
        }
        
        /* Mobile actions spacing */
        @media (max-width: 480px) {
            .swal-custom-actions {
                gap: 8px !important;
            }
        }
        
        .swal2-loading {
            border-color: rgba(139, 92, 246, 0.1) rgba(139, 92, 246, 0.1) rgba(139, 92, 246, 0.1) #c7d2fe !important;
        }
        
        .swal2-progress-steps .swal2-progress-step {
            background: #c7d2fe !important;
        }
        
        .swal2-progress-steps .swal2-progress-step-line {
            background: rgba(139, 92, 246, 0.2) !important;
        }
    `;
    document.head.appendChild(style);
};

// Initialize custom CSS when the module loads
injectCustomCSS();

// Loading alerts
export const showLoading = (title = 'Processing...', text = '') => {
    return Swal.fire({
        ...customSwalOptions,
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

// Success alerts
export const showSuccess = (title = 'Success!', text = '', timer = 3000) => {
    return Swal.fire({
        ...customSwalOptions,
        icon: 'success',
        title,
        text,
        timer,
        showConfirmButton: timer ? false : true,
        timerProgressBar: timer ? true : false,
        iconColor: '#10b981'
    });
};

// Error alerts
export const showError = (title = 'Error!', text = '') => {
    return Swal.fire({
        ...customSwalOptions,
        icon: 'error',
        title,
        text,
        confirmButtonText: 'OK',
        iconColor: '#ef4444'
    });
};

// Warning alerts
export const showWarning = (title = 'Warning!', text = '') => {
    return Swal.fire({
        ...customSwalOptions,
        icon: 'warning',
        title,
        text,
        confirmButtonText: 'OK',
        iconColor: '#f59e0b'
    });
};

// Info alerts
export const showInfo = (title = 'Information', text = '') => {
    return Swal.fire({
        ...customSwalOptions,
        icon: 'info',
        title,
        text,
        confirmButtonText: 'OK',
        iconColor: '#3b82f6'
    });
};

// Confirmation dialogs
export const showConfirmation = (title = 'Are you sure?', text = '', confirmText = 'Yes', cancelText = 'No') => {
    return Swal.fire({
        ...customSwalOptions,
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        iconColor: '#8b5cf6'
    });
};

// Movie Management Specific Alerts

// Upload Excel related alerts
export const showUploadLoading = () => {
    return showLoading('Validating Movies...', 'Please wait while we validate your Excel file and check for duplicates');
};

export const showUploadResults = (successCount = 0, errorCount = 0, errors = []) => {
    // Ensure any previous loading state is cleared
    Swal.close();
    
    const hasErrors = errorCount > 0;
    
    if (hasErrors) {
        const title = 'Validation Failed';
        let text = '';
        
        if (successCount > 0) {
            text += `✅ Successfully validated: ${successCount} movies\n`;
        }
        text += `❌ Failed validation: ${errorCount} movies\n\n`;
        
        if (errors.length > 0) {
            text += 'Common errors found:\n';
            text += errors.slice(0, 3).map(error => `• ${error}`).join('\n');
            if (errors.length > 3) {
                text += `\n• ... and ${errors.length - 3} more errors`;
            }
        }
        
        return Swal.fire({
            ...customSwalOptions,
            title,
            text,
            icon: 'warning',
            confirmButtonText: 'OK',
            iconColor: '#f59e0b'
        });
    } else {
        return Swal.fire({
            ...customSwalOptions,
            title: 'Validation Successful!',
            text: `${successCount} movies are ready for review.\n\nClick OK to proceed to review mode.`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            iconColor: '#10b981'
        });
    }
};

export const showUploadConfirmation = (movieCount = 0) => {
    // Ensure any previous loading state is cleared
    Swal.close();
    
    const title = 'Validation Successful!';
    const text = movieCount === 1 
        ? '1 movie is ready for review.\n\nClick OK to proceed to review mode where you can make final edits before adding to the database.'
        : `${movieCount} movies are ready for review.\n\nClick OK to proceed to review mode where you can make final edits before adding to the database.`;
    
    return Swal.fire({
        ...customSwalOptions,
        title,
        text,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Proceed to Review',
        cancelButtonText: 'Cancel',
        iconColor: '#10b981',
        showLoaderOnConfirm: false,
        showLoaderOnDeny: false
    });
};

export const showAddingMovies = (count = 0) => {
    const text = count === 1 
        ? 'Please wait while we add the movie to the database' 
        : `Please wait while we add ${count} movies to the database`;
        
    return showLoading('Adding Movies...', text);
};

export const showMoviesAdded = (count = 0) => {
    const title = count === 1 ? 'Movie Added Successfully!' : 'Movies Added Successfully!';
    const text = count === 1 
        ? 'The movie has been added to the database successfully' 
        : `${count} movies have been added to the database successfully`;
        
    return Swal.fire({
        ...customSwalOptions,
        icon: 'success',
        title,
        text,
        confirmButtonText: 'Great!',
        iconColor: '#10b981',
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: true
    });
};

export const showUploadCancelled = () => {
    return Swal.fire({
        ...customSwalOptions,
        icon: 'info',
        title: 'Upload Cancelled',
        text: 'The movie upload process has been cancelled successfully. No movies were added to the database.',
        iconColor: '#3b82f6',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
    });
};

// Delete related alerts
export const showDeleteConfirmation = (movieCount = 1) => {
    const text = movieCount === 1 
        ? 'This action cannot be undone!' 
        : `This will delete ${movieCount} movies. This action cannot be undone!`;
        
    return showConfirmation(
        'Delete Movie(s)?',
        text,
        'Delete',
        'Cancel'
    );
};

export const showDeletingMovies = (movieCount = 1) => {
    const text = movieCount === 1 
        ? 'Please wait while we delete the movie' 
        : `Please wait while we delete ${movieCount} movies`;
        
    return showLoading('Deleting Movies...', text);
};

export const showMoviesDeleted = (movieCount = 1) => {
    const text = movieCount === 1 
        ? 'Movie has been deleted successfully' 
        : `${movieCount} movies have been deleted successfully`;
        
    return showSuccess('Movies Deleted!', text);
};

// Active/Hide movie alerts
export const showProcessingVisibility = () => {
    return showLoading('Processing...', 'Please wait while we update movie visibility');
};

export const showMovieShown = (movieTitle = 'Movie') => {
    return showSuccess('Movie Shown!', `${movieTitle} is now visible to customers`);
};

export const showMovieHidden = (movieTitle = 'Movie') => {
    return showSuccess('Movie Hidden!', `${movieTitle} is now hidden from customers`);
};

// Generic upload error
export const showUploadError = (error = 'Unknown error occurred') => {
    return Swal.fire({
        ...customSwalOptions,
        icon: 'error',
        title: 'Operation Failed',
        text: `❌ ${error}\n\nPlease check your data and try again.`,
        confirmButtonText: 'OK',
        iconColor: '#ef4444'
    });
};

// Close current SweetAlert
export const closeSwal = () => {
    try {
        // Hide loading if it's showing
        Swal.hideLoading();
        // Close the modal
        Swal.close();
        showOtherModals(); // Ensure other modals are shown back
    } catch (error) {
        // Fallback to just close
        Swal.close();
        showOtherModals();
    }
};

// Force close all SweetAlert instances and show modals
export const forceCloseSwal = () => {
    try {
        Swal.close();
        // Remove any stuck swal containers
        const swalContainers = document.querySelectorAll('.swal2-container');
        swalContainers.forEach(container => {
            container.remove();
        });
        showOtherModals();
    } catch (error) {
        console.warn('Error force closing SweetAlert:', error);
    }
};

// Check if SweetAlert is currently open
export const isSwalOpen = () => {
    return Swal.isVisible();
};

export default {
    showLoading,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showUploadLoading,
    showUploadResults,
    showUploadConfirmation,
    showAddingMovies,
    showMoviesAdded,
    showUploadCancelled,
    showDeleteConfirmation,
    showDeletingMovies,
    showMoviesDeleted,
    showProcessingVisibility,
    showMovieShown,
    showMovieHidden,
    showUploadError,
    closeSwal,
    forceCloseSwal,
    isSwalOpen
};