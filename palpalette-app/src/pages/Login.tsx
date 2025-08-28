import React, { useCallback, useEffect } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonList,
  IonLoading,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonContent,
  IonIcon,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { colorPalette, person } from "ionicons/icons";
import { Redirect } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Validation schemas
const loginValidationSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email")
    .trim(),
  password: Yup.string().required("Password is required"),
});

const registerValidationSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email")
    .trim(),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  displayName: Yup.string()
    .required("Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .trim(),
});

type LoginFormData = Yup.InferType<typeof loginValidationSchema>;
type RegisterFormData = Yup.InferType<typeof registerValidationSchema>;

const LoginPage: React.FC = () => {
  const { user, loading, login, register } = useAuth();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [isLogin, setIsLogin] = React.useState(true);

  // Form handling for login
  const loginForm = useForm<LoginFormData>({
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: yupResolver(loginValidationSchema),
  });

  // Form handling for registration
  const registerForm = useForm<RegisterFormData>({
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: yupResolver(registerValidationSchema),
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user && router) {
      router.push("/dashboard", "root", "replace");
    }
  }, [user, router]);

  // Login handler
  const onLoginSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        const success = await login(data.email, data.password);
        if (success) {
          presentToast({
            message: "Welcome back! 🎨",
            duration: 2000,
            color: "success",
            position: "top",
          });
        } else {
          presentToast({
            message: "Invalid email or password",
            duration: 3000,
            color: "danger",
            position: "top",
          });
        }
      } catch (error: any) {
        let message = "An unexpected error occurred";
        if (error?.response?.status === 401) {
          message = "Invalid email or password";
        } else if (error?.response?.status === 422) {
          message = "Please check your credentials";
        }

        presentToast({
          message,
          duration: 3000,
          color: "danger",
          position: "top",
        });
      }
    },
    [login, presentToast]
  );

  // Registration handler
  const onRegisterSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        const success = await register(
          data.email,
          data.password,
          data.displayName
        );
        if (success) {
          presentToast({
            message: "Welcome to PalPalette! 🌈",
            duration: 2000,
            color: "success",
            position: "top",
          });
        } else {
          presentToast({
            message: "Registration failed. Please try again.",
            duration: 3000,
            color: "danger",
            position: "top",
          });
        }
      } catch (error: any) {
        let message = "Registration failed";
        if (error?.response?.status === 409) {
          message = "Email already exists";
        } else if (error?.response?.data?.message) {
          message = error.response.data.message;
        }

        presentToast({
          message,
          duration: 3000,
          color: "danger",
          position: "top",
        });
      }
    },
    [register, presentToast]
  );

  // Switch between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
  };

  // If user is authenticated, redirect
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const currentForm = isLogin ? loginForm : registerForm;
  const isSubmitting = currentForm.formState.isSubmitting;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IonIcon icon={colorPalette} />
              PalPalette
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "100%",
            padding: "2rem 0",
          }}
        >
          {/* Welcome Message */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <IonIcon
              icon={colorPalette}
              style={{ fontSize: "4rem", color: "var(--ion-color-primary)" }}
            />
            <h1 style={{ margin: "1rem 0", fontSize: "2rem" }}>
              {isLogin ? "Welcome Back" : "Join PalPalette"}
            </h1>
            <p style={{ color: "var(--ion-color-medium)", margin: 0 }}>
              {isLogin
                ? "Share colors and light up the world 🌈"
                : "Create your account and start sharing colors ✨"}
            </p>
          </div>

          <IonCard>
            <IonCardContent>
              <form
                onSubmit={
                  isLogin
                    ? loginForm.handleSubmit(onLoginSubmit)
                    : registerForm.handleSubmit(onRegisterSubmit)
                }
              >
                <IonList className="ion-padding">
                  {/* Email Field */}
                  <IonItem>
                    <IonInput
                      {...(isLogin
                        ? loginForm.register("email", { required: true })
                        : registerForm.register("email", { required: true }))}
                      type="email"
                      label="Email address"
                      labelPlacement="stacked"
                      placeholder="your@email.com"
                      autocomplete="email"
                      autoFocus
                      errorText={
                        isLogin
                          ? loginForm.formState.errors.email?.message
                          : registerForm.formState.errors.email?.message
                      }
                      className={`
                        ${
                          (
                            isLogin
                              ? loginForm.formState.errors.email
                              : registerForm.formState.errors.email
                          )
                            ? "ion-invalid"
                            : "ion-valid"
                        }
                        ${
                          (
                            isLogin
                              ? loginForm.formState.touchedFields.email
                              : registerForm.formState.touchedFields.email
                          )
                            ? "ion-touched"
                            : ""
                        }
                      `}
                    />
                  </IonItem>

                  {/* Display Name Field (Register only) */}
                  {!isLogin && (
                    <IonItem>
                      <IonInput
                        {...registerForm.register("displayName", {
                          required: true,
                        })}
                        type="text"
                        label="Display name"
                        labelPlacement="stacked"
                        placeholder="Your display name"
                        autocomplete="name"
                        errorText={
                          registerForm.formState.errors.displayName?.message
                        }
                        className={`
                          ${
                            registerForm.formState.errors.displayName
                              ? "ion-invalid"
                              : "ion-valid"
                          }
                          ${
                            registerForm.formState.touchedFields.displayName
                              ? "ion-touched"
                              : ""
                          }
                        `}
                      />
                    </IonItem>
                  )}

                  {/* Password Field */}
                  <IonItem>
                    <IonInput
                      {...(isLogin
                        ? loginForm.register("password", { required: true })
                        : registerForm.register("password", {
                            required: true,
                          }))}
                      type="password"
                      label="Password"
                      labelPlacement="stacked"
                      placeholder="••••••••"
                      autocomplete={
                        isLogin ? "current-password" : "new-password"
                      }
                      errorText={
                        isLogin
                          ? loginForm.formState.errors.password?.message
                          : registerForm.formState.errors.password?.message
                      }
                      className={`
                        ${
                          (
                            isLogin
                              ? loginForm.formState.errors.password
                              : registerForm.formState.errors.password
                          )
                            ? "ion-invalid"
                            : "ion-valid"
                        }
                        ${
                          (
                            isLogin
                              ? loginForm.formState.touchedFields.password
                              : registerForm.formState.touchedFields.password
                          )
                            ? "ion-touched"
                            : ""
                        }
                      `}
                    >
                      <IonInputPasswordToggle slot="end" />
                    </IonInput>
                  </IonItem>

                  {/* Submit Button */}
                  <IonButton
                    type="submit"
                    expand="block"
                    color="primary"
                    style={{ margin: "1.5rem 0" }}
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <>
                        <IonIcon
                          icon={isLogin ? colorPalette : person}
                          slot="start"
                        />
                        {isLogin ? "Sign In" : "Create Account"}
                      </>
                    )}
                  </IonButton>

                  {/* Toggle Mode */}
                  <div style={{ textAlign: "center" }}>
                    <IonText color="medium">
                      {isLogin
                        ? "Don't have an account? "
                        : "Already have an account? "}
                    </IonText>
                    <IonButton
                      fill="clear"
                      color="primary"
                      onClick={toggleMode}
                      disabled={isSubmitting || loading}
                    >
                      {isLogin ? "Sign Up" : "Sign In"}
                    </IonButton>
                  </div>
                </IonList>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Feature Highlights */}
          <div
            style={{
              textAlign: "center",
              marginTop: "2rem",
              color: "var(--ion-color-medium)",
            }}
          >
            <p style={{ fontSize: "0.9rem", margin: "0.5rem 0" }}>
              🎨 Extract colors from photos
            </p>
            <p style={{ fontSize: "0.9rem", margin: "0.5rem 0" }}>
              👥 Share with friends instantly
            </p>
            <p style={{ fontSize: "0.9rem", margin: "0.5rem 0" }}>
              💡 Control LED devices in real-time
            </p>
          </div>
        </div>
      </IonContent>

      <IonLoading isOpen={loading} message="Authenticating..." />
    </IonPage>
  );
};

export default LoginPage;
