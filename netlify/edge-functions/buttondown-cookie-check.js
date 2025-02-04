import {
  EleventyEdge,
  precompiledAppData,
} from "./_generated/eleventy-edge-app.js";

export default async (request, context) => {

  const isRegular = context.cookies.get(Deno.env.get("BD_REGULAR"));
  const isPremium = context.cookies.get(Deno.env.get("BD_PREMIUM"));

  // return_to URL must be relative
  const url = new URL(request.url);
  let r = url.searchParams.get('r');
  if (r && !r.match(/^\/(?!\/)/)) {
    r = null;
  }

  try {
    let edge = new EleventyEdge("edge", {
      request,
      context,
      precompiled: precompiledAppData,
      cookies: [],
    });

    edge.config((eleventyConfig) => {
      eleventyConfig.addGlobalData("isRegular", !!isRegular);
      eleventyConfig.addGlobalData("isPremium", !!isPremium);
      if (r) {
        eleventyConfig.addGlobalData("return_to", r);
      }
    });

    return await edge.handleResponse();
  } catch (e) {
    console.log("ERROR", { e });
    return context.next(e);
  }
};
