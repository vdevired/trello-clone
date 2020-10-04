import React from 'react';

const HomeSidebar = () => {
	return (
		<div className="home-menu">
            <ul>
                <li>
                    <a className="btn btn--transparent btn--small btn--active">
                        <i className="fab fa-trello"></i> Boards
                    </a>
                </li>
                <li>
                    <a className="btn btn--transparent btn--small">
                        <i className="fal fa-ruler-triangle"></i> Templates
                    </a>
                </li>
                <li>
                    <a className="btn btn--transparent btn--small">
                        <i className="fal fa-newspaper"></i> Feed
                    </a>
                </li>
            </ul>

            <div className="home-menu__section">
                <p className="home-menu__title">Projects</p>
                <a className="btn btn--transparent btn--small">
                    <i className="fal fa-plus"></i>
                </a>
            </div>
            <ul>
                <li>
                    <a className="btn btn--transparent btn--small">
                        <i className="fal fa-users"></i> The Boys
                    </a>
                </li>
            </ul>
        </div>
	);
}

export default HomeSidebar()