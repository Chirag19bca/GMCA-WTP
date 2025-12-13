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
      templateUrl: "./pages/Register.html?v=2",
      controller: "registerCtrl",
    })
    .when("/login", {
      templateUrl: "./pages/Login.html?v=3",
      controller: "loginCtrl",
    })
    .when("/profile", {
      templateUrl: "./pages/Profile.html?v=3",
      controller: "profileCtrl",
    }) // v=3 to avoid cache
    .when("/forgot-password", {
      templateUrl: "./pages/ForgotPassword.html",
      controller: "forgotPasswordCtrl",
    })
    .when("/reset-password", {
      templateUrl: "./pages/ResetPassword.html",
      controller: "resetPasswordCtrl",
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
        $rootScope.isLoggedIn = false;
        $location.path("/login");
      } else {
        $rootScope.isLoggedIn = true;
        $rootScope.currentUserName = (
          (res.data.fname || "") +
          " " +
          (res.data.lname || "")
        ).trim();
      }
    },
    function () {
      $location.path("/login");
    }
  );
});

// =============== STUDENT FORM CONTROLLER ===============
+app.controller(
  "studentFormCtrl",
  function ($scope, $http, $location, $rootScope) {
    $scope.step = 1;
    $scope.form = {};
    $scope.isUpdateMode = false;

    $scope.goStep = (n) => ($scope.step = n);

    // Auto-fill from DB
    $http.get("../Backend/get_profile.php").then((res) => {
      if (res.data === "NOT_LOGGED_IN") {
        $location.path("/login");
        return;
      }
      const p = res.data;
      // If DOB exists, assume student already filled form
      if (p.dob) {
        $scope.isUpdateMode = true;
      }
      $scope.form.enrollment_no = p.enrollment_no;
      $scope.form.first_name = p.fname;
      $scope.form.last_name = p.lname;
      $scope.form.email = p.email;
      if (p.dob) {
        // convert string -> Date object (AngularJS requires this)
        $scope.form.dob = new Date(p.dob);
      } else {
        $scope.form.dob = null;
      }

      $scope.form.gender = p.gender || "";
      $scope.form.contact_no = p.contact || "";
      $scope.form.address = p.address || "";
      $scope.form.ssc_school = p.ssc_school || "";
      $scope.form.ssc_board = p.ssc_board || "";
      $scope.form.ssc_percentage = p.ssc_percentage
        ? Number(p.ssc_percentage)
        : null;
      $scope.form.hsc_school = p.hsc_school || "";
      $scope.form.hsc_board = p.hsc_board || "";
      $scope.form.hsc_percentage = p.hsc_percentage
        ? Number(p.hsc_percentage)
        : null;
    });

    $scope.submitForm = function () {
      // 1️⃣ Validate STEP 1
      if (!validateStep1()) {
        $scope.step = 1; // move user to step 1
        return;
      }

      // 2️⃣ Validate STEP 2
      if (!validateStep2()) {
        $scope.step = 2; // stay on step 2
        return;
      }

      // 3️⃣ All valid → submit/update
      $http.post("../Backend/studentform.php", $scope.form).then(
        function (res) {
          if (res.data && res.data.message === "SESSION_EXPIRED") {
            alert("Session expired. Please login again.");
            $location.path("/login");
            return;
          }

          if (res.data && res.data.success === true) {
            alert("Details updated successfully");
            $rootScope.isLoggedIn = true; // ensure header stays in sync
            $location.path("/profile");
          } else {
            alert("Submission failed.");
          }
        },
        function () {
          alert("Server error while submitting form.");
        }
      );
    };
  }
);

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
              data.message || "Invalid Enrollment No / Email / Password.";
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
  function ($scope, $http, $location, $httpParamSerializerJQLike, $rootScope) {
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
            $http.get("../Backend/logout.php").finally(function () {
              $location.path("/login");
              if (!$scope.$$phase) $scope.$apply();
            });
          }
        },
        function () {
          $scope.errorMsg = "Server error during registration.";
        }
      );
    };
  }
);

// =============== HEADER + NAVBAR CONTROLLER ===============
app.controller("headerCtrl", function ($scope, $rootScope, $http, $location) {
  // guard so we don't run checkLogin many times
  if (!$rootScope._authInit)
    $rootScope._authInit = { checking: false, done: false };

  function applyProfile(profile) {
    $rootScope.isLoggedIn = true;
    $rootScope.currentUserName = (
      (profile.fname || "") +
      " " +
      (profile.lname || "")
    ).trim();
  }

  function checkLogin() {
    // if already checking or already done recently, skip
    if ($rootScope._authInit.checking) return;
    $rootScope._authInit.checking = true;

    $http
      .get("../Backend/get_profile.php")
      .then(function (res) {
        if (res.data === "NOT_LOGGED_IN") {
          $rootScope.isLoggedIn = false;
          $rootScope.currentUserName = "";
        } else {
          applyProfile(res.data);
        }
      })
      .finally(function () {
        $rootScope._authInit.checking = false;
        $rootScope._authInit.done = true;
      });
  }

  // run once on header init
  checkLogin();

  // LOGOUT from navbar (prevent default event)
  $scope.logout = function ($event) {
    if ($event && $event.preventDefault) $event.preventDefault();
    $http.get("../Backend/logout.php").finally(function () {
      $rootScope.isLoggedIn = false;
      $rootScope.currentUserName = "";
      // prefer $location.path rather than window.location to keep it SPA
      $location.path("/login");
    });
  };

  // -------- AUTO LOGIN by clicking photos --------
  const AUTO_LOGIN_PRESETS = {
    Dhruvil: {
      enrollment_no: "255690694021",
      email: "dhruvil@gmail.com",
      password: "Dhruvil@25",
    },
    Dhrumil: {
      enrollment_no: "255690694015",
      email: "dhrumil@gmail.com",
      password: "Dhrumil@12",
    },
    Chirag: {
      enrollment_no: "255690694051",
      email: "chirag@gmail.com",
      password: "Chirag@12",
    },
  };

  $scope.autoLogin = function (who) {
    // If user already logged in
    if ($rootScope.isLoggedIn) {
      const currentName = ($rootScope.currentUserName || "").toLowerCase();
      const clickedName = who.toLowerCase();

      // Same user clicked
      if (currentName.includes(clickedName)) {
        alert(
          "You are already logged in as " + $rootScope.currentUserName + "."
        );
      }
      // Different user clicked
      else {
        alert("You should logout first to switch user.");
      }
      return; // STOP here
    }

    // ---------- NORMAL AUTO LOGIN ----------
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

        checkLogin(); // sync Angular with PHP session
        $location.path("/profile");
      },
      function () {
        alert("Server error during auto login.");
      }
    );
  };
});
// =============== FORGOT PASSWORD CONTROLLER ===============
app.controller("forgotPasswordCtrl", function ($scope, $http, $location) {
  $scope.data = {};
  $scope.error = "";
  $scope.success = "";
  $scope.loading = false;

  $scope.sendReset = function () {
    $scope.error = "";
    $scope.success = "";

    // validate ONLY required fields
    const enrollField = document.getElementById("enrollment_no");
    const emailField = document.getElementById("email");

    let valid = true;

    if (!validateRegisterField(enrollField)) valid = false;
    if (!validateRegisterField(emailField)) valid = false;

    if (!valid) return; // stop if invalid

    $scope.loading = true;

    $http.post("../Backend/forgot_password.php", $scope.data).then(
      function (res) {
        $scope.loading = false;

        if (res.data && res.data.success === true) {
          $scope.success =
            "Verification successful. Please reset your password.";

          setTimeout(function () {
            $scope.$apply(function () {
              $location.path("/reset-password");
            });
          }, 500);
        } else {
          $scope.error =
            (res.data && res.data.message) ||
            "Invalid enrollment number or email.";
        }
      },
      function () {
        $scope.loading = false;
        $scope.error = "Server error. Please try again later.";
      }
    );
  };
});

// =============== RESET PASSWORD CONTROLLER ===============
app.controller("resetPasswordCtrl", function ($scope, $http, $location) {
  $scope.data = {};
  $scope.error = "";
  $scope.success = "";
  $scope.showPassword = false;

  $scope.resetPassword = function () {
    $scope.error = "";

    // validate password strength
    if (!validateRegisterField(document.getElementById("password"))) return;

    // validate confirm password
    if (!validateRegisterField(document.getElementById("confirm_password")))
      return;

    if ($scope.data.password !== $scope.data.confirm) {
      $scope.error = "Passwords do not match.";
      return;
    }

    $http.post("../Backend/reset_password.php", $scope.data).then(
      function (res) {
        if (res.data.success) {
          $scope.success = "Password reset successful.";
          setTimeout(function () {
            $scope.$apply(function () {
              $location.path("/login");
            });
          }, 500);
        } else {
          $scope.error = res.data.message || "Reset failed.";
        }
      },
      function () {
        $scope.error = "Server error.";
      }
    );
  };
});
