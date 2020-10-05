import React, {useEffect} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {modalBlurHandler} from '../../static/js/util';

import Card from '../boards/Card';
import SearchedBoard from '../boards/SearchedBoard';

const getSearchSuggestionsPosition = (searchElem) => {
	if (!searchElem) return null;
	return {
		top: searchElem.getBoundingClientRect().y + searchElem.getBoundingClientRect().height + 10 + "px",
		left : searchElem.getBoundingClientRect().x + "px"
	}
}

const SearchModal = ({searchQuery, searchElem, setShowModal}) => {
	const cards = [];
	const boards = [];

	useEffect(modalBlurHandler(setShowModal), []);

	return (
		<div className="search-suggestions" style={getSearchSuggestionsPosition(searchElem.current)}>
		    <p className="search-suggestions__title">Cards</p>
		    <ul className="search-suggestions__cards">
		        {cards.map(card => (
		        	<Card card={card} />
		        ))}
		    </ul>

		    <p className="search-suggestions__title">Boards</p>
		    <ul className="search-suggestions__boards">
		        {boards.map(board => (
		        	<SearchedBoard board={board} />
		        ))}
		    </ul>
		</div>
	);
}

export default SearchModal;