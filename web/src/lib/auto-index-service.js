/**
 * Auto-indexing service for seamless RAG experience
 * Automatically indexes pending documents when RAG is ready
 */

import dbService from './database/db-service';
import ragService from './embeddings/rag-service';

class AutoIndexService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.indexingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Start the auto-indexing service
   */
  start() {
    if (this.isRunning) return;

    console.log('[AutoIndex] Starting auto-indexing service');
    this.isRunning = true;

    // Check for pending documents every 3 seconds
    this.interval = setInterval(() => {
      this.checkAndIndexPendingDocuments();
    }, 3000);

    // Run immediately
    this.checkAndIndexPendingDocuments();
  }

  /**
   * Stop the auto-indexing service
   */
  stop() {
    if (!this.isRunning) return;

    console.log('[AutoIndex] Stopping auto-indexing service');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Check for pending documents and index them
   */
  async checkAndIndexPendingDocuments() {
    // Skip if already processing or services not ready
    if (this.isProcessing || !dbService.initialized || !ragService.initialized) {
      return;
    }

    try {
      this.isProcessing = true;

      // Find pending documents
      const documents = await dbService.searchDocuments({
        status: 'pending',
        indexed: false
      }, { limit: 5 }); // Process up to 5 at a time

      if (documents.length === 0) {
        return;
      }

      console.log(`[AutoIndex] Found ${documents.length} pending documents to index`);

      // Index each document
      for (const doc of documents) {
        try {
          console.log(`[AutoIndex] Indexing document: ${doc.title}`);

          // Update status to processing
          await dbService.updateDocument(doc._id, {
            status: 'processing'
          });

          // Add to RAG index
          await ragService.addDocument({
            content: doc.content,
            metadata: {
              title: doc.title,
              filename: doc.filename,
              documentId: doc._id,
              type: doc.contentType
            }
          });

          // Update status to completed
          await dbService.updateDocument(doc._id, {
            status: 'completed',
            indexed: true,
            indexedAt: new Date()
          });

          console.log(`[AutoIndex] Successfully indexed: ${doc.title}`);
        } catch (error) {
          console.error(`[AutoIndex] Failed to index document ${doc.title}:`, error);

          // Mark as error
          await dbService.updateDocument(doc._id, {
            status: 'error',
            indexed: false,
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error('[AutoIndex] Error checking pending documents:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Manually trigger indexing of a specific document
   */
  async indexDocument(documentId) {
    if (!ragService.initialized) {
      console.warn('[AutoIndex] RAG not initialized, document will be indexed when ready');
      return;
    }

    try {
      const doc = await dbService.getDocument(documentId);

      if (doc.indexed) {
        console.log(`[AutoIndex] Document already indexed: ${doc.title}`);
        return;
      }

      await dbService.updateDocument(doc._id, {
        status: 'processing'
      });

      await ragService.addDocument({
        content: doc.content,
        metadata: {
          title: doc.title,
          filename: doc.filename,
          documentId: doc._id,
          type: doc.contentType
        }
      });

      await dbService.updateDocument(doc._id, {
        status: 'completed',
        indexed: true,
        indexedAt: new Date()
      });

      console.log(`[AutoIndex] Successfully indexed: ${doc.title}`);
    } catch (error) {
      console.error(`[AutoIndex] Failed to index document:`, error);

      try {
        await dbService.updateDocument(documentId, {
          status: 'error',
          indexed: false,
          error: error.message
        });
      } catch (updateError) {
        console.error('[AutoIndex] Failed to update document status:', updateError);
      }

      throw error;
    }
  }

  /**
   * Re-index all documents
   */
  async reindexAll() {
    if (!ragService.initialized) {
      throw new Error('RAG service not initialized');
    }

    console.log('[AutoIndex] Re-indexing all documents');

    try {
      // Get all documents
      const documents = await dbService.searchDocuments({}, { limit: 1000 });

      // Clear existing index
      await ragService.clearIndex();

      // Mark all as pending
      for (const doc of documents) {
        await dbService.updateDocument(doc._id, {
          status: 'pending',
          indexed: false
        });
      }

      console.log(`[AutoIndex] Marked ${documents.length} documents for re-indexing`);

      // The auto-indexing service will pick them up
    } catch (error) {
      console.error('[AutoIndex] Failed to re-index documents:', error);
      throw error;
    }
  }
}

// Export singleton instance
const autoIndexService = new AutoIndexService();
export default autoIndexService;