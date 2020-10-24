import React, {
    useState,
    useRef,
    useEffect,
    useContext,
    useCallback,
} from "react";
import _ from "lodash";
import logo from "../../static/img/logo2.png";
import SearchModal from "../modals/SearchModal";
import ProfilePic from "../boards/ProfilePic";
import { Link } from "react-router-dom";
import useAxiosGet from "../../hooks/useAxiosGet";
import useBlurSetState from "../../hooks/useBlurSetState";
import { handleBackgroundBrightness } from "../../static/js/util";
import globalContext from "../../context/globalContext";
import NotificationsModal from "../modals/NotificationsModal";

const Header = (props) => {
    const { authUser, board } = useContext(globalContext);

    const [searchQuery, setSearchQuery] = useState(""); //This variable keeps track of what to show in the search bar
    const [backendQuery, setBackendQuery] = useState(""); //This variable is used to query the backend, debounced
    const delayedQuery = useCallback(
        _.debounce((q) => setBackendQuery(q), 500),
        []
    );
    const [showSearch, setShowSearch] = useState(false);
    const searchElem = useRef(null);
    const [showNotifications, setShowNotifications] = useState(false);
    useBlurSetState(".label-modal", showNotifications, setShowNotifications);

    useEffect(() => {
        if (searchQuery !== "") setShowSearch(true);
        else if (searchQuery === "" && showSearch) setShowSearch(false);
    }, [searchQuery]);

    const { data: notifications, setData: setNotifications } = useAxiosGet(
        "/notifications/"
    );

    const onBoardPage = props.location.pathname.split("/")[1] === "b";
    const [isBackgroundDark, setIsBackgroundDark] = useState(false);
    useEffect(handleBackgroundBrightness(board, setIsBackgroundDark), [board]);

    return (
        <>
            <header
                className={`header${
                    isBackgroundDark && onBoardPage
                        ? " header--transparent"
                        : ""
                }`}
            >
                <div className="header__section">
                    <ul className="header__list">
                        <li className="header__li">
                            <a>
                                <i className="fab fa-trello"></i> Boards
                            </a>
                        </li>
                        <li
                            className={`header__li header__li--search${
                                searchQuery !== "" ? " header__li--active" : ""
                            }`}
                            ref={searchElem}
                        >
                            <i className="far fa-search"></i>{" "}
                            <input
                                type="text"
                                placeholder="Search"
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    delayedQuery(e.target.value);
                                }}
                            />
                        </li>
                    </ul>
                </div>
                <div className="header__section">
                    <Link to="/">
                        <img className="header__logo" src={logo} />
                    </Link>
                </div>
                <div className="header__section">
                    <ul className="header__list">
                        <li className="header__li header__li--profile">
                            <ProfilePic user={authUser} large={true} />
                            Hello, {authUser.full_name.replace(/ .*/, "")}
                        </li>
                        <li className="header__li header__li--notifications">
                            <button onClick={() => setShowNotifications(true)}>
                                <i className="fal fa-bell"></i>
                            </button>
                            {(notifications || []).find(
                                (notification) => notification.unread == true
                            ) && <div className="header__unread"></div>}
                        </li>
                        <li className="header__li header__li--border">
                            <a>
                                <i className="fal fa-bars"></i>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="out-of-focus"></div>
            </header>
            {showSearch && (
                <SearchModal
                    backendQuery={backendQuery}
                    searchElem={searchElem}
                    setShowModal={setShowSearch}
                />
            )}
            {showNotifications && (
                <NotificationsModal
                    setShowModal={setShowNotifications}
                    notifications={notifications}
                    setNotifications={setNotifications}
                />
            )}
        </>
    );
};

export default Header;
