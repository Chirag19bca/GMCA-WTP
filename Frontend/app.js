var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/home", {
      templateUrl: "./pages/Home.html",
    })
    .when("/about", {
      templateUrl: "./pages/About.html",
    })
    .when("/services", {
      templateUrl: "./pages/Service.html",
    })
    .when("/contact", {
      templateUrl: "./pages/Contact.html",
    })
    .when("/calc", {
      templateUrl: "./pages/Calc.html",
    })
    .when("/studentform", {
      templateUrl: "./pages/studentform.html?v=2",
      controller: "studentFormCtrl",
    })
    .when("/register", {
      templateUrl: "./pages/Register.html",
      controller: "registerCtrl",
    })
    .when("/login", {
      templateUrl: "./pages/Login.html?v=2",
      controller: "loginCtrl",
    })
    .when("/profile", {
      templateUrl: "./pages/Profile.html?v=3",
      controller: "profileCtrl",
    }) // v=2 to avoid cache
    .when("/logout", {
      // no separate page file, just a tiny inline template
      template: "<p>Logging out...</p>",
      controller: "logoutCtrl",
    })
    .otherwise({ redirectTo: "/home" });
});

// =============== PROFILE CONTROLLER ===============
app.controller("profileCtrl", function ($scope, $http, $location) {

  $scope.loading = true;
  $scope.profile = null;
  $scope.errorMsg = "";

  $http.get("../Backend/get_profile.php").then(
    function (response) {
      if (response.data === "NOT_LOGGED_IN") {
        $location.path("/login");
      } else {
        $scope.profile = response.data;
      }
      $scope.loading = false;
    },
    function () {
      $scope.errorMsg = "Failed to load profile.";
      $scope.loading = false;
    }
  );

});

// =============== STUDENT FORM CONTROLLER ===============
app.controller("studentFormCtrl", function ($scope, $http, $location) {
  $scope.step = 1;
  $scope.form = {};

  $scope.goStep = (n) => ($scope.step = n);

  // Auto-fill from DB
  $http.get("../Backend/get_profile.php").then((res) => {
    if (res.data === "NOT_LOGGED_IN") {
      $location.path("/login");
      return;
    }
    const p = res.data;
    $scope.form.enrollment_no = p.enrollment_no;
    $scope.form.first_name = p.fname;
    $scope.form.last_name = p.lname;
    $scope.form.email = p.email;
    $scope.form.dob = p.dob || "";
    $scope.form.gender = p.gender || "";
    $scope.form.contact_no = p.contact || "";
    $scope.form.address = p.address || "";
    $scope.form.ssc_school = p.ssc_school || "";
    $scope.form.ssc_board = p.ssc_board || "";
    $scope.form.ssc_percentage = p.ssc_percentage || "";
    $scope.form.hsc_school = p.hsc_school || "";
    $scope.form.hsc_board = p.hsc_board || "";
    $scope.form.hsc_percentage = p.hsc_percentage || "";
  });

  $scope.submitForm = function () {
    if (!validateStudentFormOnSubmit()) return;

    $http.post("../Backend/studentform.php", $scope.form).then((res) => {
      if (res.data.success) {
        alert(res.data.message);
        $location.path("/profile");
      } else {
        alert(res.data.message);
      }
    });
  };
});

// =============== LOGIN CONTROLLER ===============
app.controller("loginCtrl", function ($scope, $http, $location) {
  $scope.loginData = {};
  $scope.errorMsg = "";

  $scope.doLogin = function () {
    $scope.errorMsg = "";

    $http.post("../Backend/login.php", $scope.loginData).then(
      function (response) {
        var data = response.data;

        if (data && data.success === false) {
          $scope.errorMsg = data.message; // visible text
          return;
        }

        $http.get("../Backend/get_profile.php").then(function () {
          $location.path("/profile");
        });
      },
      function () {
        $scope.errorMsg = "Server error while logging in.";
      }
    );
  };
});



// =============== REGISTER CONTROLLER ===============
app.controller("registerCtrl", function (
  $scope,
  $http,
  $location,
  $httpParamSerializerJQLike
) {
  $scope.register = {};
  $scope.successMsg = "";
  $scope.errorMsg = "";

  $scope.doRegister = function () {
    $scope.successMsg = "";
    $scope.errorMsg = "";

    // run JS validation (from register.js)
    if (typeof validateRegisterFormOnSubmit === "function") {
      const ok = validateRegisterFormOnSubmit();
      if (!ok) return;
    }

    // send as application/x-www-form-urlencoded so PHP gets $_POST
    $http({
      method: "POST",
      url: "../Backend/register.php",
      data: $httpParamSerializerJQLike($scope.register),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(
      function (response) {
        // if PHP returns JSON, use it; if HTML, still treat success
        var data = response.data;
        if (data && data.success === false) {
          $scope.errorMsg = data.message || "Registration failed.";
        } else {
          $scope.successMsg =
            (data && data.message) ||
            "Registration successful. Redirecting to login...";
          setTimeout(function () {
            $location.path("/login");
            $scope.$apply();
          }, 800);
        }
      },
      function () {
        $scope.errorMsg = "Server error during registration.";
      }
    );
  };
});


// =============== LOGOUT CONTROLLER ===============
app.controller("logoutCtrl", function ($scope, $http) {
  // just hit logout.php to clear session
  $http.get("../Backend/logout.php").finally(function () {
    // then go to login route
    window.location.href = "Index.html#!/login";
  });
});

app.controller("headerCtrl", function ($scope, $http, $location) {
  $scope.isLoggedIn = false;

  function checkLogin() {
    $http.get("../Backend/get_profile.php").then(function (res) {
      // your get_profile.php returns "NOT_LOGGED_IN" when no session
      $scope.isLoggedIn = res.data !== "NOT_LOGGED_IN";
    });
  }

  // run once when header loads
  checkLogin();

  $scope.logout = function () {
    $http.get("../Backend/logout.php").then(function () {
      $scope.isLoggedIn = false;
      $location.path("/login");
    });
  };
});


// app.run(function ($rootScope, $http, $location) {
//   $rootScope.$on("$routeChangeStart", function (event, next) {
//     if (!next || !next.originalPath) return;

//     $http.get("../Backend/get_profile.php").then(function (res) {
//       const loggedIn = res.data !== "NOT_LOGGED_IN";

//       const forGuestsOnly = ["/login", "/register"];
//       const forLoggedOnly = ["/profile", "/studentform"];

//       // Logged in trying to go to Login/Register → send to Profile
//       if (loggedIn && forGuestsOnly.includes(next.originalPath)) {
//         event.preventDefault();
//         $location.path("/profile");
//       }

//       // Guest trying to go Profile/StudentForm → send to Login
//       if (!loggedIn && forLoggedOnly.includes(next.originalPath)) {
//         event.preventDefault();
//         $location.path("/login");
//       }
//     });
//   });
// });
