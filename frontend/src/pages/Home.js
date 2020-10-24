import React, { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import AddBoardModal from "../components/modals/AddBoardModal";
import HomeSidebar from "../components/sidebars/HomeSidebar";
import HomeBoard from "../components/boards/HomeBoard";
import CreateTeamModal from "../components/modals/CreateTeamModal";
import useAxiosGet from "../hooks/useAxiosGet";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { filterBoards } from "../static/js/board";

const Home = () => {
    useDocumentTitle("Boards | Trello");
    const [showAddBoardModal, setShowAddBoardModal] = useState(false);
    const [boardProject, setBoardProject] = useState(0); // If 0, we are making a personal board. Else, making board for project with given ID
    const [showTeamModal, setShowTeamModal] = useState(false);
    const { data: projects, addItem: addProject } = useAxiosGet("/projects/");
    const {
        data: boards,
        addItem: addBoard,
        replaceItem: replaceBoard,
    } = useAxiosGet("/boards/"); // replaceBoard when you star or unstar
    const { data: recentlyViewedBoards } = useAxiosGet("/boards/?sort=recent");
    const [userBoards, projectBoards, starredBoards] = filterBoards(boards);

    if (!boards) return null;

    return (
        <>
            <div className="home-wrapper">
                <HomeSidebar
                    setShowTeamModal={setShowTeamModal}
                    projects={projects || []}
                />
                <div className="home">
                    {starredBoards.length !== 0 && (
                        <>
                            <div className="home__section">
                                <p className="home__title">
                                    <i className="fal fa-star"></i> Starred
                                    Boards
                                </p>
                            </div>
                            <div className="home__boards">
                                {starredBoards.map((board) => (
                                    <HomeBoard
                                        board={board}
                                        replaceBoard={replaceBoard}
                                        key={uuidv4()}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {(recentlyViewedBoards || []).length !== 0 &&
                        starredBoards.length === 0 && (
                            <>
                                <div className="home__section">
                                    <p className="home__title">
                                        <i className="fal fa-clock"></i>{" "}
                                        Recently Viewed
                                    </p>
                                </div>
                                <div className="home__boards">
                                    {recentlyViewedBoards.map((board) => (
                                        <HomeBoard
                                            board={board}
                                            replaceBoard={replaceBoard}
                                            key={uuidv4()}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                    <div className="home__section">
                        <p className="home__title">
                            <i className="fal fa-user"></i> Personal Boards
                        </p>
                        <button
                            className="btn"
                            onClick={() => {
                                setBoardProject(0);
                                setShowAddBoardModal(true);
                            }}
                        >
                            <i className="fal fa-plus"></i> Create
                        </button>
                    </div>
                    <div className="home__boards">
                        {userBoards.map((board) => (
                            <HomeBoard
                                board={board}
                                replaceBoard={replaceBoard}
                                key={uuidv4()}
                            />
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
                                        to={`/p/${project.id}`}
                                    >
                                        <i className="fab fa-trello"></i> Boards
                                    </Link>
                                    <Link
                                        className="btn btn--secondary"
                                        to={`/p/${project.id}?tab=2`}
                                    >
                                        <i className="fal fa-user"></i> Members
                                    </Link>
                                    <Link
                                        className="btn btn--secondary"
                                        to={`/p/${project.id}?tab=3`}
                                    >
                                        <i className="fal fa-cogs"></i> Settings
                                    </Link>
                                    <a
                                        className="btn"
                                        onClick={() => {
                                            setBoardProject(project.id);
                                            setShowAddBoardModal(true);
                                        }}
                                    >
                                        <i className="fal fa-plus"></i> Create
                                    </a>
                                </div>
                            </div>
                            <div className="home__boards">
                                {project.boards.map((board) => (
                                    <HomeBoard
                                        board={board}
                                        replaceBoard={replaceBoard}
                                        key={uuidv4()}
                                    />
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
            {showAddBoardModal && (
                <AddBoardModal
                    setShowAddBoardModal={setShowAddBoardModal}
                    addBoard={addBoard}
                    project={boardProject}
                />
            )}
        </>
    );
};

export default Home;
