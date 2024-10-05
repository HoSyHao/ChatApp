import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import "../../assets/App.css";
import { useEffect } from "react";
import { closeAlertDialog, openAlertDialog } from "../../Features/authSlice";
import EmptyChatContainer from "./components/empty-chat-container";
import ContactsContainer from "./components/contacts-container";
import ChatContainer from "./components/chat-container";

const Home = () => {

  return (
    <div className="flex h-[100vh] text-white overflow-hidden">

      <ContactsContainer />
      <EmptyChatContainer />
      <ChatContainer />
    </div>
  );
};

export default Home;
