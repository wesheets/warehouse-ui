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
        
        // Add style parameter (default to 'default' style)
        apiFormData.append('style', 'default');
        
        // Add include_measurements parameter
        apiFormData.append('include_measurements', 'true');
        
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
        updateProgress(70, 'Generating site plan...');
        
        // Make API request to generate site plan
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
        
        // Process API response based on the new API format
        const result = {
            success: apiResponse.success,
            message: apiResponse.message || 'Site plan generated successfully',
            preview: apiResponse.site_plan_url || 'images/sample-result.jpg',
            fileUrls: {
                png: apiResponse.site_plan_url
            },
            featureAreas: apiResponse.feature_areas || {}
        };
        
        console.log('Preview URL being used:', result.preview); // Log the preview URL for debugging
        
        // Complete progress
        updateProgress(100, 'Complete!');
        
        return result;
    } catch (error) {
        console.error('Error in processImageAndGenerateFiles:', error);
        throw new Error('Failed to generate site plan. Please try again.');
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
    
    // Display feature areas if available
    const detailsTab = document.getElementById('details-tab');
    if (detailsTab && result.featureAreas) {
        const detailsContent = detailsTab.querySelector('.tab-content');
        if (detailsContent) {
            let areasHtml = '<h3>Feature Areas</h3><ul>';
            
            // Add building area if available
            if (result.featureAreas.building) {
                areasHtml += `<li><strong>Building Area:</strong> ${result.featureAreas.building} sq ft</li>`;
            }
            
            // Add parking area if available
            if (result.featureAreas.parking) {
                areasHtml += `<li><strong>Parking Area:</strong> ${result.featureAreas.parking} sq ft</li>`;
            }
            
            // Add street area if available
            if (result.featureAreas.street) {
                areasHtml += `<li><strong>Street/Driveway Area:</strong> ${result.featureAreas.street} sq ft</li>`;
            }
            
            // Add green area if available
            if (result.featureAreas.green) {
                areasHtml += `<li><strong>Landscaping Area:</strong> ${result.featureAreas.green} sq ft</li>`;
            }
            
            areasHtml += '</ul>';
            detailsContent.innerHTML = areasHtml;
        }
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
                } else {
                    // Fallback to error message
                    showNotification(`${format} file not available`, 'error');
                }
            }, 1000);
        });
    });
}

// Collect form data
function collectFormData() {
    const formData = new FormData();
    
    // Get the uploaded image file
    const fileInput = document.getElementById('image-upload');
    if (fileInput && fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    }
    
    // Get dimensions
    const width = document.getElementById('width')?.value;
    const height = document.getElementById('height')?.value;
    const length = document.getElementById('length')?.value;
    const unit = document.getElementById('unit')?.value;
    
    if (width && height && length) {
        const dimensions = {
            width: parseFloat(width),
            height: parseFloat(height),
            length: parseFloat(length),
            unit: unit || 'ft'
        };
        formData.append('dimensions', JSON.stringify(dimensions));
    }
    
    // Get selected features
    const featureCheckboxes = document.querySelectorAll('input[name="features"]:checked');
    if (featureCheckboxes.length > 0) {
        const features = Array.from(featureCheckboxes).map(checkbox => checkbox.value);
        formData.append('features', JSON.stringify(features));
    }
    
    return formData;
}

// Validate form
function validateForm() {
    // Check if image is uploaded
    const fileInput = document.getElementById('image-upload');
    if (!fileInput || fileInput.files.length === 0) {
        showNotification('Please upload an image', 'error');
        return false;
    }
    
    // Check dimensions
    const width = document.getElementById('width')?.value;
    const height = document.getElementById('height')?.value;
    const length = document.getElementById('length')?.value;
    
    if (!width || !height || !length) {
        showNotification('Please enter all dimensions', 'error');
        return false;
    }
    
    return true;
}

// Update progress bar
function updateProgress(percent, message) {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', percent);
    }
    
    if (progressText) {
        progressText.textContent = message || `${percent}%`;
    }
}

// Simulate progress for better user experience
async function simulateProgress(start, end, message, duration) {
    return new Promise(resolve => {
        const steps = 10;
        const increment = (end - start) / steps;
        const stepDuration = duration / steps;
        let currentProgress = start;
        let step = 0;
        
        const interval = setInterval(() => {
            step++;
            currentProgress += increment;
            
            if (step >= steps) {
                clearInterval(interval);
                updateProgress(end, message);
                resolve();
            } else {
                updateProgress(Math.round(currentProgress), message);
            }
        }, stepDuration);
    });
}

// Show notification
function showNotification(message, type) {
    // Check if notification function exists (defined in another file)
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else {
        // Fallback to alert
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAutoCADGeneration);
