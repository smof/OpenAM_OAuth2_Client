//Master JavaScript file for interacting with OpenIDM and OpenAM - smof Oct 6th

//Globals
var OPENAM_COOKIE = "Not Found";
var OAuth2AuthorizationCode = "";
var OAuth2AccessToken = "";
var OAuth2ScopeData ="";

//Returns the iPlanet value
function getOpenAMCookie() {
	
	var cookieName = "iPlanetDirectoryPro";
	retrievedCookie = getCookie(cookieName);
	OPENAM_COOKIE = (retrievedCookie)? retrievedCookie : "Not Set";
	return OPENAM_COOKIE;
	
}

//Retrieves the global cookie list and retrieves the specific cookie value
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

//Sets a cookie if needed
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

//Checks if cookie is a valid OpenAM cookie
function checkOpenAMCookie(){
	
	  var url="/openam/json/sessions/" + OPENAM_COOKIE + "?_action=validate"
	  var xmlHttp = null;
	  xmlHttp = new XMLHttpRequest();
	  xmlHttp.open( "POST", url, false );
	  xmlHttp.setRequestHeader("Content-type","application/json");
	  xmlHttp.send( null );
	  var OpenAMCookieValidity = xmlHttp.responseText;

	  //If cookie is invalid, get the user to login
	  if (OpenAMCookieValidity == "{\"valid\":false}") {
		  
		  document.getElementById("openAMLink").innerHTML="<a href=\"http://openam.example.com:8080/openam/XUI/#login/&goto=http%3A%2F%2Fopenam.example.com%3A8080%2FwidgetReader%2Findex.html\">" +
		  		"<img src=\"./images/login.png\"></img</a>";
		  document.getElementById("iPlanetDirectoryProCookieValid").style.color="red";
	  }
	  else { //This stuff here is when the user has a valid cookie
		  
		  document.getElementById("openAMLink").innerHTML="<a href=\"http://openam.example.com:8080/openam/XUI/#logout/?goto=http%3A%2F%2Fopenam.example.com%3A8080%2F2FwidgetReader%2Findex.html\"> " +
		  		"<img src=\"./images/logout.png\"></img></a>";
		  document.getElementById("iPlanetDirectoryProCookieValid").style.color="green";
		  
		  //Make the OAuth2 chains and myWidgets view stuff available
		  document.getElementById("OAuth2Flow").style.display="block";
		  document.getElementById("widgetView").style.display="block"
			  
		  
	  }
	  
	  return OpenAMCookieValidity;
	
}


//Get OAuth2 Authorization Code
function getAuthorizationCode() {
	
	//OAuth2 variables
	url="/openam/oauth2/authorize";
	client_id="myWidgets";
	redirect_uri="http://openam.example.com:8080/widgetReader/index.html";
	scope="employeeNumber"; //Probably want to change this to widgetId and change DJ profile schema
	payload="response_type=code&save_consent=0&decision=Allow&scope=" + scope + "&client_id=" + client_id + "&redirect_uri=" + redirect_uri
	
	//Build HTTP request
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "POST", url, false );
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded"); //as the iPlanetDirectoryPro Cookie is already set naturally we don't need to set again...
	xmlHttp.send(payload);
	
	//OpenAM returns a 200 and POST request to the redirect URI along with the suffix of code=<authorization code>.  Here we just get the URL split it and get the code= bit...
	//Eg http://openam.example.com:8080/myWidgets/index.html?code=04f087ae-f73d-4453-88ef-535309ad8e8f
	OAuth2AuthorizationCode = xmlHttp.responseURL.split("?")[1].split("=")[1];
	
	return OAuth2AuthorizationCode;
}


//Get OAuth2 Access Token
function getAccessToken() {
	
	//OAuth2 variables
	url="/openam/oauth2/access_token";
	clientId="myWidgets";
	redirectURI="http://openam.example.com:8080/widgetReader/index.html";
	scope="employeeNumber"; //Probably want to change this to widgetId and change DJ profile schema
	base64Credentials = "bXlXaWRnZXRzOlBhc3N3MHJk"; //The base64 encoded OAuth2 ClientId and Client Password 
	payload = "grant_type=authorization_code&code=" + OAuth2AuthorizationCode + "&redirect_uri=" + redirectURI;
	
	//Build HTTP request
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "POST", url, false );
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlHttp.setRequestHeader("Authorization","Basic " + base64Credentials);
	xmlHttp.send(payload);

	//Gather and parse bearer token response
	OAuth2AccessToken = JSON.parse(xmlHttp.responseText); //This is just populating global variable so available elsewhere
	
	return JSON.stringify(OAuth2AccessToken);

}

//Uses Access Token to get scope values
function getScopeData() {
	
	//OAuth2 variables
	url="/openam/oauth2/tokeninfo?access_token=" + OAuth2AccessToken["access_token"];
		
	//Build HTTP request
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", url, false );
	xmlHttp.send(payload);
	
	OAuth2ScopeData = JSON.parse(xmlHttp.responseText);
	
	return OAuth2ScopeData["employeeNumber"];
	
}


//Use the scope value to create the widget view from data held in the MySQL repo via OpenIDM
function getWidgetData(widgetId) {

	widgetData = "";
	
	//Hard coded widget 'database' for the widget viewing service
	widgets = {
				"d4d4d4" : { "description": "block", "height": "5", "length": "5", "width": "50", "image":"./images/block.bmp"},
				"a1a1a1" : { "description": "cube",  "height": "10", "length": "10", "width": "10", "image":"./images/cube.bmp"},
				"b2b2b2" : { "description": "beam",  "height": "10", "length": "50", "width": "10", "image":"./images/beam.bmp"},
				"c3c3c3" : { "description": "pole",  "height": "50", "length": "15", "width": "15", "image":"./images/pole.bmp"}
	}
	
	if (widgets[widgetId]){
		//Nasty generation of HTML but fine for Demo...
		widgetData = "<td>" + widgets[widgetId]["description"] + "</td><td>" + widgets[widgetId]["height"] + "</td><td>" + widgets[widgetId]["width"] + "</td><td>" + widgets[widgetId]["length"] + "</td>" +
			"<td><img src=\""+ widgets[widgetId]["image"] + "\"/></td>"
	}
	
	return widgetData;
}

	
	
