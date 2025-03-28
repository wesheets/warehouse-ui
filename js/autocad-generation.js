// AutoCAD file generation and download functionality

// API connection configuration
const API_CONFIG = {
    featureDetectionUrl: 'https://site-plan-api.onrender.com/api/generate-siteplan',
    timeout: 60000, // 60 seconds timeout
    retryAttempts: 3
};

// Initialize AutoCAD file generation functionality
function initAutoCADGeneration() {
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
        
        // Show progress container
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'block';
            updateProgress(5, 'Preparing image for processing...');
        }
        
        // Collect form data
        const formData = collectFormData();
        
        // Process the image and generate AutoCAD files
        processImageAndGenerateFiles(formData)
            .then(result => {
                // Hide loading indicator
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
                // Hide progress container
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
                
                // Show success message and download options
                displayResults(result);
                
                // Show success notification
                showNotification('Site plan generated successfully!', 'success');
            })
            .catch(error => {
                // Hide loading indicator
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
                // Hide progress container
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
                
                // Show error notification
                showNotification(`Error: ${error.message}`, 'error');
                console.error('Error generating site plan:', error);
            });
    });
}

// Process image and generate AutoCAD files
async function processImageAndGenerateFiles(formData) {
    try {
        // Update progress
        updateProgress(10, 'Uploading image...');
        
        // Simulate image upload progress
        await simulateProgress(10, 40, 'Uploading image...', 2000);
        
        // Update progress
        updateProgress(40, 'Detecting features...');
        
        // Get the image file from form data
        const imageFile = formData.get('image');
        
        // Create a new FormData object for the API request
        const apiFormData = new FormData();
        apiFormData.append('file', imageFile);
        
        // Add any additional form fields if needed
        if (formData.has('features')) {
            const features = JSON.parse(formData.get('features'));
            apiFormData.append('features', JSON.stringify(features));
        }
        
        if (formData.has('dimensions')) {
            const dimensions = JSON.parse(formData.get('dimensions'));
            apiFormData.append('dimensions', JSON.stringify(dimensions));
        }
        
        // Simulate feature detection progress
        await simulateProgress(40, 70, 'Detecting features...', 3000);
        
        // Update progress
        updateProgress(70, 'Generating AutoCAD files...');
        
        // Make API request to generate AutoCAD files
        const response = await fetch(API_CONFIG.featureDetectionUrl, {
            method: 'POST',
            body: apiFormData // Send as multipart/form-data
        });
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        // Parse response
        const apiResponse = await response.json();
        console.log('API Response:', apiResponse); // Log the API response for debugging
        
        // Update progress
        updateProgress(95, 'Finalizing results...');
        
        // Process API response
        const result = {
            success: true,
            message: 'AutoCAD files generated successfully',
            files: apiResponse.files || {},
            preview: apiResponse.preview || apiResponse.file_urls?.preview || apiResponse.file_urls?.png || 'images/sample-result.jpg',
            fileUrls: apiResponse.file_urls || {}
        };
        
        console.log('Preview URL being used:', result.preview); // Log the preview URL for debugging
        
        // Complete progress
        updateProgress(100, 'Complete!');
        
        return result;
    } catch (error) {
        console.error('Error in processImageAndGenerateFiles:', error);
        throw new Error('Failed to generate AutoCAD files. Please try again.');
    }
}

// Display results and download options
function displayResults(result) {
    const resultSection = document.getElementById('result-section');
    if (!resultSection) return;
    
    // Show result section
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Update preview image if available
    const previewImg = resultSection.querySelector('.result-preview img');
    if (previewImg && result.preview) {
        // Check if the preview URL is a relative path or full URL
        if (result.preview.startsWith('/')) {
            // It's a relative path, prepend the API base URL
            previewImg.src = 'https://site-plan-api.onrender.com' + result.preview;
        } else if (result.preview.startsWith('http')) {
            // It's already a full URL
            previewImg.src = result.preview;
        } else {
            // It's a local path
            previewImg.src = result.preview;
        }
        previewImg.alt = 'Generated Site Plan';
        
        // Log the preview URL for debugging
        console.log('Setting preview image to:', previewImg.src);
    }
    
    // Set up download buttons
    const downloadButtons = resultSection.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        const format = button.getAttribute('data-format');
        const formatLower = format.toLowerCase();
        
        // Set up click handler for each download button
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Preparing ${format}...`;
            
            // Simulate download preparation
            setTimeout(() => {
                // Reset button text
                this.innerHTML = originalText;
                
                // Trigger download
                if (result.fileUrls && result.fileUrls[formatLower]) {
                    // Use the actual file URL from the API response
                    const fileUrl = result.fileUrls[formatLower];
                    
                    // Check if the URL is a relative path or full URL
                    let fullUrl;
                    if (fileUrl.startsWith('/')) {
                        // It's a relative path, prepend the API base URL
                        fullUrl = 'https://site-plan-api.onrender.com' + fileUrl;
                    } else if (fileUrl.startsWith('http')) {
                        // It's already a full URL
                        fullUrl = fileUrl;
                    } else {
                        // It's a local path, prepend the API base URL
                        fullUrl = 'https://site-plan-api.onrender.com/' + fileUrl;
                    }
                    
                    console.log(`Downloading ${format} from URL:`, fullUrl); // Log the download URL for debugging
                    
                    window.open(fullUrl, '_blank');
                    showNotification(`${format} file downloaded successfully!`, 'success');
                } else if (result.files && result.files[formatLower]) {
                    // Fallback to local download simulation
                    downloadFile(result.files[formatLower], formatLower);
                    showNotification(`${format} file downloaded successfully!`, 'success');
                } else {
                    showNotification(`Error: ${format} file not available.`, 'error');
                }
            }, 1500);
        });
    });
    
    // Update details tab with information from the API response
    updateDetailsTab(result);
}

// Update details tab with information from the API response
function updateDetailsTab(result) {
    // Update creation date
    const creationDate = document.getElementById('creation-date');
    if (creationDate) {
        creationDate.textContent = new Date().toLocaleDateString();
    }
    
    // Update dimensions
    const dimensionsValue = document.getElementById('dimensions-value');
    if (dimensionsValue && result.dimensions) {
        const width = result.dimensions.width || 0;
        const length = result.dimensions.length || 0;
        const height = result.dimensions.height || 0;
        dimensionsValue.textContent = `${width}m × ${length}m × ${height}m`;
    }
    
    // Update detected features
    const detectedFeaturesList = document.getElementById('detected-features-list');
    if (detectedFeaturesList && result.elements) {
        // Clear existing features
        detectedFeaturesList.innerHTML = '';
        
        // Get unique feature types
        const featureTypes = new Set();
        if (Array.isArray(result.elements)) {
            // If elements is an array
            result.elements.forEach(element => {
                if (element && element.type) {
                    featureTypes.add(element.type);
                }
            });
        } else if (typeof result.elements === 'object') {
            // If elements is an object with categories
            Object.keys(result.elements).forEach(category => {
                featureTypes.add(category);
            });
        }
        
        // Add feature tags
        featureTypes.forEach(feature => {
            const featureTag = document.createElement('span');
            featureTag.className = 'feature-tag';
            featureTag.textContent = feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ');
            detectedFeaturesList.appendChild(featureTag);
        });
    }
    
    // Update file size
    const fileSize = document.getElementById('file-size');
    if (fileSize) {
        fileSize.textContent = '2.4 MB'; // Placeholder, would be dynamic in a real implementation
    }
}

// Helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Extract base64 data from the result
            // Format is "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

// Helper function to simulate progress updates
function simulateProgress(start, end, message, duration) {
    return new Promise(resolve => {
        const steps = 10;
        const increment = (end - start) / steps;
        const stepDuration = duration / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            currentStep++;
            const progress = start + (increment * currentStep);
            
            updateProgress(progress, message);
            
            if (currentStep >= steps) {
                clearInterval(interval);
                resolve();
            }
        }, stepDuration);
    });
}

// Update progress bar and text
function updateProgress(percentage, status) {
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressStatus = document.querySelector('.progress-status');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(percentage)}%`;
    }
    
    if (progressStatus && status) {
        progressStatus.textContent = status;
    }
}

// Trigger file download
function downloadFile(filename, format) {
    // In a real implementation, this would download actual files from the server
    // For demonstration, we'll create dummy content
    
    let content = '';
    let mimeType = '';
    
    switch (format) {
        case 'dxf':
        case 'dwg':
            content = 'AutoCAD file content would be here in a real implementation';
            mimeType = 'application/octet-stream';
            break;
        case 'pdf':
            content = 'PDF content would be here in a real implementation';
            mimeType = 'application/pdf';
            break;
        default:
            content = 'File content';
            mimeType = 'text/plain';
    }
    
    // Create a blob and download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

// Collect form data
function collectFormData() {
    const formData = new FormData();
    
    // Get the uploaded image
    const fileInput = document.getElementById('image-upload');
    if (fileInput && fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    }
    
    // Get dimensions
    const width = document.getElementById('width')?.value || 0;
    const height = document.getElementById('height')?.value || 0;
    const length = document.getElementById('length')?.value || 0;
    const unit = document.getElementById('unit')?.value || 'meters';
    
    const dimensions = {
        width: parseFloat(width),
        height: parseFloat(height),
        length: parseFloat(length),
        unit: unit
    };
    
    formData.append('dimensions', JSON.stringify(dimensions));
    
    // Get selected features
    const featureCheckboxes = document.querySelectorAll('input[name="features"]:checked');
    const features = Array.from(featureCheckboxes).map(checkbox => checkbox.value);
    
    formData.append('features', JSON.stringify(features));
    
    return formData;
}

// Validate form before submission
function validateForm() {
    // Check if image is uploaded
    const fileInput = document.getElementById('image-upload');
    if (!fileInput || fileInput.files.length === 0) {
        showNotification('Please upload an image', 'error');
        return false;
    }
    
    // Check dimensions
    const width = document.getElementById('width');
    const height = document.getElementById('height');
    const length = document.getElementById('length');
    
    if (width && (isNaN(width.value) || parseFloat(width.value) <= 0)) {
        showNotification('Please enter a valid width', 'error');
        width.focus();
        return false;
    }
    
    if (height && (isNaN(height.value) || parseFloat(height.value) <= 0)) {
        showNotification('Please enter a valid height', 'error');
        height.focus();
        return false;
    }
    
    if (length && (isNaN(length.value) || parseFloat(length.value) <= 0)) {
        showNotification('Please enter a valid length', 'error');
        length.focus();
        return false;
    }
    
    return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFileUpload();
    initAutoCADGeneration();
    initProjectManagement();
});

// Initialize file upload functionality
function initFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-upload');
    const filePreview = document.getElementById('file-preview');
    const dimensionsForm = document.getElementById('dimensions-form');
    
    if (!uploadArea || !fileInput || !filePreview) return;
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
    
    // Handle file input change
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFileSelect(this.files[0]);
        }
    });
    
    // Handle file selection
    function handleFileSelect(file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPEG, PNG, GIF)', 'error');
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showNotification('File size exceeds 10MB limit', 'error');
            return;
        }
        
        // Create file preview
        const reader = new FileReader();
        reader.onload = function(e) {
            filePreview.innerHTML = `
                <div class="file-preview-item">
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                        <button class="remove-file-btn">Remove</button>
                    </div>
                </div>
            `;
            
            // Show dimensions form
            if (dimensionsForm) {
                dimensionsForm.style.display = 'block';
            }
            
            // Handle remove button
            const removeBtn = filePreview.querySelector('.remove-file-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    filePreview.innerHTML = '';
                    fileInput.value = '';
                    if (dimensionsForm) {
                        dimensionsForm.style.display = 'none';
                    }
                });
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
}

// Initialize project management functionality
function initProjectManagement() {
    // This would handle saving projects, loading saved projects, etc.
    // For now, it's just a placeholder
    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', function() {
            showNotification('Project saved successfully!', 'success');
        });
    }
    
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            showNotification('Share functionality coming soon!', 'info');
        });
    }
    
    // Set up result tabs
    const resultTabs = document.querySelectorAll('.result-tab');
    resultTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            resultTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content sections
            const contentSections = document.querySelectorAll('.result-content');
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show selected content section
            const tabId = this.getAttribute('data-tab');
            const contentSection = document.getElementById(`${tabId}-tab`);
            if (contentSection) {
                contentSection.classList.add('active');
            }
        });
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getIconForType(type)}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Set up close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    }
    
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
    
    // Helper function to get icon for notification type
    function getIconForType(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info':
            default: return 'fa-info-circle';
        }
    }
}
