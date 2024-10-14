/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import * as Yup from 'yup';

import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { clearStatus } from "@/Features/authSlice";
import { toast } from "sonner";
import { useEffect } from "react";

const AuthForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    status,
    error,
    formType,
    initialValues,
    submitButtonText,
  } = useSelector((state) => state.auth);

  //Hiển thị thông báo lỗi khi form submit thất bại
  useEffect(() =>{
    if(status === "failed" && error){
      toast.error(error);
    }
  },[status, error]); // Chạy khi status hoặc error thay đổi

  const handleTabChange = (path) => {
    dispatch(clearStatus());
    navigate(path);
  };

  // Định nghĩa validationSchema bên trong component (Sửa lỗi Non-Seriablize)
  const getValidationSchema = () => {
    switch (formType) {
      case 'login':
        return Yup.object({
          email: Yup.string().email('Invalid email format').required('Email is required.'),
          password: Yup.string().required('Password is required.'),
        });
      case 'register':
        return Yup.object({
          email: Yup.string().email('Invalid email format').required('Email is required.'),
          password: Yup.string().min(6, "Password must be more than 5 characters").required('Password is required.'),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Password must match')
            .required('Confirm Password is required.'),
        });
      case 'resetPassword':
        return Yup.object({
          password: Yup.string().min(6, "Password must be more than 5 characters").required('Password is required.'),
        });
      case 'forgotPassword':
        return Yup.object({
          email: Yup.string().email('Invalid email format').required('Email is required.')
      });


      default:
        return null;
    }
  };

  return (
    
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[83vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center pb-10">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="Viectory Emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" value={formType}>
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  onClick={() => handleTabChange("/login")}
                  className={`text-black text-opacity-40 border-b-4 w-full p-3 transition-all duration-300 ${
                    formType === "login"
                      ? "border-b-purple-500 font-semibold"
                      : ""
                  }`}
                >
                  Login
                </TabsTrigger>

                <TabsTrigger
                  value="register"
                  onClick={() => handleTabChange("/register")}
                  className={`text-black text-opacity-40 border-b-4 w-full p-3 transition-all duration-300 ${
                    formType === "register"
                      ? "border-b-purple-500 font-semibold"
                      : ""
                  }`}
                >
                  Register
                </TabsTrigger>
              </TabsList>
              <TabsContent
                className="flex flex-col gap-5 mt-6"
                value={formType}
              >

                <Formik
                  initialValues={initialValues}
                  validationSchema={getValidationSchema()}
                  onSubmit={onSubmit}
                >
                  {({ errors, touched }) => (
                  <Form>
                    
                    {formType !== "resetPassword" && (
                      <div>
                         <ErrorMessage name="email" component="div" className="bg-red-500 text-white text-xs mb-1 p-2 rounded-lg" />
                        <Field
                    
                          as={Input}
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Email"
                          className={`rounded-full p-6 mb-2 border ${errors.email && touched.email ? "border-red-500 bg-red-100 font-bold mb-3" : ""}`}
                        />
                      
                      </div>
                    )}

                    {(formType === "resetPassword" ||
                      formType !== "forgotPassword") && (
                      <>
                        <div>
                        <ErrorMessage name="password" component="div" className="bg-red-500 text-white text-xs mb-1 p-2 rounded-lg" />
                          <Field
                            as={Input}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            className={`rounded-full p-6 mb-2 border ${errors.password && touched.password ? "border-red-500 bg-red-100 font-bold mb-3" : ""}`}
                          />
                          
                        </div>
                      </>
                    )}

                    {formType === "register" && (
                      <div>
                        <ErrorMessage name="confirmPassword" component="div" className="bg-red-500 text-white text-xs mb-1 p-2 rounded-lg" />
                        <Field
                          as={Input}
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`rounded-full p-6 mb-2 border ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 bg-red-100 font-bold mb-3" : ""}`}
                          placeholder="Confirm Password"
                        />
                        
                      </div>
                    )}

                    <Button className="rounded-full p-6 w-full text-center mt-2" type="submit" >{(status == "loading") ? "Loading..." :submitButtonText}</Button>
                   

                    {formType !== "resetPassword" &&
                      formType !== "register" &&
                      formType !== "forgotPassword" && (
                        <div>
                          <div className="flex justify-center items-center">
                            <Link className={buttonVariants({ variant: "link" })}  to="/forgotPassword">Forgot Password?</Link>
                          </div>
                      
                        </div>
                      )}
                  </Form>
                  )}
                </Formik>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center pb-2">
              <img src={Background} alt="background login" className="h-[590px]"/>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
