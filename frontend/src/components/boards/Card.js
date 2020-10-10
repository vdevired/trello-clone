import React, {useState, useEffect, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid';

import {modalBlurHandler} from '../../static/js/util';
import Labels from './Labels';
import ProfilePic from './ProfilePic';
import EditCardModal from '../modals/EditCardModal';
import LabelModal from '../modals/LabelModal';

const Card = ({card}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showLabelModal, setShowLabelModal] = useState(false);

	const cardElem = useRef(null);

	const handleState = e => {
		if (!cardElem.current.contains(e.target)) setIsEditing(false);
		else if (e.target.className.includes("pen")) setIsEditing(true);
		else if (e.target.closest('.card__edit-controls')) setIsEditing(true);
		else setShowEditModal(true);
	}

	useEffect(() => {
		if (!cardElem.current) return;
		document.addEventListener("click", handleState);

		return () => {
			document.removeEventListener("click", handleState);
		}
	}, [cardElem])

	return (
		<>
			<div 
				className={`card${card.image ? ' card--image' : ''}${isEditing ? ' card--edit' : ''}`}
				ref={cardElem}
			>
				{card.image && 
					<div className="card__image">
			    		<img src={card.image} />
			    	</div>
				}
		    	<div>
		            {!isEditing &&
		            	<button className="card__pen"><i className="fal fa-pen"></i></button>
		            }
		            <Labels labels={card.labels} />
		            {isEditing ? 
		            	<input 
		            		className="card__title-edit" type="text" value={card.title} 
		            		ref={el => {if (el) {el.focus(); el.select();}}}/> :
		            	<p className="card__title">{card.title}</p>
		            }
		            {card.attachments?.length !== 0 &&
		            	<p className="card__subtitle">
			                <i className="fal fa-paperclip"></i> {card.attachments.length}
			            </p>
			        }
			        <Members members={card.assigned_to} />
			        {isEditing && <EditControls cardElem={cardElem} setShowModal={setIsEditing} setShowLabelModal={setShowLabelModal}/>}
		        </div>
		    </div>
		    {showEditModal && <EditCardModal card={card} setShowModal={setShowEditModal} />}
		    {showLabelModal && <LabelModal cardElem={cardElem} setShowModal={setShowLabelModal} />}
	    </>
	);
}

const Members = ({members}) => (
	 <div className="card__members">
        <div className="member member--add">
            <i className="fal fa-plus"></i>
        </div>
        {members.map(member => (
        	<ProfilePic user={member} key={uuidv4()} />
        ))}
    </div>
)

export const getEditControlsSidePosition = (cardElem, offset=0) => { // pass in ref.current
	if (!cardElem) return null;
	return {
		top: cardElem.getBoundingClientRect().y + offset + "px",
		left : cardElem.getBoundingClientRect().x + cardElem.getBoundingClientRect().width + 10 + "px"
	}
}

const EditControls = ({cardElem, setShowModal, setShowLabelModal}) => {
	useEffect(modalBlurHandler(setShowModal), []);
	return (
		<div className="card__edit-controls">
			<a className="btn">Save</a>
			<ul className="card__edit-controls-side" style={getEditControlsSidePosition(cardElem.current)}>
				<li><button onClick={() => setShowLabelModal(true)}><i className="fal fa-tags"></i> Edit Labels</button></li>
				<li><i className="fal fa-user"></i> Change Members</li>
				<li><i className="fal fa-arrow-right"></i> Move</li>
				<li><i className="fal fa-clock"></i> Change Due Date</li>
			</ul>
		</div>
	);
}

export default Card;