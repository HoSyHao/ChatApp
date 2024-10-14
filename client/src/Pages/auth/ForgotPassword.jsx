/* eslint-disable react/react-in-jsx-scope */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  setForgotPasswordForm,
  clearError,
  closeAlertDialog,
  openAlertDialog,
} from "../../Features/authSlice";
import AuthForm from "./AuthForm";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { alertDialogOpen} = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(setForgotPasswordForm());
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (values) => {
    dispatch(forgotPassword(values))
      .then((action) => {
        if (action.meta.requestStatus === "fulfilled") {
          dispatch(openAlertDialog());
        }
        console.log(action);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCloseDialog = () => {
    dispatch(closeAlertDialog());
    navigate("/login");
  }

  return (
    <>
      <AuthForm onSubmit={handleSubmit} />

      <AlertDialog open={alertDialogOpen} onOpenChange={(open) => {
        if(!open) {
          handleCloseDialog();
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check your email</AlertDialogTitle>
            <AlertDialogDescription>
              A reset password link has been sent to your email. Please check
              your inbox and follow the instructions to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleCloseDialog}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ForgotPassword;
