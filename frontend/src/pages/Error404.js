import React, { useContext } from "react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

import globalContext from "../context/globalContext";
import bg from "../static/img/404.jpg";

const Error404 = () => {
    useDocumentTitle("Error | Trello");
    const { authUser } = useContext(globalContext);

    return (
        <div className="error-page">
            <img className="error-page__image" src={bg} />
            <div className="error-page__content">
                <h1 className="error-page__title">
                    You look a little lost there
                </h1>
                <h4 className="error-page__subtitle">
                    {!authUser ? (
                        <>
                            This page may be private. You may be able to view it
                            by{" "}
                            <Link className="error-page__link" to="/login">
                                logging in
                            </Link>
                        </>
                    ) : (
                        "This page cannot be found"
                    )}
                </h4>
            </div>
        </div>
    );
};

export default Error404;
