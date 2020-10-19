import React, { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import AuthError from "../components/modals/AuthError";
import logo from "../static/img/logo2.png";
import bg from "../static/img/slideshow-1.jpg";
import useDocumentTitle from "../hooks/useDocumentTitle";

const Login = ({ login }) => {
    useDocumentTitle(login ? "Login | Trello" : "Sign Up | Trello");
    const [errmsgs, setErrMsgs] = useState({ msgs: {}, err: false });
    return (
        <>
            <div className="out-of-focus"></div>
            {errmsgs.err ? (
                <AuthError
                    position={{ left: "50%", right: "50%" }}
                    msgs={errmsgs.msgs}
                    setErrMsgs={setErrMsgs}
                    signup={errmsgs.signup}
                />
            ) : null}
            <div className="sidebar sidebar--left">
                <div className="sidebar-logo">
                    <img
                        className="sidebar-logo__img"
                        src={logo}
                        alt="trello"
                    />
                </div>
                {login ? (
                    <LoginForm setErrMsgs={setErrMsgs} />
                ) : (
                    <RegisterForm setErrMsgs={setErrMsgs} />
                )}
            </div>
            <div className="slideshow" id="slideshow-container">
                <div id="slideshow">
                    <img className="slideshow__img" src={bg} />
                </div>
                <div className="splash-text">
                    <h1 className="splash-text__h1">Plan your tasks</h1>
                    <p> Plan out your tasks and vacations using trello</p>
                </div>
            </div>
        </>
    );
};

Login.defaultProps = {
    login: true,
};

export default Login;
