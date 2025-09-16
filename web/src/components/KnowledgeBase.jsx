import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  File, 
  Trash2, 
  Eye, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import dbService from '../lib/database/db-service';
import ragService from '../lib/embeddings/rag-service';
import { cn } from '../lib/utils';

const KnowledgeBase = ({ open, onOpenChange, onRAGStatusChange }) => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [ragInitialized, setRagInitialized] = useState(false);
  const [initializingRAG, setInitializingRAG] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Update search results when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Initialize database if not already initialized
      if (!dbService.initialized) {
        await dbService.initialize();
      }
      
      // Load documents
      const docs = await dbService.searchDocuments({}, { limit: 1000 });
      setDocuments(docs);

      // Load stats
      const ragStats = await ragService.getStats();
      setStats(ragStats);

      // Check RAG initialization status
      setRagInitialized(ragService.initialized);
      
      // Notify parent about RAG status
      const indexedCount = docs.filter(d => d.indexed).length;
      onRAGStatusChange?.({
        enabled: indexedCount > 0,
        documentCount: docs.length,
        indexedCount
      });

    } catch (error) {
      console.error('Failed to load knowledge base data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeRAG = async () => {
    setInitializingRAG(true);
    try {
      await ragService.initialize((progress) => {
        console.log('RAG initialization progress:', progress);
      });
      setRagInitialized(true);
      
      // Don't auto-index documents to prevent memory issues
      // Users can manually click "Index All" button after initialization
      console.log('RAG initialized successfully. Use "Index All" button to index documents.');
      
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to initialize RAG:', error);
      alert(`Failed to initialize RAG: ${error.message}`);
    } finally {
      setInitializingRAG(false);
    }
  };

  const performSearch = async (query) => {
    if (!ragInitialized) return;
    
    setIsSearching(true);
    try {
      const results = await ragService.search(query, { limit: 10 });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document? This will also remove it from the RAG index.')) {
      return;
    }

    try {
      await dbService.deleteDocument(docId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  const reindexDocument = async (doc) => {
    try {
      // Reset document status
      await dbService.updateDocument(doc._id, {
        status: 'pending',
        indexed: false
      });

      // Queue for reindexing
      ragService.queueForIndexing(doc);
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Failed to reindex document:', error);
      alert(`Reindex failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status, indexed) => {
    if (indexed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'processing') return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusText = (status, indexed) => {
    if (indexed) return 'Indexed';
    if (status === 'processing') return 'Processing';
    if (status === 'error') return 'Error';
    return 'Pending';
  };

  const filteredDocuments = documents.filter(doc =>
    searchQuery === '' || 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
  const indexedCount = documents.filter(d => d.indexed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-6xl max-h-[90vh] bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Knowledge Base
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[75vh] gap-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-secondary/50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold">{documents.length}</div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{indexedCount}</div>
              <div className="text-xs text-muted-foreground">Indexed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
              <div className="text-xs text-muted-foreground">Total Size</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                ragInitialized ? "text-green-500" : "text-red-500"
              )}>
                {ragInitialized ? "Ready" : "Offline"}
              </div>
              <div className="text-xs text-muted-foreground">RAG Status</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents or perform semantic search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {!ragInitialized && (
              <Button 
                onClick={initializeRAG} 
                disabled={initializingRAG}
                variant="outline"
                className="whitespace-nowrap"
              >
                {initializingRAG ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Initialize RAG
                  </>
                )}
              </Button>
            )}

            {ragInitialized && documents.some(doc => !doc.indexed) && (
              <Button 
                onClick={async () => {
                  const pendingDocs = documents.filter(doc => !doc.indexed && doc.status !== 'error');
                  
                  // Process documents one at a time with delays to prevent memory issues
                  for (let i = 0; i < pendingDocs.length; i++) {
                    const doc = pendingDocs[i];
                    console.log(`Queueing for indexing (${i + 1}/${pendingDocs.length}): ${doc.name || doc.title}`);
                    ragService.queueForIndexing(doc);
                    
                    // Add delay between documents to prevent memory overload
                    if (i < pendingDocs.length - 1) {
                      await new Promise(resolve => setTimeout(resolve, 500));
                    }
                  }
                  
                  // Refresh data after a longer delay
                  setTimeout(loadData, 2000);
                }}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Database className="w-4 h-4 mr-2" />
                Index All ({documents.filter(doc => !doc.indexed).length})
              </Button>
            )}

            <Button 
              onClick={loadData} 
              variant="outline" 
              size="icon"
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            
            {documents.some(doc => doc.status === 'processing') && (
              <Button
                onClick={async () => {
                  console.log('Resetting stuck documents...');
                  const processingDocs = documents.filter(doc => doc.status === 'processing');
                  for (const doc of processingDocs) {
                    await dbService.updateDocument(doc._id, {
                      status: 'pending',
                      indexed: false
                    });
                  }
                  await loadData();
                  console.log('Reset complete');
                }}
                variant="outline"
                size="sm"
                className="text-orange-500 hover:text-orange-600"
                title="Reset stuck documents"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Reset Stuck
              </Button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                {/* Search Results */}
                {searchQuery && ragInitialized && searchResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Semantic Search Results ({searchResults.length})
                      {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div key={index} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{result.document.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {Math.round(result.score * 100)}% match
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const doc = documents.find(d => d._id === result.document.id);
                                if (doc) setSelectedDoc(doc);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs mt-2 text-foreground/80 line-clamp-2">
                            {result.context || result.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document List */}
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    All Documents ({filteredDocuments.length})
                  </h3>
                  
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {documents.length === 0 ? (
                        <div>
                          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No documents uploaded yet</p>
                          <p className="text-xs mt-2">Upload documents to start building your knowledge base</p>
                        </div>
                      ) : (
                        <p>No documents match your search</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <File className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                              {getStatusIcon(doc.status, doc.indexed)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>{formatDate(doc.createdAt)}</span>
                              <Badge 
                                variant={doc.indexed ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {getStatusText(doc.status, doc.indexed)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedDoc(doc)}
                              className="h-8 w-8"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            {ragInitialized && !doc.indexed && doc.status !== 'processing' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  console.log(`Indexing single document: ${doc.title}`);
                                  ragService.queueForIndexing(doc);
                                  // Refresh after a delay
                                  setTimeout(loadData, 1000);
                                }}
                                className="h-8 w-8"
                                title={doc.status === 'error' ? "Retry indexing" : "Index document"}
                              >
                                {doc.status === 'error' ? (
                                  <RefreshCw className="w-3 h-3" />
                                ) : (
                                  <Database className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteDocument(doc._id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 z-[60]">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedDoc(null)}
            />
            <div className="fixed left-[50%] top-[50%] z-[60] translate-x-[-50%] translate-y-[-50%]">
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedDoc.title}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{formatFileSize(selectedDoc.size)}</span>
                      <span>{formatDate(selectedDoc.createdAt)}</span>
                      <Badge variant={selectedDoc.indexed ? 'default' : 'secondary'}>
                        {getStatusText(selectedDoc.status, selectedDoc.indexed)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDoc(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-secondary/50 p-4 rounded-lg">
                    {selectedDoc.content.length > 10000 
                      ? selectedDoc.content.substring(0, 10000) + '\n\n... (content truncated for display)'
                      : selectedDoc.content
                    }
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeBase;