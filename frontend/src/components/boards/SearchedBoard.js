import React from 'react';

const getTotalCards = lists => {
	let res = 0;
	for (let i = 0; i < lists.length; i++) {
		res += lists[i].cards.length;
	}
	return res;
}

const SearchedBoard = ({board}) => (
	<div class="searched-board searched-board--red">
        <p>{board.title}</p>
        <div class="searched-board__subtitle">
            <p>{`${board.lists.length} ${board.lists.length === 1 ? 'list' : 'lists'}`}</p>
            <p>{`${getTotalCards(board.lists)} ${getTotalCards(board.lists) === 1 ? 'card' : 'cards'}`}</p>
        </div>
    </div>
)

export default SearchedBoard;