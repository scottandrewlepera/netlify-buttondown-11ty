export default async (request, context) => {

  const origin = request.headers.get('origin') ??
    request.headers.get('referer');
  if (origin !== context.site.url) {
    return new Response("404 Not Found", {status: 404});
  }
  const body = await request.text();
  const email = new URLSearchParams(body).get('email');

  if (!email) {
    return Response.redirect("/error/");
  }

  // Simple email validation. Don't @ me.
  const re = /^[^\s@\<\{\%]+@[^\s@\<\{\%]+\.[^\s@\<\{\%]+$/;

  if (!email.match(re)) {
    return Response.redirect("/error/");
  }

  const apiUrl = `https://api.buttondown.com/v1/subscribers/${email}`;

  const options = {
    method: 'GET',
    headers: {
      'authorization': Deno.env.get('BUTTONDOWN_API_TOKEN'),
      'accept': 'application/json'
    }
  };

  let response;
  try {
    response = await fetch(apiUrl, options)
      .then(response => response.json());
  } catch (e) {
    return Response.redirect("/error/");
  }

  const sub = response.subscriber_type;
  let cookieName;

  if (sub === "regular")  {
    cookieName = "BD_REGULAR";
  } else if (sub === "premium" || sub === "gifted")  {
    cookieName = "BD_PREMIUM";
  } else {
    return Response.redirect("/nosub/");
  }

  const now = new Date().getMonth();
  const cookieDuration = parseInt(Deno.env.get('COOKIE_DURATION_MONTHS'), 10);
  var expires = new Date().setMonth((now + cookieDuration));
  
  context.cookies.set({
    name: Deno.env.get(cookieName),
    value: "true",
    path: "/",
    expires
  });

  return Response.redirect("/success/");
}
