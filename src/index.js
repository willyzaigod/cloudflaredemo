addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Function to decode the JWT and extract the email
function getEmailFromJwt(jwt) {
  // Split the JWT into its components
  let jwtComponents = jwt.split('.')

  // Base64 decode the payload
  let payload = atob(jwtComponents[1])

  // Parse the payload as JSON
  let payloadJson = JSON.parse(payload)

  // Return the email from the payload
  return payloadJson.email
}

async function handleRequest(request) {
  const url = new URL(request.url)
  let pathname = url.pathname

  // Check if the request is for /secure or /secure/COUNTRY
  if (pathname.startsWith('/secure')) {
    // Get the country from the path, if it exists
    let country = pathname.split('/')[2]

    if (country) {
      // If the request is for /secure/COUNTRY, return the flag
      let flagUrl = `https://r2.plasblick.store/${country}.png`
      let response = await fetch(flagUrl)
      let headers = { 'Content-Type': 'image/png' }
      return new Response(response.body, { headers })
    } else {
      // If the request is for /secure, return the user info
      let jwt = request.headers.get('CF-Access-JWT-Assertion')
      let email = getEmailFromJwt(jwt)
      let timestamp = new Date().toISOString()
      let country = request.headers.get('CF-IPCountry')
      let html = `${email} authenticated at ${timestamp} from <a href="/secure/${country}">${country}</a>`
      let headers = { 'Content-Type': 'text/html' }
      return new Response(html, { headers })
    }
  }

  // If the request is not for /secure or /secure/COUNTRY, return a 404
  return new Response('Not found', { status: 404 })
}
