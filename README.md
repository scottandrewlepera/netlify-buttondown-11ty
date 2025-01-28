# Netlify + Buttondown + 11ty Integration Demo

Use [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/) and the [Buttondown API](https://docs.buttondown.com/api-introduction) to gate subscriber-only content on your static [Eleventy website](https://www.11ty.dev/).

## How it works

A Netlify edge function uses the Buttondown API to confirm if an email address is subscribed. If so, the edge function returns a cookie, indicating that the subscriber is either regular (free) or premium (paid).

A second edge function is then used to check the subscription status based on the cookie and generate content with the [Eleventy Edge plug-in](https://www.11ty.dev/).

## Important caveats

- This demo relies on Eleventy v2.x, which has the Edge plug-in included. This plug-in was removed in version 3.0, so this demo will not work if you upgrade from 2.x. You can also try using this [drop-in replacement](https://github.com/scottandrewlepera/eleventy-edge-plugin-shrinkwrapped).
- This is not true user authentication, but a lightweight integration. There are no passwords involved, just a lookup to confirm an email is  subscribed to your Buttondown list.
- Usage may subject your website to GDPR data protections. It's up to you to figure this out.
- Netlify edge function invocations and Buttondown API calls may be metered or throttled, so applying the lookup and/or cookie check to your entire site is not recommended. Instead, limit the cookie check to the areas of your site that have subscriber-only content, and never use the lookup function for anything other than the lookup form target.

## Requirements

You'll need:

- Eleventy 2.x (included)
- a [Netlify](https://netlify.com) account (to deploy your site)
- a [Buttondown](https://buttondown.com) account with an API token

You'll need to have the following installed on your development machine:

- Node v14 or higher
- the [Netlify CLI](https://docs.netlify.com/cli/get-started/)

NOTE: This app is built on Eleventy 2.0, which includes the EleventyEdge plug-in. [Newer versions of Eleventy do not include this plug-in](https://www.11ty.dev/docs/plugins/edge/), so you may have to include it yourself in that case.

## Local installation (development)

1. Download the ZIP or tarball of the latest release and decompress it
1. In a terminal, `cd` to the top-level folder
1. Run `npm i` to install dependencies
1. Rename the `sample.env` file to `.env` (be sure to preserve the leading `.` dot)
1. Edit `.env` and provide the following values:
  1. `BD_REGULAR` - the name of the cookie that permits access to regular subscriber-only content
  1. `BD_PREMIUM` - the name of the cookie that permits access to both regular and premium subscriber-only content
  1. `BUTTONDOWN_API_TOKEN`- your Buttondown API token. Make sure this includes the "Token" prefix
  1. `COOKIE_DURATION_MONTHS` - the desired duration of the cookie, in calendar months. Default is six months.

> ⚠️ DO NOT check in the `.env` file containing your API token when using source control. Use the environment variable settings in your Netlify account.

> ⚠️ The cookie names can be anything you want, but obvious values like "buttondown-subscriber" are not recommended because users can set these cookies themselves. Most people probably won't do this, but if you worry visitors are cheating, change the cookie names periodically.

## Running the webapp

Run `netlify dev` to build your site and run the edge functions locally. This will open a browser on port 8888.

Test your setup by submitting an email address that is subscribed to your Buttondown newsletter. If all is working, the browser will be redirected to a page indicating successful confirmation and access to "regular" subscriber-only content.

If the subscriber email is a paid account (or has been gifted one), there will be a message indicating access to "premium" subscriber-only content.

## Gating content for subscribers

To create subscriber-only content on your Eleventy website, you'll need to:

1. Assign the cookie checker edge function to the pages or directories that contain subscriber-only content
1. Create the gated content

### Assign the cookie checker edge function to gated pages or directories

Edit the `netlify.toml` file and add entries for the areas of your website you want to gate.

#### Example

```
# make a specific page subscriber-only
[[edge_functions]]
  function = "buttondown-cookie-check"
  path = "/members-only"

# make an entire directory subscriber-only
[[edge_functions]]
  function = "buttondown-cookie-check"
  path = "/blog/*"
```
### Add the gated content

Embed gated content directly into pages with the `edge` shortcode. Use the `isRegular` and `isPremium` global variables in your templates to perform the check.

> ⚠️ You may have to [specify the templating engine](https://www.11ty.dev/docs/languages/#special-case-pairing-a-templating-engine-with-md-markdown) either globally or for specific files in order for Nunjucks commands to work in Markdown.

#### Example
```
{% edge "njk, md" %}
  {% isPremium %}
    <p>Paid subscribers can <a href="extra-secret-plans.pdf">download a PDF</a> of my EXTRA-secret plans! </p>
  {% endif %}
{% endedge %}
```

## Deploying

See your Netlify documentation for deploying sites and edge functions.

## See also

[Building A Membership Site With 11ty](https://11ty.rocks/posts/building-a-membership-site-with-11ty/) by Stephanie Eckles, which provided some of the fundamentals used in this app.
