import * as keysService from "./keysService";

class Deferred {
  constructor() {
    var self = this;
    this.promise = new Promise(function(resolve, reject) {
      self.reject = reject;
      self.resolve = resolve;
    });
  }
}

const fbLoaded = new Deferred();

window.fbAsyncInit = function() {
  keysService
    .get("Facebook_Api_Key")
    .then(resp => {
      window.FB.init({
        appId: resp.item.value,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v3.2"
      });
      fbLoaded.resolve();
    })
    .catch(err => console.error(err));
};

(function(d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

export { fbLoaded };
