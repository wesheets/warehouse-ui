// Error handling and user feedback functionality

// Initialize error handling and user feedback
document.addEventListener('DOMContentLoaded', function() {
    initErrorHandling();
    initTabNavigation();
    initPreviewControls();
});

// Initialize error handling
function initErrorHandling() {
    // Add global error handler
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('An unexpected error occurred. Please try again.', 'error');
    });
    
    // Add form validation error handling
    const featureForm = document.getElementById('feature-form');
    if (featureForm) {
        const inputs = featureForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('invalid', function(e) {
                e.preventDefault();
                highlightInvalidField(input);
                showFieldError(input);
            });
            
            input.addEventListener('input', function() {
                if (input.validity.valid) {
                    clearFieldError(input);
                }
            });
        });
    }
    
    // Add API connection status handling
    setupApiStatusMonitoring();
}

// Initialize tab navigation
function initTabNavigation() {
    const tabs = document.querySelectorAll('.result-tab');
    if (!tabs.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.result-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Initialize preview controls
function initPreviewControls() {
    const previewImg = document.querySelector('.result-preview img');
    const zoomInBtn = document.querySelector('.preview-control-btn[title="Zoom In"]');
    const zoomOutBtn = document.querySelector('.preview-control-btn[title="Zoom Out"]');
    const resetBtn = document.querySelector('.preview-control-btn[title="Reset View"]');
    const zoomLevelText = document.querySelector('.preview-zoom-level span:last-child');
    
    if (!previewImg || !zoomInBtn || !zoomOutBtn || !resetBtn || !zoomLevelText) return;
    
    let zoomLevel = 100;
    const minZoom = 50;
    const maxZoom = 200;
    const zoomStep = 10;
    
    zoomInBtn.addEventListener('click', function() {
        if (zoomLevel < maxZoom) {
            zoomLevel += zoomStep;
            updateZoom();
        }
    });
    
    zoomOutBtn.addEventListener('click', function() {
        if (zoomLevel > minZoom) {
            zoomLevel -= zoomStep;
            updateZoom();
        }
    });
    
    resetBtn.addEventListener('click', function() {
        zoomLevel = 100;
        updateZoom();
    });
    
    function updateZoom() {
        previewImg.style.width = `${zoomLevel}%`;
        zoomLevelText.textContent = `${zoomLevel}%`;
    }
}

// Setup API status monitoring
function setupApiStatusMonitoring() {
    const apiStatus = document.querySelector('.api-status');
    if (!apiStatus) return;
    
    // Simulate API status checks
    checkApiStatus()
        .then(status => {
            updateApiStatusUI(status);
        })
        .catch(error => {
            console.error('Error checking API status:', error);
            updateApiStatusUI('error');
        });
}

// Check API status (simulated)
function checkApiStatus() {
    return new Promise((resolve, reject) => {
        // Simulate API check with 90% success rate
        setTimeout(() => {
            const random = Math.random();
            if (random < 0.9) {
                resolve('connected');
            } else {
                resolve('error');
            }
        }, 1000);
    });
}

// Update API status UI
function updateApiStatusUI(status) {
    const apiStatus = document.querySelector('.api-status');
    if (!apiStatus) return;
    
    // Remove all status classes
    apiStatus.classList.remove('connected', 'connecting', 'error');
    
    // Update status indicator
    const statusIndicator = apiStatus.querySelector('.status-indicator');
    if (statusIndicator) {
        statusIndicator.classList.remove('green', 'yellow', 'red');
    }
    
    // Set appropriate status
    switch (status) {
        case 'connected':
            apiStatus.classList.add('connected');
            statusIndicator.classList.add('green');
            apiStatus.querySelector('span').textContent = 'Connected to Feature Detection API';
            break;
        case 'connecting':
            apiStatus.classList.add('connecting');
            statusIndicator.classList.add('yellow');
            apiStatus.querySelector('span').textContent = 'Connecting to Feature Detection API...';
            break;
        case 'error':
            apiStatus.classList.add('error');
            statusIndicator.classList.add('red');
            apiStatus.querySelector('span').textContent = 'Error connecting to Feature Detection API';
            
            // Show retry button
            if (!apiStatus.querySelector('.retry-btn')) {
                const retryBtn = document.createElement('button');
                retryBtn.className = 'btn btn-sm retry-btn';
                retryBtn.textContent = 'Retry';
                retryBtn.addEventListener('click', function() {
                    updateApiStatusUI('connecting');
                    checkApiStatus()
                        .then(status => {
                            updateApiStatusUI(status);
                        })
                        .catch(error => {
                            console.error('Error checking API status:', error);
                            updateApiStatusUI('error');
                        });
                });
                apiStatus.appendChild(retryBtn);
            }
            break;
    }
}

// Highlight invalid form field
function highlightInvalidField(field) {
    field.classList.add('invalid');
    
    // Add shake animation
    field.classList.add('shake');
    setTimeout(() => {
        field.classList.remove('shake');
    }, 500);
}

// Show field-specific error message
function showFieldError(field) {
    // Remove any existing error message
    clearFieldError(field);
    
    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'field-error';
    
    // Set appropriate error message based on validation state
    if (field.validity.valueMissing) {
        errorMessage.textContent = `${getFieldLabel(field)} is required.`;
    } else if (field.validity.typeMismatch) {
        errorMessage.textContent = `Please enter a valid ${getFieldLabel(field).toLowerCase()}.`;
    } else if (field.validity.rangeUnderflow) {
        errorMessage.textContent = `${getFieldLabel(field)} must be at least ${field.min}.`;
    } else if (field.validity.rangeOverflow) {
        errorMessage.textContent = `${getFieldLabel(field)} must be at most ${field.max}.`;
    } else if (field.validity.stepMismatch) {
        errorMessage.textContent = `${getFieldLabel(field)} must be in increments of ${field.step}.`;
    } else {
        errorMessage.textContent = `Please enter a valid ${getFieldLabel(field).toLowerCase()}.`;
    }
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorMessage, field.nextSibling);
}

// Clear field-specific error message
function clearFieldError(field) {
    field.classList.remove('invalid');
    
    // Remove any existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.parentNode.removeChild(existingError);
    }
}

// Get field label text
function getFieldLabel(field) {
    // Try to find associated label
    const id = field.id;
    const label = document.querySelector(`label[for="${id}"]`);
    
    if (label) {
        return label.textContent.replace(':', '');
    }
    
    // Fallback to field name or id
    return field.name || field.id || 'Field';
}

// Show loading indicator
function showLoading(message = 'Loading...') {
    // Remove any existing loading overlay
    hideLoading();
    
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(loadingOverlay);
    
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';
}

// Hide loading indicator
function hideLoading() {
    const existingOverlay = document.querySelector('.loading-overlay');
    if (existingOverlay) {
        existingOverlay.parentNode.removeChild(existingOverlay);
    }
    
    // Restore scrolling
    document.body.style.overflow = '';
}

// Show notification (enhanced version)
function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = `notification ${type}`;
        document.body.appendChild(notification);
    } else {
        // Update existing notification
        notification.className = `notification ${type}`;
    }
    
    // Set notification content
    let icon = 'fa-info-circle';
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
            <p>${message}</p>
        </div>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add close button functionality
    const closeButton = notification.querySelector('.close-notification');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
    
    return notification;
}
