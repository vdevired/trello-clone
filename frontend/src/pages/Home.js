import React from "react";
import HomeSidebar from "../components/sidebars/HomeSidebar";
import HomeBoard from "../components/boards/HomeBoard";

const Home = () => {
    return (
        <div className="home-wrapper">
            <HomeSidebar />
            <div className="home">
                <div className="home__section">
                    <p className="home__title">
                        <i className="fal fa-clock"></i> Recently Viewed
                    </p>
                </div>
                <div className="home__boards"></div>

                <div className="home__section">
                    <p className="home__title">
                        <i className="fal fa-user"></i> Personal Boards
                    </p>
                    <button className="btn">
                        <i className="fal fa-plus"></i> Create
                    </button>
                </div>
                <div className="home__boards"></div>

                {/* Project Boards:*/}
            </div>
        </div>
    );
};

export default Home;
