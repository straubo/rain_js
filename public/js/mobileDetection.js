/**
 * Mobile Detection and Viewport Monitoring Module
 * Detects mobile devices and monitors viewport size changes using ResizeObserver
 */

class MobileDetection {
    constructor() {
        this.isMobile = false;
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        this.callbacks = {
            mobileChange: [],
            viewportChange: []
        };
        this.resizeObserver = null;
        this.observedElement = null;
        
        this.init();
    }

    /**
     * Initialize mobile detection and viewport monitoring
     */
    init() {
        this.detectMobile();
        this.setupResizeObserver();
        this.setupOrientationListener();
    }

    /**
     * Detect if the device is mobile based on multiple criteria
     */
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Check for mobile user agents
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        const isMobileUserAgent = mobileRegex.test(userAgent);
        
        // Check for touch capability
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Check viewport width (common mobile breakpoint)
        const isSmallViewport = this.viewportWidth <= 768;
        
        // Check for mobile-specific features
        const hasMobileFeatures = 'orientation' in window && 'onorientationchange' in window;
        
        // Determine if mobile based on multiple factors
        this.isMobile = isMobileUserAgent || (isTouchDevice && (isSmallViewport || hasMobileFeatures));
        
        // Trigger mobile change callbacks
        this.triggerCallbacks('mobileChange', this.isMobile);
        
        return this.isMobile;
    }

    /**
     * Setup ResizeObserver for viewport monitoring
     */
    setupResizeObserver() {
        // Check if ResizeObserver is supported
        if (typeof ResizeObserver === 'undefined') {
            console.warn('ResizeObserver not supported, falling back to window.resize');
            this.setupFallbackResizeListener();
            return;
        }

        // Create ResizeObserver instance
        this.resizeObserver = new ResizeObserver((entries) => {
            // Debounce resize events
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    
                    // Check if dimensions actually changed
                    if (width !== this.viewportWidth || height !== this.viewportHeight) {
                        const oldWidth = this.viewportWidth;
                        const oldHeight = this.viewportHeight;
                        
                        this.viewportWidth = width;
                        this.viewportHeight = height;
                        
                        // Re-detect mobile status on significant viewport changes
                        const wasMobile = this.isMobile;
                        this.detectMobile();
                        
                        // Trigger viewport change callbacks
                        this.triggerCallbacks('viewportChange', {
                            width,
                            height,
                            oldWidth,
                            oldHeight,
                            isMobile: this.isMobile,
                            mobileChanged: wasMobile !== this.isMobile
                        });
                    }
                }
            }, 100);
        });

        // Observe the document body for viewport changes
        this.observedElement = document.body;
        if (this.observedElement) {
            this.resizeObserver.observe(this.observedElement);
        } else {
            // If body isn't ready, wait for DOMContentLoaded
            document.addEventListener('DOMContentLoaded', () => {
                this.observedElement = document.body;
                if (this.observedElement) {
                    this.resizeObserver.observe(this.observedElement);
                }
            });
        }
    }

    /**
     * Fallback resize listener for browsers without ResizeObserver support
     */
    setupFallbackResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            // Debounce resize events
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newWidth = window.innerWidth;
                const newHeight = window.innerHeight;
                
                // Check if dimensions actually changed
                if (newWidth !== this.viewportWidth || newHeight !== this.viewportHeight) {
                    const oldWidth = this.viewportWidth;
                    const oldHeight = this.viewportHeight;
                    
                    this.viewportWidth = newWidth;
                    this.viewportHeight = newHeight;
                    
                    // Re-detect mobile status on significant viewport changes
                    const wasMobile = this.isMobile;
                    this.detectMobile();
                    
                    // Trigger viewport change callbacks
                    this.triggerCallbacks('viewportChange', {
                        width: newWidth,
                        height: newHeight,
                        oldWidth,
                        oldHeight,
                        isMobile: this.isMobile,
                        mobileChanged: wasMobile !== this.isMobile
                    });
                }
            }, 100);
        });
    }

    /**
     * Setup orientation change listener for mobile devices
     */
    setupOrientationListener() {
        if ('orientation' in window) {
            window.addEventListener('orientationchange', () => {
                // Small delay to allow viewport to update
                setTimeout(() => {
                    const newWidth = window.innerWidth;
                    const newHeight = window.innerHeight;
                    
                    this.viewportWidth = newWidth;
                    this.viewportHeight = newHeight;
                    
                    // Re-detect mobile status
                    const wasMobile = this.isMobile;
                    this.detectMobile();
                    
                    // Trigger callbacks
                    this.triggerCallbacks('viewportChange', {
                        width: newWidth,
                        height: newHeight,
                        isMobile: this.isMobile,
                        mobileChanged: wasMobile !== this.isMobile,
                        orientationChanged: true
                    });
                }, 100);
            });
        }
    }

    /**
     * Register callback for mobile status changes
     * @param {Function} callback - Function to call when mobile status changes
     */
    onMobileChange(callback) {
        this.callbacks.mobileChange.push(callback);
    }

    /**
     * Register callback for viewport changes
     * @param {Function} callback - Function to call when viewport changes
     */
    onViewportChange(callback) {
        this.callbacks.viewportChange.push(callback);
    }

    /**
     * Trigger callbacks for a specific event type
     * @param {string} eventType - Type of event ('mobileChange' or 'viewportChange')
     * @param {*} data - Data to pass to callbacks
     */
    triggerCallbacks(eventType, data) {
        this.callbacks[eventType].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${eventType} callback:`, error);
            }
        });
    }

    /**
     * Get current mobile status
     * @returns {boolean} True if device is detected as mobile
     */
    getIsMobile() {
        return this.isMobile;
    }

    /**
     * Get current viewport dimensions
     * @returns {Object} Object with width and height properties
     */
    getViewportSize() {
        return {
            width: this.viewportWidth,
            height: this.viewportHeight
        };
    }

    /**
     * Force re-detection of mobile status
     * @returns {boolean} Updated mobile status
     */
    redetectMobile() {
        return this.detectMobile();
    }

    /**
     * Get detailed device information
     * @returns {Object} Object with device detection details
     */
    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            viewport: {
                width: this.viewportWidth,
                height: this.viewportHeight
            },
            userAgent: navigator.userAgent,
            touchCapable: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            orientation: 'orientation' in window ? window.orientation : null,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    /**
     * Cleanup method to disconnect observers and remove event listeners
     */
    destroy() {
        if (this.resizeObserver && this.observedElement) {
            this.resizeObserver.unobserve(this.observedElement);
            this.resizeObserver.disconnect();
        }
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // Clear callbacks
        this.callbacks.mobileChange = [];
        this.callbacks.viewportChange = [];
    }
}

// Create and export a singleton instance
const mobileDetection = new MobileDetection();

// ES6 module export
export default mobileDetection;

// Also export the class for creating new instances if needed
export { MobileDetection };
