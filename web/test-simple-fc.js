import functionCallingService from './src/lib/function-calling-service.js';

console.log('Testing Function Calling Service\n');

// Test 1: Check manual function calling prompt
console.log('1. Manual Function Calling Prompt:');
console.log(functionCallingService.getManualFunctionCallingPrompt());
console.log('\n---\n');

// Test 2: Detect manual function call patterns
const testCases = [
  '[SEARCH: weather in Tokyo]',
  '[search: quantum computing news]',
  'The weather in Tokyo is nice',
  '*web_search weather tokyo*',
  '[FUNCTION: web_search(weather)]',
  'Just a normal response'
];

console.log('2. Pattern Detection Tests:');
testCases.forEach(text => {
  const result = functionCallingService.detectManualFunctionCall(text);
  if (result.detected) {
    console.log(`✓ "${text}" -> Detected: ${result.function}("${result.query}")`);
  } else {
    console.log(`✗ "${text}" -> Not detected`);
  }
});

console.log('\n---\n');

// Test 3: Check if web search triggers work
const queries = [
  'What is the weather in Paris?',
  'Search for news about AI',
  'Hello, how are you?',
  'Research quantum computing',
  'Find information about WebGPU'
];

console.log('3. Web Search Trigger Tests:');
queries.forEach(query => {
  const shouldSearch = functionCallingService.shouldUseWebSearch(query);
  console.log(`"${query}" -> ${shouldSearch ? '✓ Should search' : '✗ No search needed'}`);
});

console.log('\n---\n');

// Test 4: Check model support
const models = [
  'Hermes-3-Llama-3.1-8B-q4f16_1-MLC',
  'Phi-3.5-mini-instruct-q4f16_1-MLC',
  'Llama-3.2-1B-Instruct-q4f16_1-MLC'
];

console.log('4. Model Support Tests:');
models.forEach(model => {
  const supports = functionCallingService.supportsModelFunctionCalling(model);
  console.log(`${model} -> ${supports ? '✓ Supports function calling' : '✗ No support'}`);
});

console.log('\nAll tests completed!');