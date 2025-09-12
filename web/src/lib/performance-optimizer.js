/**
 * Performance optimization utilities for lazy loading and bundle management
 * Provides intelligent resource loading based on user interaction patterns
 */

class PerformanceOptimizer {
  constructor() {
    this.loadedModules = new Set();
    this.loadingPromises = new Map();
    this.userInteractions = new Map();
    this.performanceMetrics = {
      bundleLoadTimes: {},
      initialLoadTime: Date.now(),
      interactionCounts: {},
      memoryUsage: []
    };
    
    this.initPerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitoring() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor memory usage if available
      if ('memory' in performance) {
        setInterval(() => {
          this.performanceMetrics.memoryUsage.push({
            timestamp: Date.now(),
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          });
          
          // Keep only last 100 measurements
          if (this.performanceMetrics.memoryUsage.length > 100) {
            this.performanceMetrics.memoryUsage.shift();
          }
        }, 30000); // Every 30 seconds
      }
    }
  }

  /**
   * Lazy load RAG services only when user interacts with RAG features
   */
  async loadRAGServices() {
    const moduleId = 'rag-services';
    
    if (this.loadedModules.has(moduleId)) {
      return;
    }

    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    const startTime = Date.now();
    
    const loadPromise = (async () => {
      try {
        // Track user interaction
        this.trackInteraction('rag-feature-use');
        
        console.log('Loading RAG services on demand...');
        
        // Dynamically import all RAG-related modules
        const [
          { default: ragService },
          { default: embeddingService },
          { default: dbService }
        ] = await Promise.all([
          import('./embeddings/rag-service.js'),
          import('./embeddings/embedding-service.js'),
          import('./database/db-service.js')
        ]);

        this.loadedModules.add(moduleId);
        
        const loadTime = Date.now() - startTime;
        this.performanceMetrics.bundleLoadTimes[moduleId] = loadTime;
        
        console.log(`RAG services loaded in ${loadTime}ms`);
        
        return { ragService, embeddingService, dbService };
      } catch (error) {
        this.loadingPromises.delete(moduleId);
        throw new Error(`Failed to load RAG services: ${error.message}`);
      }
    })();

    this.loadingPromises.set(moduleId, loadPromise);
    return loadPromise;
  }

  /**
   * Preload critical components based on user behavior patterns
   */
  async preloadCriticalComponents() {
    // Only preload if user has interacted with advanced features
    if (this.shouldPreloadAdvancedFeatures()) {
      setTimeout(() => {
        this.loadRAGServices().catch(error => {
          console.warn('RAG preload failed:', error);
        });
      }, 2000); // Delay to not interfere with initial load
    }
  }

  /**
   * Determine if advanced features should be preloaded
   */
  shouldPreloadAdvancedFeatures() {
    // Check if user has previously used RAG features
    const ragUsage = localStorage.getItem('cora-rag-usage');
    if (ragUsage) {
      const usage = JSON.parse(ragUsage);
      return usage.count > 2 || (Date.now() - usage.lastUsed) < 86400000; // 24 hours
    }
    
    // Check if user seems engaged (multiple interactions)
    const totalInteractions = Array.from(this.userInteractions.values())
      .reduce((sum, count) => sum + count, 0);
      
    return totalInteractions > 5;
  }

  /**
   * Track user interactions for smart preloading
   */
  trackInteraction(type) {
    const count = this.userInteractions.get(type) || 0;
    this.userInteractions.set(type, count + 1);
    
    this.performanceMetrics.interactionCounts[type] = count + 1;
    
    // Persist RAG usage for future sessions
    if (type === 'rag-feature-use') {
      const usage = {
        count: count + 1,
        lastUsed: Date.now()
      };
      localStorage.setItem('cora-rag-usage', JSON.stringify(usage));
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics() {
    const metrics = { ...this.performanceMetrics };
    
    // Add current memory usage if available
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      metrics.currentMemory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    
    // Add load status
    metrics.loadedModules = Array.from(this.loadedModules);
    metrics.pendingLoads = Array.from(this.loadingPromises.keys());
    
    return metrics;
  }

  /**
   * Check if device has sufficient resources for advanced features
   */
  canHandleAdvancedFeatures() {
    // Check memory constraints
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memoryUsagePercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
      if (memoryUsagePercent > 80) {
        return false;
      }
    }
    
    // Check if running on mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // More conservative on mobile
      return navigator.deviceMemory ? navigator.deviceMemory >= 4 : true;
    }
    
    return true;
  }

  /**
   * Clean up resources to free memory
   */
  optimizeMemory() {
    // Clear old performance metrics
    if (this.performanceMetrics.memoryUsage.length > 50) {
      this.performanceMetrics.memoryUsage = this.performanceMetrics.memoryUsage.slice(-25);
    }
    
    // Suggest garbage collection if available
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }
  }

  /**
   * Get recommendations for performance optimization
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    const metrics = this.getPerformanceMetrics();
    
    // Memory recommendations
    if (metrics.currentMemory && metrics.currentMemory.percentage > 70) {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected. Consider closing other tabs or reloading the page.',
        action: 'optimizeMemory'
      });
    }
    
    // Load time recommendations
    const ragLoadTime = metrics.bundleLoadTimes['rag-services'];
    if (ragLoadTime && ragLoadTime > 3000) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: 'RAG services taking longer to load. Check network connection.',
        action: 'checkNetwork'
      });
    }
    
    // Feature usage recommendations
    if (metrics.interactionCounts['rag-feature-use'] && !this.loadedModules.has('rag-services')) {
      recommendations.push({
        type: 'optimization',
        severity: 'low',
        message: 'Consider keeping RAG features loaded for faster access.',
        action: 'preloadRAG'
      });
    }
    
    return recommendations;
  }
}

// Export singleton instance
export default new PerformanceOptimizer();