export default {
  async fetch(request, env) {
    try {
      // Try to fetch the static asset
      let response = await env.ASSETS.fetch(request);
      
      // If the asset is not found (404), fallback to index.html for SPA routing
      if (response.status === 404) {
        return env.ASSETS.fetch(new Request(new URL("/", request.url)));
      }
      
      return response;
    } catch (e) {
      // In case of any error, return a 500 error
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
