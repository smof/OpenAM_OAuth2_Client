<b>OpenAM Example OAuth2 Client</b>
<br/>
<br/>
A basic one page application that leverages native JavaScript to interact with OpenAM, when acting as the OAuth2 Authorization Server.
If the user is not logged into OpenAM, redirects to the default top level realm authentication service for authentication, before
redirecting back to the ./widgetReader/index.html page for completion.
<br/>
To install, simply copy the widgetReader folder into a J2EE container such as Tomcat.  Will need some edits in the
 ./scripts/widgetRead.js file for things like client ID and password or redirect URL's if they have changed.
<br/>
Note this is written in native client side JavaScript and is therefor restricted by the XmlHTTP CORS model - ie you can only
perform requests to an OpenAM service on the same container as where this app is running from, including the same port.
<br/>
<br/>
# Checks if user is authentication to OpenAM and if not allows authentication
<br/>
# Performs an Authorization Code request
<br/>
# Perform an Authorization Code to Bearer Token exchange request
<br/>
# Performs a scope lookup against the users employeeNumber attribute stored in OpenDJ
<br/>
# Performs a service based on the attribute held in the employeeNumber that references a widget reader
<br/>
<br/>
Use as-is, no warranty.  This is not supported by ForgeRock, simply made available as a community example.  Tested with OpenAM
11.0.2.
