import React from 'react';
import { Link } from "react-router-dom";

const SearchedBoard = ({board, setShowModal}) => (

    <Link onClick={() => setShowModal(false)} to={`/b/${board.id}`} class="searched-board searched-board--red">
        <p>{board.title}</p>
        <div class="searched-board__subtitle">
            <p>{`${board.list_count} ${board.list_count === 1 ? 'list' : 'lists'}`}</p>
            <p>{`${board.item_count} ${board.item_count === 1 ? 'card' : 'cards'}`}</p>
        </div>
    </Link>

)

export default SearchedBoard;