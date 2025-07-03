const { createClient } = require('@supabase/supabase-js');

class DatabaseManager {
  constructor(supabaseUrl, supabaseServiceKey) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async withRetry(operation, operationName) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`${operationName} attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.retryAttempts) {
          throw new Error(`${operationName} failed after ${this.retryAttempts} attempts: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async insertPolicy(policyData) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .insert([policyData])
        .select();

      if (error) throw error;
      return data[0];
    }, 'Insert Policy');
  }

  async insertWelfareService(serviceData) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('welfare_services')
        .insert([serviceData])
        .select();

      if (error) throw error;
      return data[0];
    }, 'Insert Welfare Service');
  }

  async upsertPolicy(policyData, conflictColumn = 'title') {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .upsert(policyData, {
          onConflict: conflictColumn,
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;
      return data[0];
    }, 'Upsert Policy');
  }

  async upsertWelfareService(serviceData, conflictColumn = 'service_id') {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('welfare_services')
        .upsert(serviceData, {
          onConflict: conflictColumn,
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;
      return data[0];
    }, 'Upsert Welfare Service');
  }

  async getPoliciesByCategory(categorySlug, limit = 10) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .select(`
          *,
          policy_categories!inner(slug, name),
          government_agencies(name, logo_url)
        `)
        .eq('policy_categories.slug', categorySlug)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }, 'Get Policies by Category');
  }

  async getLatestPolicies(limit = 10) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .select(`
          *,
          policy_categories(slug, name),
          government_agencies(name, logo_url)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }, 'Get Latest Policies');
  }

  async getPopularPolicies(limit = 10) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .select(`
          *,
          policy_categories(slug, name),
          government_agencies(name, logo_url)
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }, 'Get Popular Policies');
  }

  async searchPolicies(query, limit = 20) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .select(`
          *,
          policy_categories(slug, name),
          government_agencies(name, logo_url)
        `)
        .or(`title.ilike.%${query}%, summary.ilike.%${query}%, keywords.ilike.%${query}%`)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }, 'Search Policies');
  }

  async searchWelfareServices(query, limit = 20) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('welfare_services')
        .select('*')
        .or(`service_name.ilike.%${query}%, service_purpose.ilike.%${query}%, service_target.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }, 'Search Welfare Services');
  }

  async getWelfareServicesByLifeCycle(lifeCycle, limit = 20) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('welfare_services')
        .select('*')
        .eq('life_cycle', lifeCycle)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }, 'Get Welfare Services by Life Cycle');
  }

  async getWelfareServiceDetail(serviceId) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('welfare_services')
        .select('*')
        .eq('service_id', serviceId)
        .single();

      if (error) throw error;
      return data;
    }, 'Get Welfare Service Detail');
  }

  async incrementPolicyViewCount(policyId) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .rpc('increment_policy_view_count', { policy_id: policyId });

      if (error) throw error;
      return data;
    }, 'Increment Policy View Count');
  }

  async getCategories() {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policy_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    }, 'Get Categories');
  }

  async getGovernmentAgencies() {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('government_agencies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    }, 'Get Government Agencies');
  }

  async checkDuplicatePolicy(title, publishedDate) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .select('id')
        .eq('title', title)
        .eq('published_at', publishedDate)
        .limit(1);

      if (error) throw error;
      return data.length > 0;
    }, 'Check Duplicate Policy');
  }

  async checkDuplicateWelfareService(serviceId) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('welfare_services')
        .select('id')
        .eq('service_id', serviceId)
        .limit(1);

      if (error) throw error;
      return data.length > 0;
    }, 'Check Duplicate Welfare Service');
  }

  async getCollectionStats() {
    return this.withRetry(async () => {
      const [policiesResult, welfareResult] = await Promise.all([
        this.supabase.from('policies').select('id', { count: 'exact', head: true }),
        this.supabase.from('welfare_services').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalPolicies: policiesResult.count || 0,
        totalWelfareServices: welfareResult.count || 0,
        lastUpdated: new Date().toISOString()
      };
    }, 'Get Collection Stats');
  }

  async getPolicyById(policyId) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .select(`
          *,
          policy_categories(slug, name),
          government_agencies(name, logo_url)
        `)
        .eq('id', policyId)
        .single();

      if (error) throw error;
      return data;
    }, 'Get Policy by ID');
  }

  async updatePolicyVisuals(policyId, visualData) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .update({
          thumbnail_url: visualData.thumbnail_url,
          keypoints_urls: visualData.keypoints_urls,
          infographic_url: visualData.infographic_url,
          visuals_generated_at: new Date().toISOString(),
          visual_generation_status: 'completed'
        })
        .eq('id', policyId)
        .select();

      if (error) throw error;
      return data[0];
    }, 'Update Policy Visuals');
  }

  async uploadToSupabaseStorage(buffer, fileName, bucket = 'policy-visuals') {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (error) throw error;

      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    }, 'Upload to Supabase Storage');
  }

  async getPoliciesNeedingVisuals(limit = 10) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('policies')
        .select(`
          *,
          policy_categories(slug, name),
          government_agencies(name, logo_url)
        `)
        .is('thumbnail_url', null)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }, 'Get Policies Needing Visuals');
  }
}

module.exports = DatabaseManager;