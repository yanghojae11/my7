// Test script to verify Supabase connection and data
const { createClient } = require('@supabase/supabase-js');

// Use environment variables or hardcoded values for testing
const supabaseUrl = 'https://oeyzvklspipwyqilndbo.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your_actual_anon_key_here';

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test 1: Basic connection
    console.log('\n1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Connection failed:', testError.message);
      return;
    }
    console.log('✅ Connection successful!');
    
    // Test 2: Count articles
    console.log('\n2. Counting articles...');
    const { count, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Count failed:', countError.message);
    } else {
      console.log(`✅ Found ${count} articles in database`);
    }
    
    // Test 3: Fetch sample articles
    console.log('\n3. Fetching sample articles...');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, category, created_at, status')
      .eq('status', 'published')
      .limit(5);
    
    if (articlesError) {
      console.log('❌ Articles fetch failed:', articlesError.message);
    } else {
      console.log(`✅ Retrieved ${articles.length} sample articles:`);
      articles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title} (${article.category})`);
      });
    }
    
    // Test 4: Check categories distribution
    console.log('\n4. Checking category distribution...');
    const { data: categoryData, error: catError } = await supabase
      .from('articles')
      .select('category')
      .eq('status', 'published');
    
    if (catError) {
      console.log('❌ Category check failed:', catError.message);
    } else {
      const categories = {};
      categoryData.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;  
      });
      console.log('✅ Category distribution:');
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} articles`);
      });
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the test
testConnection();