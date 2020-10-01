import React from 'react';
import bgImage from '../static/img/bg1.jpg';
import LandingHeader from '../components/headers/LandingHeader';

const Landing = () => {
	return (
		<>
			<LandingHeader />
			<div className="landing-banner">
				<img className="landing-banner__image" src={bgImage} />
				<div className="landing-banner__content">
					<h1 className="landing-banner__title">Trello lets you work more collaboratively and get more done</h1>
					<h4 className="landing-banner__subtitle">Trello's boards, lists, and cards enable you to organize and prioritize your projects in a fun, flexible, and rewarding way.</h4>
					<a className="btn">
						Sign Up For Free
					</a>
				</div>
			</div>
		</>
	);
}

export default Landing;