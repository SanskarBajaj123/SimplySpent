export default ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: '7918be4a-cbf6-4cd2-ad62-4355cdccdd82'
    }
  }
})
