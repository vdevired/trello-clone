import React, {useEffect, useState, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid';

import {timeSince, modalBlurHandler} from '../../static/js/util';
import Labels from '../boards/Labels';
import ProfilePic from '../boards/ProfilePic';

const EditCardModal = ({card, setShowModal}) => {
	const [editingDescription, setEditingDescription] = useState(false);
	
	useEffect(modalBlurHandler(setShowModal), []);

	const modalElem = useRef(null);
	const handleHideDescriptionForm = (e) => {
		if (!modalElem.current) return;
		const descForm = modalElem.current.querySelector(".edit-modal__form");
		if (!descForm.contains(e.target)) setEditingDescription(false);
	}
	useEffect(() => {
		if (editingDescription && modalElem.current) {
			modalElem.current.addEventListener("click", handleHideDescriptionForm);
		}
		else {
			modalElem.current.removeEventListener("click", handleHideDescriptionForm);
		}
	}, [editingDescription])
	
	return (
		<div className="edit-modal" ref={modalElem}>
			<button className="edit-modal__exit" onClick={() => setShowModal(false)}>
	        	<i className="fal fa-times"></i>
	        </button>
			<div className="edit-modal__cols">
				<div className="edit-modal__left">
					<Labels labels={card.labels} />
					<div className="edit-modal__title">{card.title}</div>
					<div className="edit-modal__subtitle">in list <span>{card.list}</span></div>

					<div className="edit-modal__section-header">
						<div><i className="fal fa-file-alt"></i> Description</div>
						{card.description !== "" &&
							<div><a className="btn btn--secondary btn--small"><i className="fal fa-pencil"></i> Edit</a></div>
						}
					</div>

					{card.description !== "" ? 
							<p className="edit-modal__description">
								{card.description}
							</p> :
							editingDescription ? 
							<div className="edit-modal__form">
								<textarea placeholder="Add description..."></textarea>
								<a className="btn btn--small">Save</a>
							</div> :
							<button 
								className="btn btn--secondary btn--small btn--description"
								onClick={() => setEditingDescription(true)}
							>
								Add description
							</button>
					}

					<div className="edit-modal__section-header" style={card.attachments.length === 0 && {marginBottom : "1.75em"}}>
						<div><i className="fal fa-paperclip"></i> Attachments</div>
						<div><a className="btn btn--secondary btn--small"><i className="fal fa-plus"></i> Add</a></div>
					</div>

					<Attachments attachments={card.attachments} />

					<div className="edit-modal__form" style={card.comments.length === 0 && {marginBottom : 0}}>
						<textarea placeholder="Leave a comment..."></textarea>
						<a className="btn btn--small">Comment</a>
					</div>

					<Comments comments={card.comments} />
				</div>

				<div className="edit-modal__right">
					<div className="edit-modal__section-header">
						<div>Actions</div>
					</div>

					<ul className="edit-modal__actions">
						<li><a className="btn btn--secondary btn--small"><i className="fal fa-tags"></i> Edit Labels</a></li>
						<li><a className="btn btn--secondary btn--small"><i className="fal fa-user"></i> Change Members</a></li>
						<li><a className="btn btn--secondary btn--small"><i className="fal fa-arrow-right"></i> Move</a></li>
						<li><a className="btn btn--secondary btn--small"><i className="fal fa-clock"></i> Change Due Date</a></li>
						<li><a className="btn btn--secondary btn--small"><i className="fal fa-image"></i> Cover</a></li>
					</ul>

					<Members members={card.assigned_to} />
				</div>
			</div>
		</div>
	);
}

const Attachments = ({attachments}) => (
	attachments.length !== 0 &&
		<ul className="edit-modal__attachments">	
			{attachments.map(attachment => (
				<li key={uuidv4()}>
					<div className="attachment">
						<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/512px-Typescript_logo_2020.svg.png" />
						<div className="attachment__content">
							<div className="attachment__subtitle">{timeSince(attachment.created_at)}</div>
							<div className="attachment__title">{attachment.title}</div>
							<div className="attachment__buttons">
								<a className="btn btn--secondary btn--small">Download</a>
								<a className="btn btn--secondary btn--small">Delete</a>
							</div>
						</div>
					</div>
				</li>
			))}
		</ul>
)

const Comments = ({comments}) => (
	comments.length !== 0 &&
		<ul className="edit-modal__comments">
			{comments.map(comment => (
				<li key={uuidv4()}>
					<div className="comment">
						<div className="comment__header">
							<div className="comment__header-left">
									<ProfilePic user={comment.author} />
									<div className="comment__info">
										<p>{comment.author.full_name}</p>
										<p>{timeSince(comment.created_at)}</p>
									</div>
							</div>
							<div className="comment__header-right">
								<a>Edit</a> - <a>Delete</a>
							</div>
						</div>
						<div className="comment__content">
							{comment.content}
						</div>
					</div>
				</li>
			))}
		</ul>
)

const Members = ({members}) => (
	members.length !== 0 &&
		<>
			<div className="edit-modal__section-header">
				<div>Members</div>
			</div>
			<ul className="edit-modal__members">
				{members.map(member => (
					<li key={uuidv4()}>
						<ProfilePic user={member} />
						<p>{member.full_name}</p>
					</li>
				))}
			</ul>
		</>
)

export default EditCardModal;