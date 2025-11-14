/**
 * Test script for the Pharmacy Management Desktop Application
 * This script tests various components and functionality of the desktop app
 */

const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  apiUrl: 'http://localhost:8000',
  testUser: {
    username: 'admin',
    password: 'admin123'
  },
  testTenant: 'default'
};

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAILED - ${message}`);
  }
  
  testResults.details.push({
    test: testName,
    passed,
    message
  });
}

// Test 1: Check if all required files exist
function testRequiredFiles() {
  console.log('\n🔍 Testing required files...');
  
  const requiredFiles = [
    'public/electron.js',
    'public/preload.js',
    'public/index.html',
    'src/App.js',
    'src/index.js',
    'src/services/api.js',
    'src/components/Login.js',
    'src/components/Dashboard.js',
    'src/components/Patients.js',
    'src/components/Inventory.js',
    'src/components/Prescriptions.js',
    'src/components/PointOfSale.js',
    'src/components/Reports.js',
    'src/components/Settings.js',
    'src/components/Billing.js',
    'src/components/Support.js',
    'package.json'
  ];
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    logTest(`File exists: ${file}`, exists);
  });
}

// Test 2: Check package.json dependencies
function testPackageDependencies() {
  console.log('\n🔍 Testing package.json dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    // Check required dependencies
    const requiredDeps = [
      'electron',
      'react',
      'react-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      'axios'
    ];
    
    requiredDeps.forEach(dep => {
      const hasDep = (packageJson.dependencies && packageJson.dependencies[dep]) ||
                    (packageJson.devDependencies && packageJson.devDependencies[dep]);
      logTest(`Dependency exists: ${dep}`, !!hasDep);
    });
    
    // Check required scripts
    const requiredScripts = ['start', 'build', 'package:win', 'package:mac', 'package:linux'];
    requiredScripts.forEach(script => {
      const hasScript = packageJson.scripts && packageJson.scripts[script];
      logTest(`Script exists: ${script}`, !!hasScript);
    });
    
  } catch (error) {
    logTest('Parse package.json', false, error.message);
  }
}

// Test 3: Check API service configuration
function testApiService() {
  console.log('\n🔍 Testing API service configuration...');
  
  try {
    const apiServicePath = path.join(__dirname, 'src/services/api.js');
    const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
    
    // Check for required service methods
    const requiredMethods = [
      'authService',
      'patientService',
      'inventoryService',
      'prescriptionService',
      'posService',
      'reportService',
      'settingsService',
      'billingService',
      'supportService'
    ];
    
    requiredMethods.forEach(method => {
      const hasMethod = apiServiceContent.includes(method);
      logTest(`API service has ${method}`, hasMethod);
    });
    
    // Check for authentication interceptor
    const hasAuthInterceptor = apiServiceContent.includes('interceptors.request.use');
    logTest('API service has auth interceptor', hasAuthInterceptor);
    
  } catch (error) {
    logTest('Load API service', false, error.message);
  }
}

// Test 4: Check component imports and exports
function testComponentStructure() {
  console.log('\n🔍 Testing component structure...');
  
  const components = [
    'Login',
    'Dashboard',
    'Patients',
    'Inventory',
    'Prescriptions',
    'PointOfSale',
    'Reports',
    'Settings',
    'Billing',
    'Support'
  ];
  
  components.forEach(component => {
    try {
      const componentPath = path.join(__dirname, `src/components/${component}.js`);
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      // Check for proper React component structure
      const hasExport = componentContent.includes('export') || componentContent.includes('module.exports');
      const hasImport = componentContent.includes('import') || componentContent.includes('require');
      const hasFunction = componentContent.includes('function') || componentContent.includes('class') || componentContent.includes('const');
      
      logTest(`${component} has proper structure`, hasExport && hasImport && hasFunction);
      
    } catch (error) {
      logTest(`Load ${component} component`, false, error.message);
    }
  });
}

// Test 5: Check environment configuration
function testEnvironmentConfig() {
  console.log('\n🔍 Testing environment configuration...');
  
  try {
    const envExamplePath = path.join(__dirname, '.env.example');
    const envExampleExists = fs.existsSync(envExamplePath);
    logTest('.env.example exists', envExampleExists);
    
    if (envExampleExists) {
      const envContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Check for required environment variables
      const requiredEnvVars = [
        'REACT_APP_API_URL',
        'REACT_APP_API_TIMEOUT',
        'ELECTRON_IS_DEV',
        'REACT_APP_NAME'
      ];
      
      requiredEnvVars.forEach(envVar => {
        const hasVar = envContent.includes(envVar);
        logTest(`Environment variable defined: ${envVar}`, hasVar);
      });
    }
    
  } catch (error) {
    logTest('Load environment configuration', false, error.message);
  }
}

// Test 6: Check Electron main process configuration
function testElectronMain() {
  console.log('\n🔍 Testing Electron main process...');
  
  try {
    const electronMainPath = path.join(__dirname, 'public/electron.js');
    const electronContent = fs.readFileSync(electronMainPath, 'utf8');
    
    // Check for required Electron functionality
    const hasApp = electronContent.includes('app.whenReady');
    const hasWindow = electronContent.includes('BrowserWindow');
    const hasLoadFile = electronContent.includes('loadFile') || electronContent.includes('loadURL');
    const hasSecurity = electronContent.includes('webSecurity') || electronContent.includes('contextIsolation');
    
    logTest('Electron app initialization', hasApp);
    logTest('BrowserWindow creation', hasWindow);
    logTest('File loading', hasLoadFile);
    logTest('Security configuration', hasSecurity);
    
  } catch (error) {
    logTest('Load Electron main process', false, error.message);
  }
}

// Test 7: Check preload script configuration
function testPreloadScript() {
  console.log('\n🔍 Testing preload script...');
  
  try {
    const preloadPath = path.join(__dirname, 'public/preload.js');
    const preloadContent = fs.readFileSync(preloadPath, 'utf8');
    
    // Check for required preload functionality
    const hasContext = preloadContent.includes('contextBridge');
    const hasExpose = preloadContent.includes('exposeInMainWorld');
    
    logTest('Context bridge usage', hasContext);
    logTest('API exposure', hasExpose);
    
  } catch (error) {
    logTest('Load preload script', false, error.message);
  }
}

// Test 8: Check HTML template
function testHTMLTemplate() {
  console.log('\n🔍 Testing HTML template...');
  
  try {
    const htmlPath = path.join(__dirname, 'public/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for required HTML elements
    const hasTitle = htmlContent.includes('<title>');
    const hasDiv = htmlContent.includes('<div id="root">');
    const hasScript = htmlContent.includes('<script') || htmlContent.includes('%PUBLIC_URL%');
    
    logTest('HTML has title', hasTitle);
    logTest('HTML has root div', hasDiv);
    logTest('HTML has script tag or React placeholder', hasScript);
    
  } catch (error) {
    logTest('Load HTML template', false, error.message);
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Pharmacy Management Desktop Application Tests...\n');
  
  testRequiredFiles();
  testPackageDependencies();
  testApiService();
  testComponentStructure();
  testEnvironmentConfig();
  testElectronMain();
  testPreloadScript();
  testHTMLTemplate();
  
  // Print test summary
  console.log('\n📊 Test Results Summary:');
  console.log(`Total tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => console.log(`  - ${test.test}: ${test.message}`));
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testResults
};