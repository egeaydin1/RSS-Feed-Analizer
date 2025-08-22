// Test script for Portfolio RSS API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Portfolio RSS API Test Suite Starting...\n');

  const tests = [
    {
      name: 'API Documentation',
      url: `${BASE_URL}/`,
      expect: 'API bilgisi'
    },
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health`,
      expect: 'healthy status'
    },
    {
      name: 'Company List',
      url: `${BASE_URL}/api/companies`,
      expect: 'şirket listesi'
    },
    {
      name: 'NVIDIA News',
      url: `${BASE_URL}/api/news/nvidia?limit=3`,
      expect: 'NVIDIA haberleri'
    },
    {
      name: 'All Companies News',
      url: `${BASE_URL}/api/news/all?limit=2`,
      expect: 'tüm şirket haberleri'
    },
    {
      name: 'Quantum Sector News',
      url: `${BASE_URL}/api/sectors/quantum?limit=3`,
      expect: 'quantum sektörü haberleri'
    },
    {
      name: 'Search Test',
      url: `${BASE_URL}/api/search/earnings?limit=3`,
      expect: 'arama sonuçları'
    },
    {
      name: 'RSS Feed Test',
      url: `${BASE_URL}/api/feed/nvidia`,
      expect: 'RSS XML feed'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      const startTime = Date.now();
      const response = await axios.get(test.url, { timeout: 15000 });
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ ${test.name} - Status: ${response.status} (${responseTime}ms)`);
      
      // Response içeriğini kontrol et
      if (response.data) {
        if (typeof response.data === 'object' && response.data.success !== undefined) {
          if (response.data.success) {
            console.log(`   📊 Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
          } else {
            console.log(`   ⚠️  API returned success: false - ${response.data.error}`);
          }
        } else if (typeof response.data === 'string' && response.data.includes('<?xml')) {
          console.log(`   📋 RSS XML data received (${response.data.length} chars)`);
        }
      }
      
      passedTests++;
      
    } catch (error) {
      console.log(`❌ ${test.name} - Failed`);
      console.log(`   Error: ${error.message}`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log(''); // Boş satır
  }

  // Test sonuçları
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! API is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the API server and RSSHub connection.');
    process.exit(1);
  }
}

// Test'i çalıştır
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
