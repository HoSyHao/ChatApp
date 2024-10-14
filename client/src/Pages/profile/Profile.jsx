import React, { useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/Components/ui/Avatar";
import { colors, getColor } from "@/lib/utils";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  setHovered,
  setImage,
  setFirstName,
  setLastName,
  setSelectedColor,
  setUserInfo,
  updateProfile,
  uploadImage,
  deleteImage,
  setTempImage,
  setIsImageDeleted,
} from "@/Features/authSlice";
import * as Yup from "yup";
import { HOST } from "@/Utils/constants";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    user,
    status,
    error,
    hovered,
    image,
    firstName,
    lastName,
    selectedColor,
    tempImage,
    isImageDeleted,
  } = useSelector((state) => state.auth);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && user.profileSetup === false) {
      toast.error("Please setup profile to continue.");
    } else {
      dispatch(setFirstName(user.firstName));
      dispatch(setLastName(user.lastName));
      dispatch(setSelectedColor(user.color));
      if (user.image) {
        dispatch(setImage(`${HOST}/${user.image}`));
        dispatch(setTempImage(`${HOST}/${user.image}`));
      }
    }
  }, [user]);

  if (status === "failed" && error) {
    toast.error(error);
  }

  const validateProfile = Yup.object({
    firstName: Yup.string().required("First Name is required."),
    lastName: Yup.string().required("Last Name is required."),
  });

  const handleSaveChanges = async (values) => {
    const payload = {
      ...values,
      color: selectedColor,
    };

    try {
      if (isImageDeleted) {
        await dispatch(deleteImage()).unwrap();
        dispatch(setImage(null));
        dispatch(setUserInfo({ ...user, image: null }));
      } else if (tempImage !== image) {
        const formData = new FormData();
        formData.append("profile-image", fileInputRef.current.files[0]);
        const data = await dispatch(uploadImage(formData)).unwrap();
        dispatch(setUserInfo({ ...user, image: data.image }));
      }

      const data = await dispatch(updateProfile(payload)).unwrap();
      dispatch(setUserInfo(data.user));
      navigate("/home");
      toast.success("User Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleNavigate = () => {
    if (user.profileSetup) {
      navigate("/home");
    } else {
      toast.error("Please setup profile to continue.");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const tempImageUrl = URL.createObjectURL(file);
      dispatch(setTempImage(tempImageUrl));
      dispatch(setIsImageDeleted(false));
      toast.success("Image uploaded successfully!");
    }
  };

  const handleDeleteImage = () => {
    dispatch(setTempImage(null));
    dispatch(setIsImageDeleted(true));
    toast.success("Image removed successfully!");
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate}>
          <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
        </div>
        <Formik
          enableReinitialize={true}
          initialValues={{ firstName: firstName, lastName: lastName }}
          validationSchema={validateProfile}
          onSubmit={handleSaveChanges}
        >
          {({ errors, touched, setFieldValue, setFieldTouched }) => (
            <Form className="flex flex-col gap-5 w-full">
              <div className="grid grid-cols-2 gap-5">
                <div
                  className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
                  onMouseEnter={() => dispatch(setHovered(true))}
                  onMouseLeave={() => dispatch(setHovered(false))}
                >
                  <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
                    {tempImage ? (
                      <AvatarImage
                        src={tempImage}
                        alt="profile"
                        className="object-cover w-full h-full bg-black"
                      />
                    ) : (
                      <div
                        className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                          selectedColor
                        )}`}
                      >
                        {firstName
                          ? firstName.split("").shift()
                          : user?.email?.split("").shift()}
                      </div>
                    )}
                  </Avatar>
                  {hovered && (
                    <div
                      onClick={
                        tempImage ? handleDeleteImage : handleFileInputClick
                      }
                      className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
                    >
                      {tempImage ? (
                        <FaTrash className="text-white text-3xl cursor-pointer" />
                      ) : (
                        <FaPlus className="text-white text-3xl cursor-pointer" />
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleUploadImage}
                    name="profile-image"
                    accept=".png, .jpg, .jpeg, .swg, .webp, .gif"
                  />
                </div>
                <div className="flex flex-col gap-5 text-white items-center justify-center">
                  <div className="w-full">
                    <Input
                      placeholder="Email"
                      type="email"
                      disabled
                      value={user.email}
                      className="rounded-lg p-6 bg-[#2c2e3b] border-none "
                    ></Input>
                  </div>
                  <div className="w-full">
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="bg-red-700 text-white text-xs mb-1 p-2 rounded-lg"
                    />
                    <Field
                      as={Input}
                      name="firstName"
                      placeholder="First Name"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        dispatch(setFirstName(e.target.value));
                        setFieldValue("firstName", e.target.value);
                        setFieldTouched("firstName", false);
                      }}
                      className={`rounded-lg p-6 bg-[#2c2e3b] border-none${
                        errors.firstName && touched.firstName
                          ? " bg-red-300 font-bold"
                          : ""
                      }`}
                    ></Field>
                  </div>
                  <div className="w-full">
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="bg-red-700 text-white text-xs mb-1 p-2 rounded-lg"
                    />
                    <Field
                      as={Input}
                      name="lastName"
                      placeholder="Last Name"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        dispatch(setLastName(e.target.value));
                        setFieldValue("lastName", e.target.value);
                        setFieldTouched("lastName", false);
                      }}
                      className={`rounded-lg p-6 bg-[#2c2e3b] border-none${
                        errors.lastName && touched.lastName
                          ? " bg-red-300 font-bold"
                          : ""
                      }`}
                    ></Field>
                  </div>
                  <div className="w-full flex gap-5">
                    {colors.map((color, index) => (
                      <div
                        className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                      ${
                        selectedColor === index
                          ? "outline outline-white/50 outline-3"
                          : ""
                      }`}
                        key={index}
                        onClick={() => dispatch(setSelectedColor(index))}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full">
                <Button
                  type="submit"
                  className="h-16 w-full bg-purple-700 hover:bg-purple-900 duration-300"
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Profile;
