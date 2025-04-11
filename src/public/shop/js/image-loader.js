/**
 * Image Loader JavaScript for VietShop
 * Handles image loading, fallbacks, and debugging
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Image loader script initialized');
    
    // Fix all image paths and add fallbacks
    fixImagePaths();
    
    // Watch for dynamically added images
    watchForNewImages();
});

/**
 * Fix image paths and add fallbacks for existing images
 */
function fixImagePaths() {
    console.log('Fixing image paths for all images on page');
    
    // Process all images
    document.querySelectorAll('img').forEach(function(img) {
        setupImageFallbacks(img);
    });
}

/**
 * Watch for dynamically added images and fix their paths
 */
function watchForNewImages() {
    // Create a mutation observer to watch for new elements
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check for added nodes
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    // Check if the node is an Element
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // If it's an image, set up fallbacks
                        if (node.nodeName === 'IMG') {
                            setupImageFallbacks(node);
                        }
                        
                        // If it contains images, process them
                        const images = node.querySelectorAll('img');
                        if (images.length > 0) {
                            images.forEach(function(img) {
                                setupImageFallbacks(img);
                            });
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the entire document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('Now watching for dynamically added images');
}

/**
 * Setup fallback paths for an image
 * @param {HTMLImageElement} img - The image element to process
 */
function setupImageFallbacks(img) {
    const originalSrc = img.src;
    console.log(`Setting up fallbacks for image: ${originalSrc}`);
    
    // Handle error - try alternate paths
    img.onerror = function() {
        console.error(`Failed to load image: ${img.src}`);
        
        // If we've already tried all fallbacks, use a generic placeholder
        if (img.dataset.fallbackLevel && parseInt(img.dataset.fallbackLevel) >= 3) {
            console.log(`Using final fallback for: ${originalSrc}`);
            img.src = '/image/b1.jpg'; // Final fallback
            img.onerror = null; // Prevent infinite loop
            return;
        }
        
        // Track fallback level
        const fallbackLevel = img.dataset.fallbackLevel ? parseInt(img.dataset.fallbackLevel) + 1 : 1;
        img.dataset.fallbackLevel = fallbackLevel;
        
        if (img.src.includes('/img/')) {
            // Try the /image/ directory instead
            console.log(`Trying /image/ path for: ${img.src}`);
            img.src = img.src.replace('/img/', '/image/');
        } else if (img.src.includes('/image/')) {
            // Try the full path with domain
            console.log(`Trying absolute path for: ${img.src}`);
            const filename = img.src.split('/').pop();
            img.src = `http://localhost:5000/image/${filename}`;
        } else if (!img.src.includes('http')) {
            // Try with http protocol
            console.log(`Trying with protocol for: ${img.src}`);
            img.src = `http://localhost:5000${img.src}`;
        } else {
            // Ultimate fallback
            console.log(`Using emergency fallback for: ${originalSrc}`);
            img.src = '/image/b1.jpg';
            img.onerror = null; // Prevent infinite loop
        }
    };
    
    // Log successful loads
    img.onload = function() {
        console.log(`Successfully loaded image: ${img.src}`);
    };
} 