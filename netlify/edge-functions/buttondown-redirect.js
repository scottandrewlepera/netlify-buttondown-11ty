export default async (request, context) => {

  const isRegular = context.cookies.get(Deno.env.get("BD_REGULAR"));
  const isPremium = context.cookies.get(Deno.env.get("BD_PREMIUM"));

  if (!isRegular && !isPremium) {
    let url = new URL(request.url).pathname;
    return Response.redirect(`/login/?r=${url}`);
  }
};
