var app = angular.module("myApp", ["ngRoute"]);
app.run(function ($rootScope) {
  $rootScope.isLoggedIn = false;
  $rootScope.currentUserName = "";
});
// =============== ROUTING ===============
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
      controller: "calcCtrl",
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
// =============== CALCULATOR CONTROLLER ===============
app.controller("calcCtrl", function ($scope, $rootScope, $http, $location) {
  // If Angular already knows user is logged in, do nothing
  if ($rootScope.isLoggedIn) {
    return;
  }

  // On hard refresh, Angular doesn't know yet -> ask PHP session
  $http.get("../Backend/get_profile.php").then(
    function (res) {
      if (res.data === "NOT_LOGGED_IN") {
        // User really not logged in -> just redirect quietly (no alert)
        $location.path("/login");
      } else {
        // Session is valid -> restore Angular state from profile
        $rootScope.isLoggedIn = true;
        $rootScope.currentUserName = (
          (res.data.fname || "") +
          " " +
          (res.data.lname || "")
        ).trim();
        // stay on /calc, calculator will work normally
      }
    },
    function () {
      // if server error, also send user to login (fallback)
      $location.path("/login");
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
app.controller("loginCtrl", function ($scope, $http, $location, $rootScope) {
  $scope.loginData = {};
  $scope.errorMsg = "";
  $scope.successMsg = "";

  // ---------- ROUTE GUARD ----------
  // If Angular already knows user is logged in → go to profile
  if ($rootScope.isLoggedIn) {
    $location.path("/profile");
    return;
  }

  // On hard refresh, Angular may not know yet → ask PHP
  $http.get("../Backend/get_profile.php").then(function (res) {
    if (res.data !== "NOT_LOGGED_IN") {
      // Session is valid → restore state and redirect
      $rootScope.isLoggedIn = true;
      $rootScope.currentUserName = (
        (res.data.fname || "") +
        " " +
        (res.data.lname || "")
      ).trim();
      $location.path("/profile");
    }
  });

  // ---------- NORMAL LOGIN LOGIC ----------
  $scope.doLogin = function () {
    $scope.errorMsg = "";
    $scope.successMsg = "";

    $http.post("../Backend/login.php", $scope.loginData).then(
      function (response) {
        var data = response.data;

        // CASE 1: JSON response {success, message}
        if (data && typeof data === "object") {
          if (data.success) {
            $scope.successMsg = data.message || "Login successful.";

            $http.get("../Backend/get_profile.php").then(function (res2) {
              if (res2.data !== "NOT_LOGGED_IN") {
                $rootScope.isLoggedIn = true;
                $rootScope.currentUserName = (
                  (res2.data.fname || "") +
                  " " +
                  (res2.data.lname || "")
                ).trim();
              }
              $location.path("/profile");
            });
          } else {
            $scope.errorMsg =
              data.message ||
              "Invalid Enrollment No / Email / Password.";
          }
        }

        // CASE 2: plain string response
        else if (typeof data === "string") {
          var msg = data.trim();

          if (msg.toLowerCase().indexOf("login successful") !== -1) {
            $scope.successMsg = msg;

            $http.get("../Backend/get_profile.php").then(function (res2) {
              if (res2.data !== "NOT_LOGGED_IN") {
                $rootScope.isLoggedIn = true;
                $rootScope.currentUserName = (
                  (res2.data.fname || "") +
                  " " +
                  (res2.data.lname || "")
                ).trim();
              }
              $location.path("/profile");
            });
          } else {
            // here you still get your detailed messages:
            // "Enrollment no and email do not match", "Enrollment no not found", etc.
            $scope.errorMsg = msg || "Login failed.";
          }
        } else {
          $scope.errorMsg = "Unexpected response from server.";
        }
      },
      function () {
        $scope.errorMsg = "Server error while logging in.";
      }
    );
  };
});

// =============== REGISTER CONTROLLER ===============
app.controller(
  "registerCtrl",
  function (
    $scope,
    $http,
    $location,
    $httpParamSerializerJQLike,
    $rootScope
  ) {
    $scope.register = {};
    $scope.successMsg = "";
    $scope.errorMsg = "";

    // ---------- ROUTE GUARD ----------
    // 1) Angular already knows user is logged in
    if ($rootScope.isLoggedIn) {
      $location.path("/profile");
      return;
    }

    // 2) On hard refresh, Angular may not know yet -> ask PHP session
    $http.get("../Backend/get_profile.php").then(function (res) {
      if (res.data !== "NOT_LOGGED_IN") {
        // Session exists -> restore state and redirect to profile
        $rootScope.isLoggedIn = true;
        $rootScope.currentUserName = (
          (res.data.fname || "") +
          " " +
          (res.data.lname || "")
        ).trim();
        $location.path("/profile");
      }
    });

    // ---------- NORMAL REGISTER LOGIC ----------
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
  }
);

// =============== LOGOUT CONTROLLER ===============
app.controller("logoutCtrl", function ($scope, $http, $location) {
  $http.get("../Backend/logout.php").finally(function () {
    $location.path("/login");
  });
});

// =============== HEADER + NAVBAR CONTROLLER ===============
app.controller("headerCtrl", function ($scope, $rootScope, $http, $location) {
  // DO NOT copy values to $scope – we want to use $rootScope directly

  function applyProfile(profile) {
    $rootScope.isLoggedIn = true;
    $rootScope.currentUserName = (
      (profile.fname || "") +
      " " +
      (profile.lname || "")
    ).trim();
  }

  function checkLogin() {
    $http.get("../Backend/get_profile.php").then(function (res) {
      if (res.data === "NOT_LOGGED_IN") {
        $rootScope.isLoggedIn = false;
        $rootScope.currentUserName = "";
      } else {
        applyProfile(res.data);
      }
    });
  }

  // run once on app load
  checkLogin();

  // LOGOUT from navbar
  $scope.logout = function () {
    $http.get("../Backend/logout.php").finally(function () {
      $rootScope.isLoggedIn = false;
      $rootScope.currentUserName = "";
      $location.path("/login");
    });
  };

  // -------- AUTO LOGIN by clicking photos --------
  const AUTO_LOGIN_PRESETS = {
    Dhruvil: {
      enrollment_no: "25GMCA36",
      email: "dhruvil@example.com",
      password: "password1",
    },
    Dhrumil: {
      enrollment_no: "25GMCA34",
      email: "dhrumil@example.com",
      password: "password2",
    },
    Chirag: {
      enrollment_no: "255690694051",
      email: "chirag@gmail.com",
      password: "Chirag@12",
    },
  };

  $scope.autoLogin = function (who) {
    const cred = AUTO_LOGIN_PRESETS[who];
    if (!cred) {
      alert("Auto login user not configured: " + who);
      return;
    }

    $http.post("../Backend/login.php", cred).then(
      function (response) {
        const data = response.data;
        if (!data || data.success === false) {
          alert((data && data.message) || "Auto login failed.");
          return;
        }

        // after login, re-sync with PHP
        checkLogin();
        $location.path("/profile");
      },
      function () {
        alert("Server error during auto login.");
      }
    );
  };
});
