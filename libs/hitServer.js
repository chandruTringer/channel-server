module.exports = function(url, isAsync) {
  var tempObj = this;
  isAsync = (isAsync) ? isAsync : true;

  // A small example of object
  var core = {

    // Method that performs the ajax request
    ajax: function (method, url, args, headerSetterFunction) {

      // Creating a promise
      var promise = new Promise( function (resolve, reject) {

        // Instantiates the XMLHttpRequest
        var client = new XMLHttpRequest();
        var uri = url;

        client.open(method, uri, isAsync);

        if(typeof headerSetterFunction === "function"){
          headerSetterFunction(client);
        }

        if (args && (method === 'POST' || method === 'PUT')) {
          client.send(args);
        } else {
          client.send();
        }

        client.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            // Performs the function "resolve" when this.status is equal to 2xx
            var response = JSON.parse(this.response);
            switch(response.responseCode) {
              case "ER_001":
              alert("No Agent Available");
              // tempObj.closeAllConnections();
              break;
              default:
              resolve(response.responseValue, response);
              break;
            }
          } else {
            // Performs the function "reject" when this.status is different than 2xx
            reject(this.statusText);
          }
        };

        client.onerror = function () {
          reject(this.statusText);
        };
      });

      // Return the promise
      return promise;
    }
  };

  // Adapter pattern
  return {
    'get': function(args) {
      return core.ajax('GET', url, args);
    },
    'post': function(args, headerSetter) {
      return core.ajax('POST', url, args, headerSetter);
    },
    'put': function(args) {
      return core.ajax('PUT', url, args);
    },
    'delete': function(args) {
      return core.ajax('DELETE', url, args);
    }
  };
}
