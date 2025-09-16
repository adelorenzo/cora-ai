# Changelog

## [Latest] - 2024-01-16

### Fixed
- Fixed web search functionality by properly refactoring `setMessages` calls to use conversation manager
- Updated `updateLastMessage` helper to support both callback functions and direct object updates
- Resolved message display issues during web search streaming responses

### Changed
- Removed Qwen 2.5 0.5B model from curated models list (now 5 models total)
- Updated model priorities: DeepSeek moved to priority 2

### Added
- Playwright test suite for web search functionality
- Support for Google Chrome browser in test configuration
- Proper model download progress monitoring in tests

## Sprint 5: Chat Management System (Completed)
- Implemented full conversation management with ConversationManager service
- Added ConversationSwitcher UI component with search, archive, and star features
- Integrated export/import functionality for conversations
- Added conversation persistence to localStorage
- Fixed missing UI components (Input, DropdownMenu)
- Supports multiple concurrent conversations with easy switching

## Sprint 4: Settings Persistence (Completed)
- Implemented centralized settings service with localStorage
- Added full settings persistence across sessions
- Integrated persona settings with persistence
- Created comprehensive test suite for settings functionality
- Added export/import capabilities for settings backup

## Previous Updates
- Added web search integration with SearXNG
- Implemented RAG system with document upload
- Added multiple themes and AI personas
- Integrated curated model selection
- Set up PWA with service worker caching