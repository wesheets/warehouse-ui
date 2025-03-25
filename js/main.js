// Enhanced file upload functionality for Warehouse SaaS Platform

document.addEventListener('DOMContentLoaded', function() {
    // Initialize file upload functionality
    initFileUpload();
    
    // Initialize form validation and submission
    initFormHandling();
    
    // Initialize project management functionality
    initProjectManagement();
});

// File Upload Functionality
function initFileUpload() {
    const fileInput = document.getElementById('image-upload');
    const uploadArea = document.getElementById('upload-area');
    const filePreview = document.getElementById('file-preview');
    
    if (!fileInput || !uploadArea) return;
    
    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }
    
    // Handle file drop
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFiles(files);
        }
    }
    
    // Handle file selection via input
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        validateFile(file);
        previewFile(file);
        showDimensionsForm();
    }
    
    function validateFile(file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
            showError('Please select a valid image file (JPEG, PNG, GIF).');
            fileInput.value = '';
            return false;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('File size exceeds 10MB limit. Please select a smaller file.');
            fileInput.value = '';
            return false;
        }
        
        clearError();
        return true;
    }
    
    function previewFile(file) {
        if (!filePreview) return;
        
        const reader = new FileReader();
        
        reader.onloadstart = function() {
            filePreview.innerHTML = `
                <div class="loading-preview">
                    <div class="spinner"></div>
                    <p>Loading preview...</p>
                </div>
            `;
        };
        
        reader.onload = function(e) {
            filePreview.innerHTML = `
                <div class="preview-container">
                    <img src="${e.target.result}" alt="Preview">
                    <div class="file-info">
                        <p class="file-name">${file.name}</p>
                        <p class="file-size">${formatFileSize(file.size)}</p>
                        <button type="button" class="btn btn-outline btn-sm remove-file">Remove</button>
                    </div>
                </div>
            `;
            
            // Add event listener to remove button
            const removeButton = filePreview.querySelector('.remove-file');
            if (removeButton) {
                removeButton.addEventListener('click', function() {
                    fileInput.value = '';
                    filePreview.innerHTML = '';
                    hideDimensionsForm();
                });
            }
        };
        
        reader.onerror = function() {
            filePreview.innerHTML = `
                <div class="error-preview">
                    <p>Error loading preview. Please try again.</p>
                </div>
            `;
        };
        
        reader.readAsDataURL(file);
    }
    
    function showDimensionsForm() {
        const dimensionsForm = document.getElementById('dimensions-form');
        if (dimensionsForm) {
            dimensionsForm.style.display = 'block';
            dimensionsForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function hideDimensionsForm() {
        const dimensionsForm = document.getElementById('dimensions-form');
        if (dimensionsForm) {
            dimensionsForm.style.display = 'none';
        }
    }
}

// Form Validation and Submission
function initFormHandling() {
    const featureForm = document.getElementById('feature-form');
    if (!featureForm) return;
    
    featureForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading indicator
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Collect form data
        const formData = collectFormData();
        
        // Simulate API call (replace with actual API endpoint)
        setTimeout(function() {
            // Log form data to console (for development)
            console.log('Form data:', formData);
            
            // Hide loading indicator
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Show success message and download options
            const resultSection = document.getElementById('result-section');
            if (resultSection) {
                resultSection.style.display = 'block';
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Show success notification
            showNotification('Site plan generated successfully!', 'success');
        }, 3000);
    });
    
    function validateForm() {
        // Check if image is selected
        const fileInput = document.getElementById('image-upload');
        if (!fileInput || fileInput.files.length === 0) {
            showError('Please select an image file.');
            return false;
        }
        
        // Check if dimensions are provided
        const width = document.getElementById('width');
        const height = document.getElementById('height');
        const length = document.getElementById('length');
        
        if (!width.value || !height.value || !length.value) {
            showError('Please provide all dimension values.');
            return false;
        }
        
        // Check if at least one feature is selected
        const featureCheckboxes = document.querySelectorAll('input[name="features"]:checked');
        if (featureCheckboxes.length === 0) {
            showError('Please select at least one feature to detect.');
            return false;
        }
        
        clearError();
        return true;
    }
    
    function collectFormData() {
        const fileInput = document.getElementById('image-upload');
        const width = document.getElementById('width').value;
        const height = document.getElementById('height').value;
        const length = document.getElementById('length').value;
        const unit = document.getElementById('unit').value;
        
        // Get selected features
        const selectedFeatures = [];
        document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
            selectedFeatures.push(checkbox.value);
        });
        
        // Create FormData object for API submission
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        formData.append('features', JSON.stringify(selectedFeatures));
        formData.append('dimensions', JSON.stringify({
            width: parseFloat(width),
            height: parseFloat(height),
            length: parseFloat(length),
            unit: unit
        }));
        
        return formData;
    }
}

// Project Management Functionality
function initProjectManagement() {
    const projectSearch = document.getElementById('project-search');
    const projectFilter = document.getElementById('project-filter');
    
    if (projectSearch) {
        projectSearch.addEventListener('input', filterProjects);
    }
    
    if (projectFilter) {
        projectFilter.addEventListener('change', filterProjects);
    }
    
    function filterProjects() {
        // This would be implemented with actual project data
        console.log('Filtering projects...');
    }
    
    // Handle download buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const format = this.getAttribute('data-format');
            
            // Show loading indicator
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Preparing ${format}...`;
            
            // Simulate download preparation
            setTimeout(() => {
                // Reset button text
                this.innerHTML = `Download ${format} <i class="fas fa-download"></i>`;
                
                // Show success notification
                showNotification(`${format} file ready for download!`, 'success');
                
                // Trigger download (in production, this would be a real file)
                simulateDownload(`site-plan.${format.toLowerCase()}`);
            }, 1500);
        });
    });
    
    function simulateDownload(filename) {
        // Create a dummy download link
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,Simulated file content';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Helper Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) {
        // Create error container if it doesn't exist
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            const newErrorContainer = document.createElement('div');
            newErrorContainer.id = 'error-container';
            newErrorContainer.className = 'error-message';
            formContainer.insertBefore(newErrorContainer, formContainer.firstChild);
            newErrorContainer.textContent = message;
        }
    } else {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
}

function clearError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add close button functionality
    const closeButton = notification.querySelector('.close-notification');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}
