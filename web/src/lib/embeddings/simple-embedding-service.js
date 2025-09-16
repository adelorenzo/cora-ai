/**
 * Simple browser-based embedding service using hash-based vectors
 * Provides lightweight text similarity without external ML libraries
 */

class SimpleEmbeddingService {
  constructor() {
    this.dimensions = 128;  // Reduced from 384 to save memory
    this.isInitialized = false;
    this.embedCache = new Map();
    this.onProgress = null;
  }

  /**
   * Initialize the embedding service
   * @param {function} progressCallback - Callback for loading progress (0-1)
   * @returns {Promise<void>}
   */
  async initialize(progressCallback = null) {
    if (this.isInitialized) {
      console.log('[Embedding Service] Already initialized, skipping');
      return;
    }
    
    console.log('[Embedding Service] Starting initialization...');
    console.log(`[Embedding Service] Configuration: ${this.dimensions} dimensions, hash-based embeddings`);
    const startTime = Date.now();
    
    this.onProgress = progressCallback;
    
    // Simulate initialization
    this._reportProgress(0.1, 'Initializing embedding service...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this._reportProgress(0.5, 'Setting up vector space...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this._reportProgress(1.0, 'Embedding service ready');
    this.isInitialized = true;
    
    const elapsed = Date.now() - startTime;
    console.log(`[Embedding Service] Initialization completed in ${elapsed}ms (simple hash-based embeddings)`);
  }

  /**
   * Report loading progress
   * @private
   */
  _reportProgress(progress, message) {
    if (this.onProgress) {
      this.onProgress({ progress, message });
    }
  }

  /**
   * Generate embeddings for text using advanced hash-based approach
   * @param {string|Array<string>} texts - Input text(s)
   * @returns {Promise<Array<number>|Array<Array<number>>>} Embedding vector(s)
   */
  async generateEmbeddings(texts) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const isArray = Array.isArray(texts);
    const textArray = isArray ? texts : [texts];
    
    if (textArray.length === 0) {
      return isArray ? [] : null;
    }

    const embeddings = [];
    
    // Process texts one at a time with small delays to prevent memory spikes
    for (let i = 0; i < textArray.length; i++) {
      const text = textArray[i];
      
      // Check cache first
      const cached = this.embedCache.get(text);
      if (cached) {
        embeddings.push(cached);
        continue;
      }
      
      // Generate embedding
      const embedding = this._generateHashEmbedding(text);
      
      // Cache it
      this.embedCache.set(text, embedding);
      
      // Manage cache size more aggressively
      if (this.embedCache.size > 500) {  // Reduced from 1000
        const firstKey = this.embedCache.keys().next().value;
        this.embedCache.delete(firstKey);
      }
      
      embeddings.push(embedding);
      
      // Add small delay every 10 embeddings to prevent memory issues
      if (i > 0 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return isArray ? embeddings : embeddings[0];
  }

  /**
   * Generate hash-based embedding for text
   * Uses multiple hash functions for better distribution
   * @private
   */
  _generateHashEmbedding(text) {
    const processed = this._preprocessText(text);
    const vector = new Array(this.dimensions).fill(0);
    
    // Use n-grams for better semantic capture
    const ngrams = this._getNgrams(processed, [1, 2, 3]);
    
    // Multiple hash functions for better distribution
    ngrams.forEach((ngram, index) => {
      const hash1 = this._hash(ngram, 31) % this.dimensions;
      const hash2 = this._hash(ngram, 37) % this.dimensions;
      const hash3 = this._hash(ngram, 41) % this.dimensions;
      
      // Weight by n-gram importance
      const weight = 1 / (1 + Math.log(index + 1));
      vector[hash1] += weight;
      vector[hash2] += weight * 0.7;
      vector[hash3] += weight * 0.5;
    });
    
    // Add term frequency features
    const words = processed.split(/\s+/);
    const termFreq = {};
    words.forEach(word => {
      termFreq[word] = (termFreq[word] || 0) + 1;
    });
    
    Object.entries(termFreq).forEach(([word, freq]) => {
      const hash = this._hash(word, 43) % this.dimensions;
      vector[hash] += Math.log(1 + freq);
    });
    
    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }
    
    return vector;
  }

  /**
   * Preprocess text for consistent embeddings
   * @private
   */
  _preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate n-grams from text
   * @private
   */
  _getNgrams(text, sizes = [1, 2, 3]) {
    const words = text.split(/\s+/);
    const ngrams = [];
    
    sizes.forEach(size => {
      for (let i = 0; i <= words.length - size; i++) {
        ngrams.push(words.slice(i, i + size).join(' '));
      }
    });
    
    return ngrams;
  }

  /**
   * Simple hash function
   * @private
   */
  _hash(str, seed = 0) {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : Math.max(0, dotProduct / denominator);
  }

  /**
   * Process text into chunks suitable for embedding
   */
  chunkText(text, options = {}) {
    const {
      chunkSize = 1000,
      overlap = 100,
      minChunkSize = 50
    } = options;

    if (!text || text.length < minChunkSize) {
      return [{
        text: text || '',
        index: 0,
        startPos: 0,
        endPos: text ? text.length : 0
      }];
    }

    const chunks = [];
    let position = 0;
    let chunkIndex = 0;

    while (position < text.length) {
      const endPos = Math.min(position + chunkSize, text.length);
      let chunkText = text.substring(position, endPos);

      // Try to end at a sentence or word boundary
      if (endPos < text.length) {
        const sentenceEnd = chunkText.lastIndexOf('.');
        const paragraphEnd = chunkText.lastIndexOf('\n\n');
        const wordEnd = chunkText.lastIndexOf(' ');

        const boundary = Math.max(sentenceEnd, paragraphEnd, wordEnd);
        if (boundary > chunkSize * 0.7) {
          chunkText = chunkText.substring(0, boundary + 1);
        }
      }

      if (chunkText.trim().length >= minChunkSize) {
        chunks.push({
          text: chunkText.trim(),
          index: chunkIndex++,
          startPos: position,
          endPos: position + chunkText.length
        });
      }

      position += chunkText.length - overlap;
    }

    return chunks.length > 0 ? chunks : [{
      text: text,
      index: 0,
      startPos: 0,
      endPos: text.length
    }];
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      loading: false,
      progress: this.isInitialized ? 1 : 0,
      modelName: 'simple-hash-embeddings',
      dimensions: this.dimensions,
      cacheSize: {
        embeddings: this.embedCache.size
      }
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.embedCache.clear();
    console.log('Embedding cache cleared');
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.clearCache();
    this.isInitialized = false;
    this.onProgress = null;
  }
}

// Export singleton instance
export default new SimpleEmbeddingService();