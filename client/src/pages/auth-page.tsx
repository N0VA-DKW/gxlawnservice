import { useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";

const loginSchema = insertUserSchema;
const registerSchema = insertUserSchema;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        if (user.isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      },
    });
  }

  function onRegisterSubmit(data: z.infer<typeof registerSchema>) {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-lightest">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
          {/* Left Column: Auth Forms */}
          <div className="w-full lg:w-1/2 p-8">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-primary-dark">RoboMow</span>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access the RoboMow platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Email</Label>
                        <Input
                          id="login-username"
                          placeholder="Email"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Password"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember-me" />
                          <Label htmlFor="remember-me">Remember me</Label>
                        </div>
                        <a href="#" className="text-sm text-primary hover:text-primary-dark">
                          Forgot password?
                        </a>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Log In
                      </Button>

                      <p className="text-center text-sm text-gray-500 mt-2">
                        Don't have an account?{" "}
                        <a className="text-primary hover:text-primary-dark cursor-pointer">
                          Register
                        </a>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Join RoboMow to manage your lawn mowing services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Email</Label>
                        <Input
                          id="register-username"
                          placeholder="Email"
                          {...registerForm.register("username")}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Password"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" required />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{" "}
                          <a href="#" className="text-primary hover:text-primary-dark">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:text-primary-dark">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Create Account
                      </Button>

                      <p className="text-center text-sm text-gray-500 mt-2">
                        Already have an account?{" "}
                        <a className="text-primary hover:text-primary-dark cursor-pointer">
                          Log in
                        </a>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Hero Section */}
          <div className="hidden lg:block w-1/2 bg-primary-dark p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Automated Lawn Mowing</h2>
            <p className="text-lg mb-8">
              Book our smart robotic mowers to keep your lawn perfectly trimmed without lifting a finger.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-light bg-opacity-20 p-2 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Effortless Booking</h3>
                  <p className="text-neutral-lightest">
                    Schedule your service with our easy-to-use online platform.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary-light bg-opacity-20 p-2 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Silent Operation</h3>
                  <p className="text-neutral-lightest">
                    Our robots work quietly without disturbing you or your neighbors.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-primary-light bg-opacity-20 p-2 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Eco-Friendly</h3>
                  <p className="text-neutral-lightest">
                    Battery-powered operation with zero emissions and natural fertilization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
