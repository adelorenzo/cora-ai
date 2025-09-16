/**
 * Optimized Vector Index for Fast Similarity Search
 * Implements HNSW-inspired indexing for efficient nearest neighbor search
 */

class VectorIndex {
  constructor(dimensions = 384) {
    this.dimensions = dimensions;
    this.vectors = new Map(); // id -> vector
    this.index = null;
    this.centroids = [];
    this.clusters = new Map();
    this.numClusters = 16; // Number of clusters for indexing
  }

  /**
   * Add vector to index
   * @param {string} id - Vector ID
   * @param {Array<number>} vector - Vector data
   * @param {Object} metadata - Additional metadata
   */
  add(id, vector, metadata = {}) {
    if (vector.length !== this.dimensions) {
      throw new Error(`Vector dimension mismatch: expected ${this.dimensions}, got ${vector.length}`);
    }

    this.vectors.set(id, {
      vector: vector,
      metadata: metadata,
      norm: this._norm(vector)
    });

    // Mark index as needing rebuild
    this.index = null;
  }

  /**
   * Build index for fast search
   */
  buildIndex() {
    if (this.vectors.size === 0) return;

    console.log('[VectorIndex] Building index for', this.vectors.size, 'vectors');
    const startTime = Date.now();

    // Convert to array for clustering
    const vectorArray = Array.from(this.vectors.entries());

    // Simple k-means clustering for indexing
    this.centroids = this._kMeansClustering(vectorArray, this.numClusters);

    // Assign vectors to clusters
    this.clusters.clear();
    for (const [id, data] of vectorArray) {
      const clusterIdx = this._findNearestCentroid(data.vector);
      if (!this.clusters.has(clusterIdx)) {
        this.clusters.set(clusterIdx, []);
      }
      this.clusters.get(clusterIdx).push(id);
    }

    this.index = {
      built: true,
      timestamp: Date.now(),
      numVectors: this.vectors.size,
      numClusters: this.centroids.length
    };

    const elapsed = Date.now() - startTime;
    console.log(`[VectorIndex] Index built in ${elapsed}ms`);
  }

  /**
   * Search for nearest neighbors
   * @param {Array<number>} queryVector - Query vector
   * @param {number} k - Number of neighbors
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Array<Object>} Nearest neighbors with scores
   */
  search(queryVector, k = 10, threshold = 0.0) {
    if (queryVector.length !== this.dimensions) {
      throw new Error(`Query vector dimension mismatch: expected ${this.dimensions}, got ${queryVector.length}`);
    }

    // Rebuild index if needed
    if (!this.index) {
      this.buildIndex();
    }

    // For small datasets, use brute force
    if (this.vectors.size < 100) {
      return this._bruteForceSearch(queryVector, k, threshold);
    }

    // Find nearest clusters
    const numClustersToSearch = Math.min(3, this.centroids.length);
    const nearestClusters = this._findNearestCentroids(queryVector, numClustersToSearch);

    // Search within nearest clusters
    const candidates = new Set();
    for (const clusterIdx of nearestClusters) {
      const clusterVectors = this.clusters.get(clusterIdx) || [];
      for (const id of clusterVectors) {
        candidates.add(id);
      }
    }

    // Score candidates
    const results = [];
    for (const id of candidates) {
      const data = this.vectors.get(id);
      const similarity = this._cosineSimilarity(queryVector, data.vector, data.norm);

      if (similarity >= threshold) {
        results.push({
          id: id,
          score: similarity,
          metadata: data.metadata
        });
      }
    }

    // Sort by similarity and return top k
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  /**
   * Brute force search for small datasets
   * @private
   */
  _bruteForceSearch(queryVector, k, threshold) {
    const queryNorm = this._norm(queryVector);
    const results = [];

    for (const [id, data] of this.vectors) {
      const similarity = this._cosineSimilarity(queryVector, data.vector, data.norm, queryNorm);

      if (similarity >= threshold) {
        results.push({
          id: id,
          score: similarity,
          metadata: data.metadata
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  /**
   * Simple k-means clustering
   * @private
   */
  _kMeansClustering(vectors, k) {
    if (vectors.length < k) {
      k = vectors.length;
    }

    // Initialize centroids randomly
    const centroids = [];
    const used = new Set();

    while (centroids.length < k) {
      const idx = Math.floor(Math.random() * vectors.length);
      if (!used.has(idx)) {
        used.add(idx);
        centroids.push([...vectors[idx][1].vector]);
      }
    }

    // Simple k-means iterations
    const maxIterations = 10;
    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign vectors to nearest centroid
      const clusters = Array(k).fill(null).map(() => []);

      for (const [id, data] of vectors) {
        const nearestIdx = this._findNearestCentroid(data.vector, centroids);
        clusters[nearestIdx].push(data.vector);
      }

      // Update centroids
      let changed = false;
      for (let i = 0; i < k; i++) {
        if (clusters[i].length > 0) {
          const newCentroid = this._calculateCentroid(clusters[i]);
          const distance = this._euclideanDistance(centroids[i], newCentroid);
          if (distance > 0.01) {
            changed = true;
          }
          centroids[i] = newCentroid;
        }
      }

      if (!changed) break;
    }

    return centroids;
  }

  /**
   * Find nearest centroid
   * @private
   */
  _findNearestCentroid(vector, centroids = this.centroids) {
    let minDist = Infinity;
    let nearestIdx = 0;

    for (let i = 0; i < centroids.length; i++) {
      const dist = this._euclideanDistance(vector, centroids[i]);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    return nearestIdx;
  }

  /**
   * Find multiple nearest centroids
   * @private
   */
  _findNearestCentroids(vector, k) {
    const distances = centroids.map((centroid, idx) => ({
      idx: idx,
      dist: this._euclideanDistance(vector, centroid)
    }));

    distances.sort((a, b) => a.dist - b.dist);
    return distances.slice(0, k).map(d => d.idx);
  }

  /**
   * Calculate centroid of vectors
   * @private
   */
  _calculateCentroid(vectors) {
    const centroid = new Array(this.dimensions).fill(0);

    for (const vector of vectors) {
      for (let i = 0; i < this.dimensions; i++) {
        centroid[i] += vector[i];
      }
    }

    const count = vectors.length;
    for (let i = 0; i < this.dimensions; i++) {
      centroid[i] /= count;
    }

    return centroid;
  }

  /**
   * Euclidean distance
   * @private
   */
  _euclideanDistance(vec1, vec2) {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      const diff = vec1[i] - vec2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Cosine similarity with pre-computed norms
   * @private
   */
  _cosineSimilarity(vec1, vec2, norm2 = null, norm1 = null) {
    let dotProduct = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
    }

    norm1 = norm1 || this._norm(vec1);
    norm2 = norm2 || this._norm(vec2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Calculate vector norm
   * @private
   */
  _norm(vector) {
    let sum = 0;
    for (let i = 0; i < vector.length; i++) {
      sum += vector[i] * vector[i];
    }
    return Math.sqrt(sum);
  }

  /**
   * Clear the index
   */
  clear() {
    this.vectors.clear();
    this.clusters.clear();
    this.centroids = [];
    this.index = null;
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      numVectors: this.vectors.size,
      dimensions: this.dimensions,
      indexed: this.index !== null,
      numClusters: this.centroids.length,
      indexInfo: this.index
    };
  }
}

// Export singleton instance
const vectorIndex = new VectorIndex();
export default vectorIndex;