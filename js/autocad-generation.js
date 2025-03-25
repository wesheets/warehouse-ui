// AutoCAD file generation and download functionality

// API connection configuration
const API_CONFIG = {
    featureDetectionUrl: 'https://site-plan-api.onrender.com/generate',
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
        
        // Prepare API request data
        const imageFile = formData.get('image');
        const features = JSON.parse(formData.get('features'));
        const dimensions = JSON.parse(formData.get('dimensions'));
        
        // Convert image to base64 for API request
        const imageBase64 = await fileToBase64(imageFile);
        
        // Prepare request payload
        const payload = {
            image_data: imageBase64,
            features: features,
            dimensions: dimensions
        };
        
        // Simulate feature detection progress
        await simulateProgress(40, 70, 'Detecting features...', 3000);
        
        // Update progress
        updateProgress(70, 'Generating AutoCAD files...');
        
        // Make API request to generate AutoCAD files
        // In a real implementation, this would be an actual API call
        // const response = await fetch(API_CONFIG.featureDetectionUrl, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(payload)
        // });
        
        // Simulate API response for demonstration
        await simulateProgress(70, 95, 'Generating AutoCAD files...', 2000);
        
        // Update progress
        updateProgress(95, 'Finalizing results...');
        
        // Simulate API response
        const result = {
            success: true,
            message: 'AutoCAD files generated successfully',
            files: {
                dxf: 'site-plan.dxf',
                dwg: 'site-plan.dwg',
                pdf: 'site-plan.pdf'
            },
            preview: 'images/sample-result.jpg'
        };
        
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
        previewImg.src = result.preview;
        previewImg.alt = 'Generated Site Plan';
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
                if (result.files && result.files[formatLower]) {
                    downloadFile(result.files[formatLower], formatLower);
                    showNotification(`${format} file downloaded successfully!`, 'success');
                } else {
                    showNotification(`Error: ${format} file not available.`, 'error');
                }
            }, 1500);
        });
    });
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFileUpload();
    initAutoCADGeneration();
    initProjectManagement();
});
