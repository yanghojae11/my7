'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function SupabaseConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const testResults: TestResult[] = [];

      // Test 1: Basic connection
      try {
        const { error: connectionError } = await supabase.from('articles').select('count').limit(1);
        if (connectionError) {
          testResults.push({
            success: false,
            message: 'Supabase Connection',
            error: connectionError.message
          });
        } else {
          testResults.push({
            success: true,
            message: 'Supabase Connection',
            data: 'Connected successfully'
          });
        }
      } catch (error) {
        testResults.push({
          success: false,
          message: 'Supabase Connection',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 2: Check articles table
      try {
        const { data: articles, error: articlesError, count } = await supabase
          .from('articles')
          .select('*', { count: 'exact' })
          .limit(5);

        if (articlesError) {
          testResults.push({
            success: false,
            message: 'Articles Table Query',
            error: articlesError.message
          });
        } else {
          testResults.push({
            success: true,
            message: 'Articles Table Query',
            data: `Found ${count} total articles, showing first ${articles?.length || 0}`,
          });
        }
      } catch (error) {
        testResults.push({
          success: false,
          message: 'Articles Table Query',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 3: Check policies table
      try {
        const { data: policies, error: policiesError, count } = await supabase
          .from('policies')
          .select('*', { count: 'exact' })
          .limit(5);

        if (policiesError) {
          testResults.push({
            success: false,
            message: 'Policies Table Query',
            error: policiesError.message
          });
        } else {
          testResults.push({
            success: true,
            message: 'Policies Table Query',
            data: `Found ${count} total policies, showing first ${policies?.length || 0}`,
          });
        }
      } catch (error) {
        testResults.push({
          success: false,
          message: 'Policies Table Query',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 4: API call test
      try {
        const response = await fetch('/api/articles?limit=5');
        const apiResult = await response.json();
        
        if (apiResult.success) {
          testResults.push({
            success: true,
            message: 'API Articles Endpoint',
            data: `API returned ${apiResult.data?.length || 0} articles out of ${apiResult.count || 0} total`
          });
        } else {
          testResults.push({
            success: false,
            message: 'API Articles Endpoint',
            error: apiResult.error || 'API returned unsuccessful response'
          });
        }
      } catch (error) {
        testResults.push({
          success: false,
          message: 'API Articles Endpoint',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setResults(testResults);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-800 mb-4">🔍 Testing Supabase Connection...</h2>
        <div className="animate-pulse">Running diagnostic tests...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Supabase Connection Diagnostics</h2>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {result.success ? '✅' : '❌'}
              </span>
              <strong>{result.message}</strong>
            </div>
            {result.data && (
              <div className="text-sm opacity-80">
                {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
              </div>
            )}
            {result.error && (
              <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-2">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}