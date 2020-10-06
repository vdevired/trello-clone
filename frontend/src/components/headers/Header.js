import React, {useState, useRef, useEffect, useContext} from 'react';
import logo from '../../static/img/logo2.png';
import SearchModal from '../modals/SearchModal';
import ProfilePic from '../boards/ProfilePic';

import globalContext from "../../context/globalContext";

const Header = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const searchElem = useRef(null);
	const {user} = useContext(globalContext);

	useEffect(() => {
		if (searchQuery !== "") setShowSearch(true);
		else if (searchQuery === "" && showSearch) setShowSearch(false);
	}, [searchQuery])
	
	return (
		<>
			<header className="header">
	            <div className="header__section">
	                <ul className="header__list">
	                    <li className="header__li">
	                        <a>
	                        	<i className="fab fa-trello"></i> Boards
	                        </a>
	                    </li>
	                    <li 
	                    	className={`header__li header__li--search${searchQuery !== "" ? ' header__li--active' : ''}`}
	                    	ref={searchElem}
	                    >
	                        <i className="far fa-search"></i> <input type="text" placeholder="Search" onChange={e => setSearchQuery(e.target.value)}/>
	                    </li>
	                </ul>
	            </div>
	            <div className="header__section">
	                <img className="header__logo" src={logo} />
	            </div>
	            <div className="header__section">
	                <ul className="header__list">
	                    <li className="header__li header__li--profile">
	                        <ProfilePic user={user} header={true}/>
	                        Hello, {user.full_name.replace(/ .*/,'')}
	                    </li>
	                    <li className="header__li">
	                        <a>
	                        	<i className="fal fa-bell"></i>
	                        </a>
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
	        {showSearch &&
	        	<SearchModal searchQuery={searchQuery} searchElem={searchElem} setShowModal={setShowSearch}/>
	    	}
        </>
	);
}

export default Header;