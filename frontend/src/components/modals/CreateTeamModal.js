import React from 'react';
import board from '../../static/img/board.svg';
import greenface from '../../static/img/greenface.svg';

import { useForm } from "react-hook-form";

const CreateTeamModal = ({setShowModal}) => {
	const { register, handleSubmit, errors, watch } = useForm();
	const nameValue = watch("name", "");
  	
  	const onSubmit = data => {
  		console.log(data);
  		setShowModal(false);
  	}

	return (
		<div className="create-team">
		    <div className="create-team__form">
		        <p className="create-team__title">
		            Start a Project
		        </p>
		        <p className="create-team__subtitle">
		            Boost your productivity by making it easier for everyone to access boards in one location.
		        </p>

		        <form onSubmit={handleSubmit(onSubmit)}>
		            <label htmlFor="name">Project Name</label>
		            <input 
		            	name="name"
		            	ref={register({ required: true })} 
		            	type="text" 
		            	placeholder="The Boys" 
	            	/>

		            <label htmlFor="description">Project Description</label>
		            <textarea 
		            	name="description"
		            	ref={register} 
		            	placeholder="Get your members on board with a few words about your project">
		            </textarea>

		            <label htmlFor="members">Invite Members</label>
		            <input 
		            	name="members"
		            	ref={register} 
		            	type="text" 
		            	placeholder="Type in username or email" 
	            	/>

		            {nameValue.trim() !== "" ? 
		            	<button type="submit" className="btn">Create Project</button> :
		            	<button className="btn btn--disabled" disabled>Create Project</button>
		        	}
		        </form>
		    </div>
		    <div className="create-team__bg">
		        <button onClick={() => setShowModal(false)}>
		        	<i className="fal fa-times"></i>
		        </button>
		        <img className="create-team__img" src={board} />
		        <img className="create-team__face create-team__face--1" src={greenface} />
		    </div>
		</div>
	);
}

export default CreateTeamModal;