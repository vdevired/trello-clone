import React, { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import HomeSidebar from "../components/sidebars/HomeSidebar";
import HomeBoard from "../components/boards/HomeBoard";
import CreateTeamModal from "../components/modals/CreateTeamModal";
import useAxiosGet from "../hooks/useAxiosGet";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { filterBoards } from "../static/js/board";

const Home = () => {
    useDocumentTitle("Boards | Trello");
    const [showTeamModal, setShowTeamModal] = useState(false);
    const { data: projects, addItem: addProject } = useAxiosGet("/projects/");
    const { data: boards, addItem: addBoard } = useAxiosGet("/boards/");
    const [userBoards, projectBoards] = filterBoards(boards);

    if (!boards) return null;

    return (
        <>
            <div className="home-wrapper">
                <HomeSidebar
                    setShowTeamModal={setShowTeamModal}
                    projects={projects || []}
                />
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
                    <div className="home__boards">
                        {userBoards.map((board) => (
                            <HomeBoard board={board} key={uuidv4()} />
                        ))}
                    </div>

                    {projectBoards.map((project) => (
                        <React.Fragment key={uuidv4()}>
                            <div className="home__section">
                                <p className="home__title">
                                    <i className="fal fa-users"></i>{" "}
                                    {project.title}
                                </p>
                                <div>
                                    <Link
                                        className="btn btn--secondary"
                                        to={`/p/${project.id}?tab=2`}
                                    >
                                        <i className="fal fa-user"></i> Members
                                    </Link>
                                    <Link
                                        className="btn btn--secondary"
                                        to={`/p/${project.id}`}
                                    >
                                        <i className="fal fa-cogs"></i> Settings
                                    </Link>
                                    <button className="btn">
                                        <i className="fal fa-plus"></i> Create
                                    </button>
                                </div>
                            </div>
                            <div className="home__boards">
                                {project.boards.map((board) => (
                                    <HomeBoard board={board} key={uuidv4()} />
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            {showTeamModal && (
                <CreateTeamModal
                    setShowModal={setShowTeamModal}
                    addProject={addProject}
                />
            )}
        </>
    );
};

export default Home;
